"""
predict_bed_flow_v2.py
Loads trained model and returns predictions + patient data.
"""

import os
import pandas as pd
import joblib
import random


_model = None
_encoders = None
_patients_df = None

def generate_vitals(age, risk_score):
    """Generate realistic vitals based on age and risk."""
    # Heart Rate (bpm) - higher for older/higher risk
    base_hr = 70 + (age * 0.1) + (risk_score * 0.3)
    hr = int(base_hr + random.randint(-10, 15))
    hr = max(60, min(120, hr))
    
    # Blood Pressure
    systolic = int(110 + (age * 0.4) + (risk_score * 0.2) + random.randint(-10, 15))
    diastolic = int(70 + (age * 0.15) + random.randint(-5, 10))
    systolic = max(100, min(160, systolic))
    diastolic = max(60, min(100, diastolic))
    bp = f"{systolic}/{diastolic}"
    
    # SpO2 (%)
    spo2 = int(98 - (risk_score * 0.1) - (age * 0.05) + random.randint(-2, 2))
    spo2 = max(90, min(100, spo2))
    
    # Temperature (°F)
    temp = round(98.6 + random.uniform(-1.0, 1.5), 1)
    if risk_score > 70:
        temp += random.uniform(0.5, 2.0)
    temp = max(97.0, min(102.0, temp))
    
    return {
        "hr": hr,
        "bp": bp,
        "spo2": spo2,
        "temp": temp
    }

def _load_artifacts():
    global _model, _encoders, _patients_df
    if _model is None:
        base = os.path.dirname(__file__)
        model_path = os.path.join(base, "bed_flow_model_v2.pkl")
        encoders_path = os.path.join(base, "bed_flow_encoders.pkl")
        patients_path = os.path.join(base, "patients_database.csv")
        
        if not os.path.exists(model_path):
            raise FileNotFoundError("bed_flow_model_v2.pkl not found. Run train_bed_flow_model_v2.py first.")
        
        _model = joblib.load(model_path)
        _encoders = joblib.load(encoders_path)
        _patients_df = pd.read_csv(patients_path)
        print(f"✅ Loaded {len(_patients_df)} patients from database")

def predict_los(patient_row):
    """Predict length of stay for a single patient row."""
    _load_artifacts()
    
    features = {
        "age": patient_row.get("age", 50),
        "gender_encoded": _encoders["le_gender"].transform([str(patient_row.get("gender", "Male"))])[0],
        "chronic_condition": int(patient_row.get("chronic_condition", 0)),
        "admission_encoded": _encoders["le_admission"].transform([str(patient_row.get("admission_type", "Emergency"))])[0],
        "dept_encoded": _encoders["le_dept"].transform([str(patient_row.get("department", "General"))])[0],
        "procedures_count": int(patient_row.get("procedures_count", 0)),
        "medication_count": int(patient_row.get("medication_count", 0))
    }
    
    df = pd.DataFrame([features])
    pred = float(_model.predict(df)[0])
    return max(1, round(pred))

def get_all_patients(limit=20, offset=0):
    """Return paginated patients with predictions, risk scores, and vitals."""
    _load_artifacts()
    patients = []
    
    # Apply pagination
    df_subset = _patients_df.iloc[offset:offset+limit]
    
    for idx, row in df_subset.iterrows():
        predicted_days = predict_los(row.to_dict())
        
        # Generate risk score
        risk_score = min(95, int(20 + row["age"] * 0.5 + int(row.get("chronic_condition", 0)) * 15))
        if risk_score >= 70:
            risk_label = "High"
        elif risk_score >= 40:
            risk_label = "Medium"
        else:
            risk_label = "Low"
        
        # Generate vitals
        vitals = generate_vitals(row["age"], risk_score)
        
        patients.append({
            "id": int(row.get("patient_id", idx)),
            "name": row.get("name", "Unknown"),
            "mrn": row.get("mrn", f"MRN-{idx}"),
            "age": int(row.get("age", 0)),
            "gender": row.get("gender", "Unknown"),
            "ward": row.get("ward", "Unknown"),
            "bed": row.get("bed", "Unknown"),
            "room": row.get("room", "Unknown"),
            "department": row.get("department", "Unknown"),
            "admission_type": row.get("admission_type", "Unknown"),
            "diagnosis": f"{row.get('department', 'General')} - {row.get('admission_type', 'Admission')}",
            "predicted_discharge_days": predicted_days,
            "discharge_estimate": f"{predicted_days} day{'s' if predicted_days != 1 else ''}",
            "risk_score": risk_score,
            "risk_label": risk_label,
            "chronic_condition": bool(row.get("chronic_condition", False)),
            "length_of_stay_actual": int(row.get("length_of_stay", 0)),
            # Vitals
            "hr": vitals["hr"],
            "bp": vitals["bp"],
            "spo2": vitals["spo2"],
            "temp": vitals["temp"],
        })
    
    return patients

def get_patients_count():
    """Return total number of patients in database."""
    _load_artifacts()
    return len(_patients_df)