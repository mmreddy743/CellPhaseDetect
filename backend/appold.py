from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import os
import numpy as np
import matplotlib.pyplot as plt
from nd2reader import ND2Reader
from skimage.filters import threshold_otsu, gaussian
from skimage.morphology import remove_small_objects, binary_closing, disk, binary_opening
from skimage.measure import label, regionprops
from scipy import ndimage as ndi
import pandas as pd
from typing import Dict, Tuple, List, Optional
import shutil
import logging
from datetime import datetime

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('app.log'),
        logging.StreamHandler()
    ]
)

app = Flask(__name__, static_folder='static')
CORS(app, resources={r"/*": {"origins": "*"}})

# Add route to serve static files
@app.route('/static/<path:path>')
def send_static(path):
    return send_file(f'static/{path}')

# Constants
UPLOAD_FOLDER = './static/uploads'
RESULTS_FOLDER = './static/results'
MAX_FILE_SIZE = 1000 * 1024 * 1024  # 1000MB limit

def setup_folders() -> None:
    """Create necessary folders and clean old files."""
    try:
        for folder in [UPLOAD_FOLDER, RESULTS_FOLDER]:
            if os.path.exists(folder):
                shutil.rmtree(folder)
            os.makedirs(folder)
        logging.info("Folders setup completed successfully")
    except Exception as e:
        logging.error(f"Error setting up folders: {str(e)}")
        raise

def cleanup_old_files(max_age_hours: int = 1) -> None:
    """Clean up files older than specified hours."""
    try:
        current_time = datetime.now().timestamp()
        for folder in [UPLOAD_FOLDER, RESULTS_FOLDER]:
            if os.path.exists(folder):
                for filename in os.listdir(folder):
                    filepath = os.path.join(folder, filename)
                    if os.path.getctime(filepath) < (current_time - max_age_hours * 3600):
                        os.remove(filepath)
                        logging.info(f"Cleaned up old file: {filepath}")
    except Exception as e:
        logging.error(f"Error during cleanup: {str(e)}")

def enhance_contrast(image: np.ndarray, saturated: float = 0.2) -> np.ndarray:
    """
    Enhance contrast using ImageJ's method with input validation.
    
    Args:
        image: Input image array
        saturated: Saturation percentage (0-100)
        
    Returns:
        Enhanced image array
    """
    try:
        if not isinstance(image, np.ndarray):
            raise ValueError("Input must be a numpy array")
        if not (0 <= saturated <= 100):
            raise ValueError("Saturated value must be between 0 and 100")
        
        p_low, p_high = np.percentile(image, (saturated, 100 - saturated))
        if p_high == p_low:
            return np.zeros_like(image)
        return np.clip((image - p_low) / (p_high - p_low), 0, 1)
    except Exception as e:
        logging.error(f"Error in contrast enhancement: {str(e)}")
        raise

def segment_nuclei_perfect(
    image: np.ndarray,
    min_size: int = 400,
    max_size: int = 10000
) -> Tuple[np.ndarray, np.ndarray]:
    """
    Perform nuclear segmentation with parameter validation.
    
    Args:
        image: Input image array
        min_size: Minimum object size
        max_size: Maximum object size
        
    Returns:
        Tuple of (binary mask, labeled image)
    """
    try:
        if not isinstance(image, np.ndarray):
            raise ValueError("Input must be a numpy array")
        if min_size >= max_size:
            raise ValueError("min_size must be less than max_size")
        
        image_enhanced = enhance_contrast(image)
        smoothed = gaussian(image_enhanced, sigma=1.0)
        thresh = threshold_otsu(smoothed)
        binary = smoothed > thresh
        binary = binary_opening(binary, disk(2))
        binary = binary_closing(binary, disk(3))
        binary = ndi.binary_fill_holes(binary)
        cleaned = remove_small_objects(binary, min_size=min_size)
        labeled = label(cleaned)
        props = regionprops(labeled)
        
        valid_labels = [
            prop.label for prop in props 
            if min_size <= prop.area <= max_size and prop.eccentricity < 0.85
        ]
        
        if not valid_labels:
            raise ValueError("No valid nuclei found after segmentation")
            
        final_mask = np.isin(labeled, valid_labels)
        final_labeled = label(final_mask)
        return final_mask, final_labeled
        
    except Exception as e:
        logging.error(f"Segmentation failed: {str(e)}")
        raise

def generate_visualization(channel_data: Dict, output_path: str) -> None:
    """
    Generate visualization of the results for all channels.
    
    Args:
        channel_data: Dictionary containing processed channel data
        output_path: Path to save the visualization
    """
    try:
        n_channels = len(channel_data)
        fig, axes = plt.subplots(n_channels, 3, figsize=(15, 5 * n_channels))
        
        # Handle single channel case
        if n_channels == 1:
            axes = axes.reshape(1, -1)
            
        for idx, (channel, data) in enumerate(channel_data.items()):
            # Original image
            axes[idx, 0].imshow(data['original'], cmap='gray')
            axes[idx, 0].set_title(f'{channel} - Original')
            axes[idx, 0].axis('off')
            
            # Show segmentation if available (for DAPI)
            if data['mask'] is not None:
                axes[idx, 1].imshow(data['mask'], cmap='gray')
                axes[idx, 1].set_title(f'{channel} - Segmented')
            else:
                axes[idx, 1].imshow(np.zeros_like(data['original']), cmap='gray')
                axes[idx, 1].set_title(f'{channel} - No Segmentation')
            axes[idx, 1].axis('off')
            
            # Show ROIs if available
            axes[idx, 2].imshow(data['original'], cmap='gray')
            if data['labeled'] is not None:
                for region in regionprops(data['labeled']):
                    y, x = region.centroid
                    axes[idx, 2].text(x, y, str(region.label), 
                                    color='red', fontsize=8, 
                                    ha='center', va='center')
                axes[idx, 2].set_title(f'{channel} - ROIs')
            else:
                axes[idx, 2].set_title(f'{channel} - No ROIs')
            axes[idx, 2].axis('off')
            
        plt.tight_layout()
        plt.savefig(output_path, dpi=300, bbox_inches='tight')
        plt.close(fig)
        logging.info(f"Visualization saved to {output_path}")
        
    except Exception as e:
        logging.error(f"Error generating visualization: {str(e)}")
        raise

def process_all_channels(file_path: str) -> Dict:
    """
    Process all channels with enhanced error handling and proper ND2 metadata access.
    
    Args:
        file_path: Path to the ND2 file
        
    Returns:
        Dictionary containing processed channel data
        
    Raises:
        FileNotFoundError: If the file doesn't exist
        ValueError: If required channels are missing
        RuntimeError: If there are issues with file structure
    """
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"File not found: {file_path}")
        
    try:
        with ND2Reader(file_path) as images:
            # Initialize default coordinates
            images.default_coords['t'] = 0
            images.bundle_axes = 'zcyx'
            
            # Extract metadata with detailed logging
            metadata = images.metadata
            channels = metadata.get('channels', [])
            if not channels:
                logging.warning("No channels found in metadata, attempting to infer from sizes")
                channels = [f'Channel_{i}' for i in range(images.sizes.get('c', 1))]
                
            z_levels = images.sizes.get('z', 1)
            c_levels = images.sizes.get('c', 1)
            total_frames = images.sizes.get('t', 1) * z_levels * c_levels
            
            logging.info(f"File metadata: Channels={channels}, Z={z_levels}, C={c_levels}, Total frames={total_frames}")
            
            # Verify DAPI channel or find alternative
            if 'DAPI' not in channels:
                possible_dapi = [ch for ch in channels if 'dapi' in ch.lower()]
                if possible_dapi:
                    dapi_channel = possible_dapi[0]
                    logging.info(f"Found alternative DAPI channel: {dapi_channel}")
                    channels[channels.index(dapi_channel)] = 'DAPI'
                else:
                    logging.warning("Using first channel as reference channel")
                    channels[0] = 'DAPI'
            
            channel_data = {}
            for ch_idx, channel in enumerate(channels):
                z_stack = []
                for z in range(z_levels):
                    try:
                        # Access frame using proper multi-dimensional indexing
                        images.default_coords['z'] = z
                        images.default_coords['c'] = ch_idx
                        frame = images.get_frame_2D()
                        z_stack.append(frame)
                    except Exception as e:
                        logging.error(f"Error accessing frame for channel {channel}, z-level {z}: {str(e)}")
                        raise RuntimeError(f"Failed to access frame: channel={channel}, z={z}, error={str(e)}")
                
                projected = np.max(np.array(z_stack), axis=0)
                projected_enhanced = enhance_contrast(projected)
                
                if channel == 'DAPI':
                    mask, labeled = segment_nuclei_perfect(projected)
                    channel_data[channel] = {
                        'original': projected_enhanced,
                        'mask': mask,
                        'labeled': labeled
                    }
                else:
                    channel_data[channel] = {
                        'original': projected_enhanced,
                        'mask': None,
                        'labeled': None
                    }
            
            return channel_data
            
    except Exception as e:
        logging.error(f"Error processing channels: {str(e)}")
        raise

@app.route('/upload', methods=['POST'])
def upload_file():
    """Handle file uploads with improved error handling and validation."""
    try:
        if 'file' not in request.files:
            return jsonify({"error": "No file provided"}), 400
            
        file = request.files['file']
        if not file.filename:
            return jsonify({"error": "Empty filename"}), 400
            
        if not file.filename.endswith('.nd2'):
            return jsonify({"error": "Only .nd2 files are allowed"}), 400
            
        if request.content_length > MAX_FILE_SIZE:
            return jsonify({"error": "File size exceeds limit"}), 413
            
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        safe_filename = f"{timestamp}_{os.path.basename(file.filename)}"
        file_path = os.path.join(UPLOAD_FOLDER, safe_filename)
        
        file.save(file_path)
        logging.info(f"File saved: {file_path}")
        
        channel_data = process_all_channels(file_path)
        
        # Generate measurements with error handling
        try:
            measurements = []
            ref_channel = 'DAPI'
            regions = regionprops(
                channel_data[ref_channel]['labeled'],
                intensity_image=channel_data[ref_channel]['original']
            )
            
            for region in regions:
                measurements.append({
                    'ROI': region.label,
                    'Area': region.area,
                    'Mean_Intensity': region.mean_intensity,
                    'Perimeter': region.perimeter,
                    'Eccentricity': region.eccentricity
                })
                
            measurements_file = os.path.join(
                RESULTS_FOLDER,
                f'measurements_{timestamp}.csv'
            )
            pd.DataFrame(measurements).to_csv(measurements_file, index=False)
            
            visualization_path = os.path.join(
                RESULTS_FOLDER,
                f'visualization_{timestamp}.png'
            )
            generate_visualization(channel_data, visualization_path)
            
            return jsonify({
                "visualization_url": f"http://127.0.0.1:5000/static/results/visualization_{timestamp}.png",
                "measurements_url": f"http://127.0.0.1:5000/static/results/measurements_{timestamp}.csv",
                "message": "Processing completed successfully",
                "nuclei_count": len(regions)
            }), 200
            
        except Exception as e:
            logging.error(f"Error generating measurements: {str(e)}")
            return jsonify({"error": "Error generating measurements"}), 500
            
    except Exception as e:
        logging.error(f"Upload error: {str(e)}")
        return jsonify({"error": str(e)}), 500
    finally:
        cleanup_old_files()

if __name__ == '__main__':
    setup_folders()
    app.run(debug=True)