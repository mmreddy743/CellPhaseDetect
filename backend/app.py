import matplotlib
matplotlib.use('Agg')  # Set the backend before importing pyplot
import matplotlib.pyplot as plt
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import os
import numpy as np
from nd2reader import ND2Reader
from skimage.filters import threshold_otsu, gaussian
from skimage.morphology import remove_small_objects, binary_closing, disk, binary_opening
from skimage.measure import label, regionprops, regionprops_table
from skimage.segmentation import watershed
from scipy import ndimage as ndi
import pandas as pd
import logging
from datetime import datetime
from werkzeug.utils import secure_filename

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('app.log'),
        logging.StreamHandler()
    ]
)

app = Flask(__name__)
CORS(app)

# Constants
UPLOAD_FOLDER = './static/uploads'
RESULTS_FOLDER = './static/results'
MAX_FILE_SIZE = 1000 * 1024 * 1024  # 1000MB limit
ALLOWED_EXTENSIONS = {'.nd2'}

def setup_folders():
    """Create necessary folders and clean old files."""
    for folder in [UPLOAD_FOLDER, RESULTS_FOLDER]:
        os.makedirs(folder, exist_ok=True)
        
        # Clean old files (older than 24 hours)
        for filename in os.listdir(folder):
            filepath = os.path.join(folder, filename)
            if os.path.getmtime(filepath) < datetime.now().timestamp() - 86400:
                try:
                    os.remove(filepath)
                except Exception as e:
                    logging.warning(f"Could not remove old file {filepath}: {e}")

def segment_nuclei_imagej_style(image):
    """
    Segment nuclei using improved approach with Fiji-like parameters
    """
    try:
        # Normalize image to 0-1 range
        image_norm = (image - image.min()) / (image.max() - image.min())
        
        # Apply Gaussian smoothing similar to Fiji's default
        smoothed = gaussian(image_norm, sigma=2)
        
        # Use percentile-based thresholding
        p90 = np.percentile(smoothed, 90)
        binary = smoothed > (p90 * 0.5)
        
        # Apply morphological operations to clean up segmentation
        binary = binary_closing(binary, disk(3))
        binary = binary_opening(binary, disk(2))
        binary = ndi.binary_fill_holes(binary)
        
        # Remove small objects - use Fiji's default minimum size
        cleaned = remove_small_objects(binary, min_size=50)
        
        return cleaned
    except Exception as e:
        logging.error(f"Segmentation error: {str(e)}")
        raise

def analyze_particles_fiji_style(binary_mask, min_size=50, max_size=None, min_circularity=0.0):
    """
    Analyze particles using Fiji-like parameters
    """
    try:
        # Label connected components
        labeled = label(binary_mask)
        
        # Get region properties
        props = regionprops(labeled)
        
        # Create new labeled image
        new_labeled = np.zeros_like(labeled)
        for i, region in enumerate(props, 1):
            if region.area >= min_size:
                new_labeled[labeled == region.label] = i
        
        return new_labeled
    except Exception as e:
        logging.error(f"Particle analysis error: {str(e)}")
        raise

def analyze_channels(file_path):
    """
    Process all channels with nuclear segmentation
    """
    try:
        with ND2Reader(file_path) as images:
            metadata = images.metadata
            channels = metadata.get('channels', [])
            z_levels = images.sizes.get('z', 1)
            
            if not channels:
                channels = [f'Channel_{i}' for i in range(images.sizes.get('c', 1))]
            
            # Ensure DAPI channel exists
            if 'DAPI' not in channels:
                channels[0] = 'DAPI'
            
            channel_data = {}
            dapi_idx = channels.index('DAPI')
            
            # First process DAPI to get nuclear mask
            dapi_stack = []
            for z in range(z_levels):
                images.default_coords['z'] = z
                images.default_coords['c'] = dapi_idx
                dapi_stack.append(images.get_frame_2D())
            
            # Use robust max projection
            dapi_projected = np.max(np.array(dapi_stack), axis=0)
            
            # Get nuclear mask from DAPI
            nuclear_mask = segment_nuclei_imagej_style(dapi_projected)
            
            # Analyze particles Fiji-style
            nuclear_labeled = analyze_particles_fiji_style(
                nuclear_mask,
                min_size=50,  # Fiji's default
                min_circularity=0.0  # Fiji's default
            )
            
            # Process all channels
            for ch_idx, channel in enumerate(channels):
                z_stack = []
                for z in range(z_levels):
                    images.default_coords['z'] = z
                    images.default_coords['c'] = ch_idx
                    z_stack.append(images.get_frame_2D())
                
                projected = np.max(np.array(z_stack), axis=0)
                
                # Use robust normalization
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

def generate_visualization(channel_data, output_path):
    """
    Generate visualization with improved error handling
    """
    plt.ioff()  # Turn off interactive mode
    fig = None
    try:
        n_channels = len(channel_data)
        fig = plt.figure(figsize=(15, 5 * n_channels))
        
        for idx, (channel, data) in enumerate(channel_data.items()):
            # Original
            ax1 = fig.add_subplot(n_channels, 3, idx*3 + 1)
            ax1.imshow(data['original'], cmap='gray')
            ax1.set_title(f'{channel} - Original')
            ax1.axis('off')
            
            # Binary mask
            ax2 = fig.add_subplot(n_channels, 3, idx*3 + 2)
            ax2.imshow(data['mask'], cmap='gray')
            ax2.set_title(f'{channel} - Segmented')
            ax2.axis('off')
            
            # Labeled image with ROIs
            ax3 = fig.add_subplot(n_channels, 3, idx*3 + 3)
            ax3.imshow(data['original'], cmap='gray')
            
            # Add ROI numbers
            if 'labeled' in data:
                for region in regionprops(data['labeled']):
                    y, x = region.centroid
                    ax3.text(x, y, str(region.label),
                            color='red', fontsize=8,
                            ha='center', va='center',
                            bbox=dict(facecolor='black', alpha=0.5))
                ax3.set_title(f'{channel} - ROIs')
            else:
                ax3.set_title(f'{channel} - No ROIs')
            ax3.axis('off')
        
        plt.tight_layout()
        fig.savefig(output_path, dpi=300, bbox_inches='tight')
        plt.close(fig)
        
    except Exception as e:
        logging.error(f"Visualization error: {str(e)}")
        if fig:
            plt.close(fig)
        raise

@app.route('/upload', methods=['POST'])
def upload_file():
    """Handle file upload with comprehensive error handling."""
    try:
        if 'file' not in request.files:
            return jsonify({"error": "No file provided"}), 400
            
        file = request.files['file']
        if not file.filename:
            return jsonify({"error": "Empty filename"}), 400
            
        if not any(file.filename.lower().endswith(ext) for ext in ALLOWED_EXTENSIONS):
            return jsonify({"error": "Invalid file type"}), 400
            
        if request.content_length > MAX_FILE_SIZE:
            return jsonify({"error": "File too large"}), 413
            
        # Create timestamp and save file
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = secure_filename(f"{timestamp}_{file.filename}")
        file_path = os.path.join(UPLOAD_FOLDER, filename)
        
        file.save(file_path)
        logging.info(f"File saved: {file_path}")
        
        # Process channels
        channel_data = analyze_channels(file_path)
        
        # Generate measurements for DAPI channel
        measurements = []
        dapi_data = channel_data['DAPI']
        regions = regionprops(dapi_data['labeled'], intensity_image=dapi_data['original'])
        
        for region in regions:
            measurements.append({
                'ROI': region.label,
                'Area': region.area,
                'Mean_Intensity': region.mean_intensity,
                'Perimeter': region.perimeter,
                'Eccentricity': region.eccentricity,
                'Circularity': 4 * np.pi * region.area / (region.perimeter ** 2) if region.perimeter > 0 else 0
            })
        
        # Save results
        measurements_file = os.path.join(RESULTS_FOLDER, f'measurements_{timestamp}.csv')
        pd.DataFrame(measurements).to_csv(measurements_file, index=False)
        
        visualization_path = os.path.join(RESULTS_FOLDER, f'visualization_{timestamp}.png')
        generate_visualization(channel_data, visualization_path)
        
        # Prepare channel statistics
        channel_stats = {}
        for channel, data in channel_data.items():
            channel_stats[channel] = {
                "mean_intensity": float(np.mean(data['original'])),
                "max_intensity": float(np.max(data['original'])),
                "min_intensity": float(np.min(data['original'])),
                "std_intensity": float(np.std(data['original']))
            }
        
        return jsonify({
            "status": "success",
            "visualization_url": f"/static/results/visualization_{timestamp}.png",
            "measurements_url": f"/static/results/measurements_{timestamp}.csv",
            "message": "Processing completed successfully",
            "nuclei_count": len(measurements),
            "channel_data": channel_stats
        }), 200
            
    except Exception as e:
        logging.error(f"Upload error: {str(e)}")
        return jsonify({"error": str(e)}), 500
    finally:
        plt.close('all')

@app.route('/static/<path:filename>')
def serve_static(filename):
    """Serve static files with proper error handling."""
    try:
        if '..' in filename or filename.startswith('/'):
            abort(404)
        return send_file(os.path.join('static', filename))
    except Exception as e:
        logging.error(f"Static file error: {str(e)}")
        abort(404)

if __name__ == '__main__':
    setup_folders()
    app.run(debug=True, port=5000)