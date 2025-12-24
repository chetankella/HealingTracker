# Advanced ML models for healing prediction and analysis

import numpy as np
import pandas as pd
from typing import Dict, List, Tuple, Any, Optional
from datetime import datetime, timedelta
import pickle
import joblib
from pathlib import Path

# ML imports
from sklearn.ensemble import RandomForestRegressor, GradientBoostingClassifier
from sklearn.linear_model import LinearRegression, LogisticRegression
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import mean_squared_error, accuracy_score, classification_report
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import Dataset, DataLoader

import logging

logger = logging.getLogger(__name__)

class HealingProgressDataset(Dataset):
    """PyTorch dataset for healing progress prediction"""
    
    def __init__(self, features: np.ndarray, targets: np.ndarray):
        self.features = torch.FloatTensor(features)
        self.targets = torch.FloatTensor(targets)
    
    def __len__(self):
        return len(self.features)
    
    def __getitem__(self, idx):
        return self.features[idx], self.targets[idx]

class HealingProgressNN(nn.Module):
    """Neural network for healing progress prediction"""
    
    def __init__(self, input_size: int, hidden_sizes: List[int] = [128, 64, 32]):
        super(HealingProgressNN, self).__init__()
        
        layers = []
        prev_size = input_size
        
        for hidden_size in hidden_sizes:
            layers.extend([
                nn.Linear(prev_size, hidden_size),
                nn.ReLU(),
                nn.Dropout(0.2),
                nn.BatchNorm1d(hidden_size)
            ])
            prev_size = hidden_size
        
        layers.append(nn.Linear(prev_size, 1))
        
        self.network = nn.Sequential(*layers)
    
    def forward(self, x):
        return self.network(x)

class HealingPredictor:
    """
    Advanced ML model for healing progress prediction and analysis
    """
    
    def __init__(self, model_path: str = "./models"):
        self.model_path = Path(model_path)
        self.model_path.mkdir(exist_ok=True)
        
        # Initialize models
        self.progress_model = None
        self.classification_model = None
        self.neural_model = None
        self.scaler = StandardScaler()
        self.label_encoder = LabelEncoder()
        
        # Model is trained flag
        self.is_trained = False
        
        # Load pre-trained models if available
        self._load_models()
    
    def predict_healing_progress(self, features: Dict[str, float]) -> Dict[str, Any]:
        """
        Predict healing progress based on current features
        """
        try:
            # Convert features to array
            feature_array = self._features_to_array(features)
            
            if self.progress_model is None:
                # Use rule-based prediction if no trained model
                return self._rule_based_prediction(features)
            
            # Scale features
            scaled_features = self.scaler.transform([feature_array])
            
            # Predict using ensemble of models
            rf_prediction = self.progress_model.predict(scaled_features)[0]
            
            # Neural network prediction if available
            nn_prediction = rf_prediction
            if self.neural_model is not None:
                with torch.no_grad():
                    tensor_features = torch.FloatTensor(scaled_features)
                    nn_prediction = self.neural_model(tensor_features).item()
            
            # Ensemble prediction
            final_prediction = (rf_prediction * 0.6 + nn_prediction * 0.4)
            final_prediction = np.clip(final_prediction, 0, 100)
            
            # Calculate confidence
            confidence = self._calculate_confidence(features, final_prediction)
            
            # Predict timeline
            timeline = self._predict_timeline(final_prediction, features)
            
            return {
                "healing_score": float(final_prediction),
                "confidence": float(confidence),
                "predicted_days_to_heal": timeline["days"],
                "confidence_interval": timeline["confidence_interval"],
                "risk_factors": self._assess_risk_factors(features),
                "recommendations": self._generate_ml_recommendations(features, final_prediction)
            }
            
        except Exception as e:
            logger.error(f"Error in healing prediction: {str(e)}")
            return self._rule_based_prediction(features)
    
    def classify_healing_stage(self, features: Dict[str, float]) -> Dict[str, Any]:
        """
        Classify the current healing stage
        """
        try:
            feature_array = self._features_to_array(features)
            
            if self.classification_model is None:
                return self._rule_based_classification(features)
            
            scaled_features = self.scaler.transform([feature_array])
            
            # Predict stage
            stage_probs = self.classification_model.predict_proba(scaled_features)[0]
            stage_classes = self.classification_model.classes_
            
            # Get most likely stage
            predicted_stage_idx = np.argmax(stage_probs)
            predicted_stage = stage_classes[predicted_stage_idx]
            confidence = stage_probs[predicted_stage_idx]
            
            # Create probability distribution
            stage_probabilities = dict(zip(stage_classes, stage_probs))
            
            return {
                "predicted_stage": predicted_stage,
                "confidence": float(confidence),
                "stage_probabilities": {k: float(v) for k, v in stage_probabilities.items()},
                "stage_description": self._get_stage_description(predicted_stage)
            }
            
        except Exception as e:
            logger.error(f"Error in stage classification: {str(e)}")
            return self._rule_based_classification(features)
    
    def train_models(self, training_data: pd.DataFrame):
        """
        Train ML models with historical data
        """
        try:
            logger.info("Starting model training...")
            
            # Prepare features and targets
            feature_columns = [col for col in training_data.columns 
                             if col not in ['healing_score', 'healing_stage', 'patient_id', 'timestamp']]
            
            X = training_data[feature_columns].fillna(0).values
            y_regression = training_data['healing_score'].values
            y_classification = training_data['healing_stage'].values
            
            # Split data
            X_train, X_test, y_reg_train, y_reg_test, y_class_train, y_class_test = train_test_split(
                X, y_regression, y_classification, test_size=0.2, random_state=42
            )
            
            # Scale features
            X_train_scaled = self.scaler.fit_transform(X_train)
            X_test_scaled = self.scaler.transform(X_test)
            
            # Train regression model
            self.progress_model = RandomForestRegressor(
                n_estimators=100, 
                max_depth=10, 
                random_state=42,
                n_jobs=-1
            )
            self.progress_model.fit(X_train_scaled, y_reg_train)
            
            # Train classification model
            self.classification_model = GradientBoostingClassifier(
                n_estimators=100,
                learning_rate=0.1,
                max_depth=6,
                random_state=42
            )
            
            # Encode labels
            y_class_encoded = self.label_encoder.fit_transform(y_class_train)
            self.classification_model.fit(X_train_scaled, y_class_encoded)
            
            # Train neural network
            self._train_neural_network(X_train_scaled, y_reg_train, X_test_scaled, y_reg_test)
            
            # Evaluate models
            self._evaluate_models(X_test_scaled, y_reg_test, y_class_test)
            
            # Save models
            self._save_models()
            
            self.is_trained = True
            logger.info("Model training completed successfully")
            
        except Exception as e:
            logger.error(f"Error in model training: {str(e)}")
            raise
    
    def _train_neural_network(self, X_train: np.ndarray, y_train: np.ndarray, 
                            X_test: np.ndarray, y_test: np.ndarray):
        """Train neural network model"""
        try:
            # Create datasets
            train_dataset = HealingProgressDataset(X_train, y_train)
            test_dataset = HealingProgressDataset(X_test, y_test)
            
            train_loader = DataLoader(train_dataset, batch_size=32, shuffle=True)
            test_loader = DataLoader(test_dataset, batch_size=32, shuffle=False)
            
            # Initialize model
            input_size = X_train.shape[1]
            self.neural_model = HealingProgressNN(input_size)
            
            # Loss and optimizer
            criterion = nn.MSELoss()
            optimizer = optim.Adam(self.neural_model.parameters(), lr=0.001)
            
            # Training loop
            epochs = 100
            for epoch in range(epochs):
                self.neural_model.train()
                train_loss = 0
                
                for batch_features, batch_targets in train_loader:
                    optimizer.zero_grad()
                    outputs = self.neural_model(batch_features).squeeze()
                    loss = criterion(outputs, batch_targets)
                    loss.backward()
                    optimizer.step()
                    train_loss += loss.item()
                
                if epoch % 20 == 0:
                    logger.info(f"Neural network training - Epoch {epoch}, Loss: {train_loss/len(train_loader):.4f}")
            
        except Exception as e:
            logger.error(f"Error training neural network: {str(e)}")
            self.neural_model = None
    
    def _evaluate_models(self, X_test: np.ndarray, y_reg_test: np.ndarray, y_class_test: np.ndarray):
        """Evaluate trained models"""
        try:
            # Evaluate regression model
            if self.progress_model is not None:
                reg_predictions = self.progress_model.predict(X_test)
                reg_mse = mean_squared_error(y_reg_test, reg_predictions)
                logger.info(f"Regression model MSE: {reg_mse:.4f}")
            
            # Evaluate classification model
            if self.classification_model is not None:
                y_class_encoded = self.label_encoder.transform(y_class_test)
                class_predictions = self.classification_model.predict(X_test)
                class_accuracy = accuracy_score(y_class_encoded, class_predictions)
                logger.info(f"Classification model accuracy: {class_accuracy:.4f}")
            
        except Exception as e:
            logger.error(f"Error evaluating models: {str(e)}")
    
    def _features_to_array(self, features: Dict[str, float]) -> np.ndarray:
        """Convert feature dictionary to numpy array"""
        # Define expected feature order
        expected_features = [
            'area_pixels', 'perimeter_pixels', 'circularity', 'aspect_ratio',
            'mean_red', 'mean_green', 'mean_blue', 'red_ratio', 'green_ratio',
            'texture_variance', 'texture_smoothness', 'lbp_mean'
        ]
        
        feature_array = []
        for feature_name in expected_features:
            feature_array.append(features.get(feature_name, 0.0))
        
        return np.array(feature_array)
    
    def _rule_based_prediction(self, features: Dict[str, float]) -> Dict[str, Any]:
        """Fallback rule-based prediction when no trained model is available"""
        # Extract key features
        area = features.get("area_pixels", 1000)
        inflammation_level = features.get("inflammation", "low")
        texture_smoothness = features.get("texture_smoothness", 0.5)
        red_ratio = features.get("red_ratio", 0.33)
        
        # Base score calculation
        base_score = 50.0
        
        # Area-based adjustment (smaller area = better healing)
        area_score = max(0, 100 - (area * 0.01))
        
        # Inflammation adjustment
        inflammation_scores = {"low": 30, "moderate": 15, "high": 0}
        inflammation_score = inflammation_scores.get(inflammation_level, 15)
        
        # Texture adjustment
        texture_score = texture_smoothness * 20
        
        # Color adjustment (less red = better healing)
        color_score = max(0, 20 - (red_ratio * 30))
        
        # Combine scores
        final_score = (area_score * 0.3 + inflammation_score * 0.3 + 
                      texture_score * 0.2 + color_score * 0.2)
        final_score = np.clip(final_score, 0, 100)
        
        # Timeline prediction
        days_to_heal = max(1, int((100 - final_score) * 0.5))
        
        return {
            "healing_score": float(final_score),
            "confidence": 0.7,
            "predicted_days_to_heal": days_to_heal,
            "confidence_interval": {"min": max(1, days_to_heal - 3), "max": days_to_heal + 5},
            "risk_factors": self._assess_risk_factors(features),
            "recommendations": self._generate_ml_recommendations(features, final_score)
        }
    
    def _rule_based_classification(self, features: Dict[str, float]) -> Dict[str, Any]:
        """Fallback rule-based classification"""
        area = features.get("area_pixels", 1000)
        inflammation = features.get("inflammation", "low")
        texture_smoothness = features.get("texture_smoothness", 0.5)
        
        if inflammation == "high" and area > 2000:
            stage = "inflammatory"
        elif inflammation == "moderate" and texture_smoothness < 0.4:
            stage = "proliferative"
        elif texture_smoothness > 0.7 and area < 500:
            stage = "maturation"
        elif area > 3000:
            stage = "acute"
        else:
            stage = "healing"
        
        return {
            "predicted_stage": stage,
            "confidence": 0.75,
            "stage_probabilities": {stage: 0.75, "other": 0.25},
            "stage_description": self._get_stage_description(stage)
        }
    
    def _predict_timeline(self, healing_score: float, features: Dict[str, float]) -> Dict[str, Any]:
        """Predict healing timeline based on current score"""
        # Base timeline calculation
        remaining_progress = 100 - healing_score
        base_days = remaining_progress * 0.5
        
        # Adjust based on features
        area = features.get("area_pixels", 1000)
        inflammation = features.get("inflammation", "low")
        
        # Area adjustment
        if area > 2000:
            base_days *= 1.3
        elif area < 500:
            base_days *= 0.8
        
        # Inflammation adjustment
        if inflammation == "high":
            base_days *= 1.4
        elif inflammation == "low":
            base_days *= 0.9
        
        days = max(1, int(base_days))
        
        return {
            "days": days,
            "confidence_interval": {"min": max(1, days - 3), "max": days + 7}
        }
    
    def _calculate_confidence(self, features: Dict[str, float], prediction: float) -> float:
        """Calculate confidence in the prediction"""
        base_confidence = 0.8
        
        # Reduce confidence for extreme values
        if prediction < 10 or prediction > 95:
            base_confidence *= 0.9
        
        # Reduce confidence for large wounds
        area = features.get("area_pixels", 1000)
        if area > 3000:
            base_confidence *= 0.85
        
        # Reduce confidence for high inflammation
        inflammation = features.get("inflammation", "low")
        if inflammation == "high":
            base_confidence *= 0.8
        
        return min(1.0, max(0.5, base_confidence))
    
    def _assess_risk_factors(self, features: Dict[str, float]) -> List[str]:
        """Assess risk factors based on features"""
        risk_factors = []
        
        area = features.get("area_pixels", 1000)
        inflammation = features.get("inflammation", "low")
        red_ratio = features.get("red_ratio", 0.33)
        
        if area > 2500:
            risk_factors.append("Large wound size")
        
        if inflammation == "high":
            risk_factors.append("High inflammation levels")
        
        if red_ratio > 0.45:
            risk_factors.append("Excessive redness indicating possible infection")
        
        texture_variance = features.get("texture_variance", 100)
        if texture_variance > 200:
            risk_factors.append("Irregular wound texture")
        
        return risk_factors
    
    def _generate_ml_recommendations(self, features: Dict[str, float], healing_score: float) -> List[str]:
        """Generate ML-based recommendations"""
        recommendations = []
        
        if healing_score < 30:
            recommendations.extend([
                "Consider consulting healthcare provider for advanced treatment",
                "Monitor wound closely for signs of infection",
                "Ensure optimal nutrition and hydration"
            ])
        elif healing_score < 60:
            recommendations.extend([
                "Continue current treatment regimen",
                "Maintain proper wound hygiene",
                "Consider increasing protein intake"
            ])
        else:
            recommendations.extend([
                "Excellent progress - maintain current care routine",
                "Begin scar prevention measures if appropriate",
                "Gradually increase activity level as tolerated"
            ])
        
        # Feature-specific recommendations
        inflammation = features.get("inflammation", "low")
        if inflammation == "high":
            recommendations.append("Apply cold compress to reduce inflammation")
        
        area = features.get("area_pixels", 1000)
        if area > 2000:
            recommendations.append("Consider advanced wound dressings for large wounds")
        
        return recommendations
    
    def _get_stage_description(self, stage: str) -> str:
        """Get description for healing stage"""
        descriptions = {
            "acute": "Initial injury phase with active bleeding and tissue damage",
            "inflammatory": "Body's immune response is active, cleaning the wound",
            "proliferative": "New tissue formation and wound closure in progress",
            "healing": "Active healing with tissue regeneration",
            "maturation": "Final healing phase with tissue strengthening and remodeling"
        }
        return descriptions.get(stage, "Unknown healing stage")
    
    def _save_models(self):
        """Save trained models to disk"""
        try:
            if self.progress_model is not None:
                joblib.dump(self.progress_model, self.model_path / "progress_model.pkl")
            
            if self.classification_model is not None:
                joblib.dump(self.classification_model, self.model_path / "classification_model.pkl")
            
            if self.neural_model is not None:
                torch.save(self.neural_model.state_dict(), self.model_path / "neural_model.pth")
            
            joblib.dump(self.scaler, self.model_path / "scaler.pkl")
            joblib.dump(self.label_encoder, self.model_path / "label_encoder.pkl")
            
            logger.info("Models saved successfully")
            
        except Exception as e:
            logger.error(f"Error saving models: {str(e)}")
    
    def _load_models(self):
        """Load pre-trained models from disk"""
        try:
            progress_model_path = self.model_path / "progress_model.pkl"
            if progress_model_path.exists():
                self.progress_model = joblib.load(progress_model_path)
                logger.info("Progress model loaded")
            
            classification_model_path = self.model_path / "classification_model.pkl"
            if classification_model_path.exists():
                self.classification_model = joblib.load(classification_model_path)
                logger.info("Classification model loaded")
            
            neural_model_path = self.model_path / "neural_model.pth"
            if neural_model_path.exists():
                # Need to know input size to load neural model
                # This would be saved as metadata in production
                pass
            
            scaler_path = self.model_path / "scaler.pkl"
            if scaler_path.exists():
                self.scaler = joblib.load(scaler_path)
            
            label_encoder_path = self.model_path / "label_encoder.pkl"
            if label_encoder_path.exists():
                self.label_encoder = joblib.load(label_encoder_path)
            
            if self.progress_model is not None and self.classification_model is not None:
                self.is_trained = True
                logger.info("Pre-trained models loaded successfully")
                
        except Exception as e:
            logger.error(f"Error loading models: {str(e)}")
            self.is_trained = False
















