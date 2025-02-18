import matplotlib
matplotlib.use('Agg')  # Set the backend before importing pyplot
import matplotlib.pyplot as plt
from flask import Flask, request, jsonify, send_file, send_from_directory, abort
from flask_cors import CORS
import os
import numpy as np
from nd2reader import ND2Reader
from skimage.filters import gaussian
from skimage.morphology import remove_small_objects, binary_closing, disk, binary_opening
from skimage.measure import label, regionprops
from scipy import ndimage as ndi
import pandas as pd
import logging
from datetime import datetime
from werkzeug.utils import secure_filename

# ✅ Logging Configuration
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('app.log'),
        logging.StreamHandler()
    ]
)

# ✅ Initialize Flask App
app = Flask(__name__, static_folder='../frontend/build', static_url_path='/')
CORS(app)

# ✅ Constants
UPLOAD_FOLDER = './static/uploads'
RESULTS_FOLDER = './static/results'
MAX_FILE_SIZE = 1000 * 1024 * 1024  # 1000MB limit
ALLOWED_EXTENSIONS = {'.nd2'}

# ✅ Create necessary folders
def setup_folders():
    """Create folders and clean old files (> 24 hours)."""
    for folder in [UPLOAD_FOLDER, RESULTS_FOLDER, app.static_folder]:
        os.makedirs(folder, exist_ok=True)
        for filename in os.listdir(folder):
            filepath = os.path.join(folder, filename)
            if os.path.isfile(filepath) and os.path.getmtime(filepath) < datetime.now().timestamp() - 86400:
                try:
                    os.remove(filepath)
                except Exception as e:
                    logging.warning(f"Could not remove old file {filepath}: {e}")

# ✅ Serve React Frontend
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_frontend(path):
    """Serve React static files or index.html for unmatched routes."""
    full_path = os.path.join(app.static_folder, path)
    
    if path and os.path.exists(full_path):
        return send_from_directory(app.static_folder, path)
    
    return send_from_directory(app.static_folder, 'index.html')

# ✅ Serve Static Files
@app.route('/static/<path:filename>')
def serve_static(filename):
    """Serve static files with error handling."""
    file_path = os.path.join('static', filename)
    if not os.path.exists(file_path):
        abort(404)
    return send_file(file_path)

# ✅ Image Segmentation Function
def segment_nuclei(image):
    """Segment nuclei using a refined method similar to Fiji/ImageJ."""
    try:
        image_norm = (image - image.min()) / (image.max() - image.min())
        smoothed = gaussian(image_norm, sigma=2)
        p90 = np.percentile(smoothed, 90)
        binary = smoothed > (p90 * 0.5)
        binary = binary_closing(binary, disk(3))
        binary = binary_opening(binary, disk(2))
        binary = ndi.binary_fill_holes(binary)
        cleaned = remove_small_objects(binary, min_size=50)
        return cleaned
    except Exception as e:
        logging.error(f"Segmentation error: {str(e)}")
        raise

# ✅ Particle Analysis
def analyze_particles(binary_mask, min_size=50):
    """Analyze and label particles."""
    try:
        labeled = label(binary_mask)
        props = regionprops(labeled)
        new_labeled = np.zeros_like(labeled)
        for i, region in enumerate(props, 1):
            if region.area >= min_size:
                new_labeled[labeled == region.label] = i
        return new_labeled
    except Exception as e:
        logging.error(f"Particle analysis error: {str(e)}")
        raise

# ✅ ND2 Image Processing
def analyze_channels(file_path):
    """Process ND2 image channels with nuclear segmentation."""
    try:
        with ND2Reader(file_path) as images:
            metadata = images.metadata
            channels = metadata.get('channels', [])
            z_levels = images.sizes.get('z', 1)

            if not channels:
                channels = [f'Channel_{i}' for i in range(images.sizes.get('c', 1))]

            if 'DAPI' not in channels:
                channels[0] = 'DAPI'

            dapi_idx = channels.index('DAPI')
            dapi_stack = [images.get_frame_2D(z=z, c=dapi_idx) for z in range(z_levels)]
            dapi_projected = np.max(np.array(dapi_stack), axis=0)
            nuclear_mask = segment_nuclei(dapi_projected)
            nuclear_labeled = analyze_particles(nuclear_mask)

            channel_data = {}
            for ch_idx, channel in enumerate(channels):
                z_stack = [images.get_frame_2D(z=z, c=ch_idx) for z in range(z_levels)]
                projected = np.max(np.array(z_stack), axis=0)
                p2, p98 = np.percentile(projected, (2, 98))
                projected_norm = np.clip((projected - p2) / (p98 - p2), 0, 1)

                channel_data[channel] = {
                    'original': projected_norm,
                    'mask': nuclear_mask,
                    'labeled': nuclear_labeled
                }

        return channel_data
    except Exception as e:
        logging.error(f"Channel analysis error: {str(e)}")
        raise

# ✅ File Upload Route
@app.route('/upload', methods=['POST'])
def upload_file():
    """Handle file uploads and analysis."""
    try:
        if 'file' not in request.files:
            return jsonify({"error": "No file provided"}), 400

        file = request.files['file']
        if not file.filename or not any(file.filename.lower().endswith(ext) for ext in ALLOWED_EXTENSIONS):
            return jsonify({"error": "Invalid file type"}), 400

        if request.content_length > MAX_FILE_SIZE:
            return jsonify({"error": "File too large"}), 413

        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = secure_filename(f"{timestamp}_{file.filename}")
        file_path = os.path.join(UPLOAD_FOLDER, filename)
        file.save(file_path)

        logging.info(f"File saved: {file_path}")

        channel_data = analyze_channels(file_path)
        measurements = [
            {
                'ROI': region.label,
                'Area': region.area,
                'Mean_Intensity': region.mean_intensity,
                'Perimeter': region.perimeter,
                'Eccentricity': region.eccentricity,
                'Circularity': (4 * np.pi * region.area / (region.perimeter ** 2)) if region.perimeter > 0 else 0
            }
            for region in regionprops(channel_data['DAPI']['labeled'], intensity_image=channel_data['DAPI']['original'])
        ]

        results_file = os.path.join(RESULTS_FOLDER, f'measurements_{timestamp}.csv')
        pd.DataFrame(measurements).to_csv(results_file, index=False)

        return jsonify({
            "status": "success",
            "measurements_url": f"/static/results/measurements_{timestamp}.csv",
            "nuclei_count": len(measurements),
        }), 200
    except Exception as e:
        logging.error(f"Upload error: {str(e)}")
        return jsonify({"error": str(e)}), 500

# ✅ Start Flask Server
if __name__ == '__main__':
    setup_folders()
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
