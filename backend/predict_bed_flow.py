"""
predict_bed_flow.py
Loads the trained Bed Flow model and makes predictions.
"""

import os
import numpy as np
import pandas as pd
import joblib

_model = None
_feature_names = None

def _load_model():
    global _model, _feature_names
    if _model is None:
        base = os.path.dirname(__file__)
        model_path = os.path.join(base, "bed_flow_model.pkl")
        features_path = os.path.join(base, "bed_flow_features.pkl")
        
        if not os.path.exists(model_path):
            raise FileNotFoundError("bed_flow_model.pkl not found. Run train_bed_flow_model.py first.")
        
        _model = joblib.load(model_path)
        _feature_names = joblib.load(features_path)

def predict_discharge_days(patient_data: dict) -> dict:
    """
    Predict days until discharge for a patient.
    
    Args:
        patient_data: dict with keys: age, mobility_score, prior_falls, 
                      comorbidity_count, surgery_required (0/1), admission_type (string)
    
    Returns:
        dict with predicted_days (int) and confidence_interval (optional)
    """
    _load_model()
    
    # Create a DataFrame with all features, filling defaults
    admission_type = patient_data.get('admission_type', 'Emergency')
    features = {
        'age': patient_data.get('age', 60),
        'mobility_score': patient_data.get('mobility_score', 5),
        'prior_falls': patient_data.get('prior_falls', 0),
        'comorbidity_count': patient_data.get('comorbidity_count', 1),
        'surgery_required': 1 if patient_data.get('surgery_required') else 0,
        'admission_emergency': 1 if admission_type == 'Emergency' else 0,
        'admission_elective': 1 if admission_type == 'Elective' else 0,
        'admission_transfer': 1 if admission_type == 'Transfer' else 0,
    }
    
    # Ensure order matches training
    df = pd.DataFrame([features])[_feature_names]
    
    pred_days = float(_model.predict(df)[0])
    pred_days = max(1, round(pred_days))
    
    return {
        "predicted_days": pred_days,
        "discharge_estimate": f"{pred_days} day{'s' if pred_days > 1 else ''}"
    }