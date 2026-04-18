"""
train_bed_flow_model_v2.py
Trains XGBoost model on synthetic patient dataset.
Automatically detects and maps column names.
"""

import pandas as pd
import numpy as np
import joblib
import os
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import mean_absolute_error, r2_score
import xgboost as xgb

# === 1. Load dataset and display columns ===
def load_dataset(filepath="healthcare_patient_journey.csv"):
    if not os.path.exists(filepath):
        print(f"❌ File '{filepath}' not found!")
        print("Please download the dataset from Kaggle and place it in the backend folder.")
        print("Dataset: https://www.kaggle.com/datasets/emirhanakku/synthetic-healthcare-patient-journey-dataset")
        exit(1)
    
    df = pd.read_csv(filepath)
    print(f"✅ Loaded {len(df)} rows")
    print("\n📋 Available columns:")
    for i, col in enumerate(df.columns):
        print(f"   {i}: {col} (dtype: {df[col].dtype})")
    print()
    return df

# === 2. Map columns to expected names ===
def map_columns(df):
    # Common variations for each required column
    column_variants = {
        'age': ['age', 'Age', 'patient_age', 'Patient Age'],
        'gender': ['gender', 'Gender', 'sex', 'Sex'],
        'chronic_condition': ['chronic_condition', 'Chronic Condition', 'chronic', 'comorbidity'],
        'admission_type': ['admission_type', 'Admission Type', 'admission', 'encounter_type'],
        'department': ['department', 'Department', 'dept', 'specialty'],
        'length_of_stay': ['length_of_stay', 'Length of Stay', 'LOS', 'stay_days', 'days_in_hospital'],
        'procedures_count': ['procedures_count', 'Procedures', 'num_procedures', 'procedure_count'],
        'medication_count': ['medication_count', 'Medications', 'num_medications', 'med_count'],
    }
    
    mapped = {}
    for target, variants in column_variants.items():
        found = None
        for v in variants:
            if v in df.columns:
                found = v
                break
        if found:
            mapped[target] = found
            print(f"✅ Mapped '{target}' → '{found}'")
        else:
            print(f"⚠️ Could not find column for '{target}'. Using default values.")
    
    return mapped

# === 3. Customize for Indian hospital ===
def customize_dataframe(df, col_map):
    df = df.copy()
    
    # Rename mapped columns to standard names
    rename_dict = {v: k for k, v in col_map.items() if v}
    df = df.rename(columns=rename_dict)
    
    # Add missing columns with defaults
    if 'age' not in df.columns:
        df['age'] = np.random.randint(18, 90, len(df))
    if 'gender' not in df.columns:
        df['gender'] = np.random.choice(['Male', 'Female'], len(df))
    if 'chronic_condition' not in df.columns:
        df['chronic_condition'] = np.random.choice([0, 1], len(df), p=[0.7, 0.3])
    if 'admission_type' not in df.columns:
        df['admission_type'] = np.random.choice(['Emergency', 'Scheduled'], len(df), p=[0.6, 0.4])
    if 'department' not in df.columns:
        df['department'] = np.random.choice(['Cardiology', 'Orthopedics', 'Neurology', 'General Medicine'], len(df))
    if 'length_of_stay' not in df.columns:
        df['length_of_stay'] = np.random.poisson(5, len(df)) + 1
    if 'procedures_count' not in df.columns:
        df['procedures_count'] = np.random.poisson(1, len(df))
    if 'medication_count' not in df.columns:
        df['medication_count'] = np.random.poisson(3, len(df))
    
    # Add Indian hospital customization
    wards = ["Ward A", "Ward B", "Ward C", "ICU", "Maternity", "Cardiac Care Unit"]
    df["ward"] = np.random.choice(wards, len(df))
    df["bed"] = [f"{np.random.randint(1,50)}{chr(65+np.random.randint(0,4))}" for _ in range(len(df))]
    df["room"] = df["ward"] + " " + df["bed"].str[0]
    
    hospitals = ["AIIMS Delhi", "Apollo Chennai", "Fortis Mumbai", "Medanta Gurgaon", "Sir Ganga Ram Hospital"]
    df["hospital"] = np.random.choice(hospitals, len(df))
    
    first_names = ["Priya", "Aarav", "Ananya", "Vikram", "Deepa", "Raj", "Neha", "Sanjay", "Meera", "Arjun"]
    last_names = ["Sharma", "Patel", "Kumar", "Singh", "Gupta", "Verma", "Reddy", "Nair", "Menon", "Kapoor"]
    df["name"] = [f"{np.random.choice(first_names)} {np.random.choice(last_names)}" for _ in range(len(df))]
    df["mrn"] = [f"MRN-2024-{i:05d}" for i in range(1, len(df)+1)]
    df["patient_id"] = range(1, len(df)+1)
    
    return df

# === 4. Prepare features and train ===
def prepare_features(df):
    le_gender = LabelEncoder()
    df['gender_encoded'] = le_gender.fit_transform(df['gender'].astype(str))
    
    le_admission = LabelEncoder()
    df['admission_encoded'] = le_admission.fit_transform(df['admission_type'].astype(str))
    
    le_dept = LabelEncoder()
    df['dept_encoded'] = le_dept.fit_transform(df['department'].astype(str))
    
    feature_cols = ['age', 'gender_encoded', 'chronic_condition', 'admission_encoded', 
                    'dept_encoded', 'procedures_count', 'medication_count']
    
    X = df[feature_cols].fillna(0)
    y = df['length_of_stay'].fillna(5).clip(1, 30)
    
    return X, y, {'le_gender': le_gender, 'le_admission': le_admission, 'le_dept': le_dept}

def train():
    # Load and inspect
    df = load_dataset()
    
    # Map columns
    col_map = map_columns(df)
    
    # Customize
    df = customize_dataframe(df, col_map)
    print(f"\n✅ Final dataframe shape: {df.shape}")
    print("Sample patient names:", df['name'].head(3).tolist())
    
    # Prepare features
    X, y, encoders = prepare_features(df)
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    print("\n⏳ Training XGBoost model...")
    model = xgb.XGBRegressor(
        n_estimators=150, max_depth=5, learning_rate=0.08,
        subsample=0.8, colsample_bytree=0.8, random_state=42
    )
    model.fit(X_train, y_train)
    
    y_pred = model.predict(X_test)
    mae = mean_absolute_error(y_test, y_pred)
    r2 = r2_score(y_test, y_pred)
    print(f"✅ MAE: {mae:.2f} days")
    print(f"✅ R²: {r2:.3f}")
    
    # Save artifacts
    joblib.dump(model, "bed_flow_model_v2.pkl")
    joblib.dump(encoders, "bed_flow_encoders.pkl")
    df.to_csv("patients_database.csv", index=False)
    print("\n🎉 Model and patient database saved successfully!")
    print("   - bed_flow_model_v2.pkl")
    print("   - bed_flow_encoders.pkl")
    print("   - patients_database.csv")

if __name__ == "__main__":
    train()