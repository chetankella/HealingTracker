# Advanced image processing utilities for medical image analysis

import cv2
import numpy as np
from PIL import Image, ImageEnhance, ImageFilter
from typing import Tuple, Optional, Dict, Any
import matplotlib.pyplot as plt
from skimage import filters, segmentation, measure, morphology
from skimage.feature import local_binary_pattern
from scipy import ndimage
import logging

logger = logging.getLogger(__name__)

class MedicalImageProcessor:
    """
    Advanced medical image processing for wound analysis
    """
    
    def __init__(self):
        self.lbp_radius = 3
        self.lbp_n_points = 8 * self.lbp_radius
        
    def preprocess_image(self, image: np.ndarray, enhance: bool = True) -> np.ndarray:
        """
        Comprehensive image preprocessing pipeline
        """
        try:
            # Convert to RGB if needed
            if len(image.shape) == 3 and image.shape[2] == 3:
                if image.dtype == np.uint8:
                    image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
                else:
                    image_rgb = image
            else:
                image_rgb = image
            
            if enhance:
                # Noise reduction
                image_rgb = self._denoise_image(image_rgb)
                
                # Contrast enhancement
                image_rgb = self._enhance_contrast(image_rgb)
                
                # Color correction
                image_rgb = self._correct_colors(image_rgb)
            
            return image_rgb
            
        except Exception as e:
            logger.error(f"Error in image preprocessing: {str(e)}")
            return image
    
    def _denoise_image(self, image: np.ndarray) -> np.ndarray:
        """Advanced denoising using bilateral filter and morphological operations"""
        # Bilateral filter for edge-preserving smoothing
        denoised = cv2.bilateralFilter(image, 9, 75, 75)
        
        # Additional morphological denoising
        kernel = np.ones((3, 3), np.uint8)
        denoised = cv2.morphologyEx(denoised, cv2.MORPH_OPEN, kernel)
        
        return denoised
    
    def _enhance_contrast(self, image: np.ndarray) -> np.ndarray:
        """Enhance contrast using CLAHE (Contrast Limited Adaptive Histogram Equalization)"""
        # Convert to LAB color space
        lab = cv2.cvtColor(image, cv2.COLOR_RGB2LAB)
        
        # Apply CLAHE to L channel
        clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8, 8))
        lab[:, :, 0] = clahe.apply(lab[:, :, 0])
        
        # Convert back to RGB
        enhanced = cv2.cvtColor(lab, cv2.COLOR_LAB2RGB)
        
        return enhanced
    
    def _correct_colors(self, image: np.ndarray) -> np.ndarray:
        """Basic color correction for medical images"""
        # Convert to PIL for easier manipulation
        pil_image = Image.fromarray(image)
        
        # Enhance color balance
        enhancer = ImageEnhance.Color(pil_image)
        pil_image = enhancer.enhance(1.1)
        
        # Slight sharpening
        pil_image = pil_image.filter(ImageFilter.UnsharpMask(radius=1, percent=150, threshold=3))
        
        return np.array(pil_image)
    
    def segment_wound(self, image: np.ndarray, method: str = "adaptive") -> np.ndarray:
        """
        Advanced wound segmentation using multiple methods
        """
        try:
            if method == "adaptive":
                return self._adaptive_segmentation(image)
            elif method == "kmeans":
                return self._kmeans_segmentation(image)
            elif method == "watershed":
                return self._watershed_segmentation(image)
            else:
                return self._color_based_segmentation(image)
                
        except Exception as e:
            logger.error(f"Error in wound segmentation: {str(e)}")
            return np.zeros(image.shape[:2], dtype=np.uint8)
    
    def _adaptive_segmentation(self, image: np.ndarray) -> np.ndarray:
        """Adaptive segmentation combining multiple techniques"""
        # Convert to different color spaces
        hsv = cv2.cvtColor(image, cv2.COLOR_RGB2HSV)
        lab = cv2.cvtColor(image, cv2.COLOR_RGB2LAB)
        
        # Color-based segmentation in HSV
        lower_wound = np.array([0, 30, 30])
        upper_wound = np.array([25, 255, 255])
        hsv_mask = cv2.inRange(hsv, lower_wound, upper_wound)
        
        # Texture-based segmentation using LBP
        gray = cv2.cvtColor(image, cv2.COLOR_RGB2GRAY)
        lbp = local_binary_pattern(gray, self.lbp_n_points, self.lbp_radius, method='uniform')
        
        # Combine masks
        combined_mask = cv2.bitwise_or(hsv_mask, (lbp > np.mean(lbp)).astype(np.uint8) * 255)
        
        # Morphological operations
        kernel = np.ones((5, 5), np.uint8)
        combined_mask = cv2.morphologyEx(combined_mask, cv2.MORPH_CLOSE, kernel)
        combined_mask = cv2.morphologyEx(combined_mask, cv2.MORPH_OPEN, kernel)
        
        return combined_mask
    
    def _kmeans_segmentation(self, image: np.ndarray, k: int = 4) -> np.ndarray:
        """K-means clustering for wound segmentation"""
        # Reshape image for clustering
        data = image.reshape((-1, 3))
        data = np.float32(data)
        
        # Apply K-means
        criteria = (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 20, 1.0)
        _, labels, centers = cv2.kmeans(data, k, None, criteria, 10, cv2.KMEANS_RANDOM_CENTERS)
        
        # Convert back to image
        segmented = centers[labels.flatten()]
        segmented = segmented.reshape(image.shape)
        segmented = np.uint8(segmented)
        
        # Create mask for wound-like regions (typically darker/redder clusters)
        gray_segmented = cv2.cvtColor(segmented, cv2.COLOR_RGB2GRAY)
        _, mask = cv2.threshold(gray_segmented, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        
        return mask
    
    def _watershed_segmentation(self, image: np.ndarray) -> np.ndarray:
        """Watershed segmentation for wound detection"""
        gray = cv2.cvtColor(image, cv2.COLOR_RGB2GRAY)
        
        # Noise removal
        kernel = np.ones((3, 3), np.uint8)
        opening = cv2.morphologyEx(gray, cv2.MORPH_OPEN, kernel, iterations=2)
        
        # Sure background area
        sure_bg = cv2.dilate(opening, kernel, iterations=3)
        
        # Finding sure foreground area
        dist_transform = cv2.distanceTransform(opening, cv2.DIST_L2, 5)
        _, sure_fg = cv2.threshold(dist_transform, 0.7 * dist_transform.max(), 255, 0)
        
        # Finding unknown region
        sure_fg = np.uint8(sure_fg)
        unknown = cv2.subtract(sure_bg, sure_fg)
        
        # Marker labelling
        _, markers = cv2.connectedComponents(sure_fg)
        markers = markers + 1
        markers[unknown == 255] = 0
        
        # Apply watershed
        markers = cv2.watershed(image, markers)
        
        # Create mask
        mask = np.zeros(gray.shape, dtype=np.uint8)
        mask[markers > 1] = 255
        
        return mask
    
    def _color_based_segmentation(self, image: np.ndarray) -> np.ndarray:
        """Traditional color-based segmentation"""
        hsv = cv2.cvtColor(image, cv2.COLOR_RGB2HSV)
        
        # Define range for wound colors (typically reddish)
        lower_red1 = np.array([0, 50, 50])
        upper_red1 = np.array([10, 255, 255])
        lower_red2 = np.array([170, 50, 50])
        upper_red2 = np.array([180, 255, 255])
        
        # Create masks
        mask1 = cv2.inRange(hsv, lower_red1, upper_red1)
        mask2 = cv2.inRange(hsv, lower_red2, upper_red2)
        mask = cv2.bitwise_or(mask1, mask2)
        
        # Morphological operations
        kernel = np.ones((5, 5), np.uint8)
        mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, kernel)
        mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, kernel)
        
        return mask
    
    def extract_features(self, image: np.ndarray, mask: np.ndarray) -> Dict[str, Any]:
        """
        Extract comprehensive features from segmented wound
        """
        features = {}
        
        try:
            # Geometric features
            features.update(self._extract_geometric_features(mask))
            
            # Color features
            features.update(self._extract_color_features(image, mask))
            
            # Texture features
            features.update(self._extract_texture_features(image, mask))
            
            # Shape features
            features.update(self._extract_shape_features(mask))
            
        except Exception as e:
            logger.error(f"Error extracting features: {str(e)}")
            
        return features
    
    def _extract_geometric_features(self, mask: np.ndarray) -> Dict[str, float]:
        """Extract geometric properties"""
        features = {}
        
        # Find contours
        contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        if contours:
            largest_contour = max(contours, key=cv2.contourArea)
            
            # Basic measurements
            area = cv2.contourArea(largest_contour)
            perimeter = cv2.arcLength(largest_contour, True)
            
            # Derived measurements
            features["area_pixels"] = float(area)
            features["perimeter_pixels"] = float(perimeter)
            features["circularity"] = 4 * np.pi * area / (perimeter ** 2) if perimeter > 0 else 0
            
            # Bounding rectangle
            x, y, w, h = cv2.boundingRect(largest_contour)
            features["aspect_ratio"] = float(w / h) if h > 0 else 0
            features["extent"] = float(area / (w * h)) if w * h > 0 else 0
            
            # Convex hull
            hull = cv2.convexHull(largest_contour)
            hull_area = cv2.contourArea(hull)
            features["solidity"] = float(area / hull_area) if hull_area > 0 else 0
            
        return features
    
    def _extract_color_features(self, image: np.ndarray, mask: np.ndarray) -> Dict[str, float]:
        """Extract color-based features"""
        features = {}
        
        # Extract masked region
        masked_region = cv2.bitwise_and(image, image, mask=mask)
        pixels = masked_region[mask > 0]
        
        if len(pixels) > 0:
            # RGB statistics
            features["mean_red"] = float(np.mean(pixels[:, 0]))
            features["mean_green"] = float(np.mean(pixels[:, 1]))
            features["mean_blue"] = float(np.mean(pixels[:, 2]))
            
            features["std_red"] = float(np.std(pixels[:, 0]))
            features["std_green"] = float(np.std(pixels[:, 1]))
            features["std_blue"] = float(np.std(pixels[:, 2]))
            
            # Color ratios (important for inflammation detection)
            total_intensity = features["mean_red"] + features["mean_green"] + features["mean_blue"]
            if total_intensity > 0:
                features["red_ratio"] = features["mean_red"] / total_intensity
                features["green_ratio"] = features["mean_green"] / total_intensity
                features["blue_ratio"] = features["mean_blue"] / total_intensity
            
            # HSV features
            hsv_image = cv2.cvtColor(image, cv2.COLOR_RGB2HSV)
            hsv_masked = cv2.bitwise_and(hsv_image, hsv_image, mask=mask)
            hsv_pixels = hsv_masked[mask > 0]
            
            if len(hsv_pixels) > 0:
                features["mean_hue"] = float(np.mean(hsv_pixels[:, 0]))
                features["mean_saturation"] = float(np.mean(hsv_pixels[:, 1]))
                features["mean_value"] = float(np.mean(hsv_pixels[:, 2]))
        
        return features
    
    def _extract_texture_features(self, image: np.ndarray, mask: np.ndarray) -> Dict[str, float]:
        """Extract texture-based features"""
        features = {}
        
        # Convert to grayscale
        gray = cv2.cvtColor(image, cv2.COLOR_RGB2GRAY)
        masked_gray = cv2.bitwise_and(gray, gray, mask=mask)
        
        # Local Binary Pattern
        lbp = local_binary_pattern(gray, self.lbp_n_points, self.lbp_radius, method='uniform')
        lbp_masked = lbp[mask > 0]
        
        if len(lbp_masked) > 0:
            features["lbp_mean"] = float(np.mean(lbp_masked))
            features["lbp_std"] = float(np.std(lbp_masked))
        
        # Texture variance and smoothness
        masked_pixels = masked_gray[mask > 0]
        if len(masked_pixels) > 0:
            variance = np.var(masked_pixels)
            features["texture_variance"] = float(variance)
            features["texture_smoothness"] = float(1 / (1 + variance)) if variance > 0 else 1.0
        
        return features
    
    def _extract_shape_features(self, mask: np.ndarray) -> Dict[str, float]:
        """Extract shape-based features"""
        features = {}
        
        # Find contours
        contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        if contours:
            largest_contour = max(contours, key=cv2.contourArea)
            
            # Moments
            moments = cv2.moments(largest_contour)
            
            # Hu moments (shape descriptors)
            hu_moments = cv2.HuMoments(moments)
            for i, hu in enumerate(hu_moments):
                features[f"hu_moment_{i+1}"] = float(-np.sign(hu) * np.log10(np.abs(hu))) if hu != 0 else 0
            
            # Eccentricity
            if moments['m00'] != 0:
                mu20 = moments['mu20'] / moments['m00']
                mu02 = moments['mu02'] / moments['m00']
                mu11 = moments['mu11'] / moments['m00']
                
                eccentricity = ((mu20 - mu02) ** 2 + 4 * mu11 ** 2) ** 0.5
                features["eccentricity"] = float(eccentricity)
        
        return features
    
    def visualize_analysis(self, original: np.ndarray, mask: np.ndarray, 
                          features: Dict[str, Any]) -> np.ndarray:
        """
        Create visualization of the analysis results
        """
        fig, axes = plt.subplots(1, 3, figsize=(15, 5))
        
        # Original image
        axes[0].imshow(original)
        axes[0].set_title("Original Image")
        axes[0].axis('off')
        
        # Segmentation mask
        axes[1].imshow(mask, cmap='gray')
        axes[1].set_title("Wound Segmentation")
        axes[1].axis('off')
        
        # Overlay
        overlay = original.copy()
        overlay[mask > 0] = [255, 0, 0]  # Red overlay on wound
        blended = cv2.addWeighted(original, 0.7, overlay, 0.3, 0)
        axes[2].imshow(blended)
        axes[2].set_title("Wound Detection Overlay")
        axes[2].axis('off')
        
        plt.tight_layout()
        
        # Convert plot to image
        fig.canvas.draw()
        plot_image = np.frombuffer(fig.canvas.tostring_rgb(), dtype=np.uint8)
        plot_image = plot_image.reshape(fig.canvas.get_width_height()[::-1] + (3,))
        
        plt.close(fig)
        return plot_image
















