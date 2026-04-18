"""
train_bed_flow_model.py
Generates synthetic patient data and trains an XGBoost model to predict days until discharge.
"""

import numpy as np
import pandas as pd
import joblib
import os
import xgboost as xgb
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, r2_score

RANDOM_STATE = 42
np.random.seed(RANDOM_STATE)

def generate_synthetic_data(n_samples=1000):
    """Generate synthetic patient data with days_until_discharge as target."""
    ages = np.random.normal(58, 20, n_samples).clip(18, 95).astype(int)
    mobility_scores = np.random.randint(1, 11, n_samples)  # 1 (bedridden) to 10 (independent)
    prior_falls = np.random.poisson(0.6, n_samples).clip(0, 5)
    comorbidity_count = np.random.randint(0, 6, n_samples)  # number of chronic conditions
    admission_type = np.random.choice(['Emergency', 'Elective', 'Transfer'], n_samples, p=[0.5, 0.4, 0.1])
    surgery_required = np.random.choice([0, 1], n_samples, p=[0.7, 0.3])
    
    # Target: days until discharge (1 to 14 days)
    # Base formula: older, less mobile, more comorbidities, surgery = longer stay
    base_days = 3
    age_factor = (ages - 40) / 30 * 1.5
    mobility_factor = (10 - mobility_scores) * 0.4
    comorbidity_factor = comorbidity_count * 0.8
    surgery_factor = surgery_required * 2.5
    admission_factor = np.where(admission_type == 'Emergency', 1.5, 
                                np.where(admission_type == 'Transfer', 1.0, 0))
    
    raw_days = base_days + age_factor + mobility_factor + comorbidity_factor + surgery_factor + admission_factor
    raw_days += np.random.normal(0, 1.5, n_samples)  # noise
    
    days_until_discharge = np.clip(raw_days, 1, 14).astype(int)
    
    # One-hot encode admission type
    df = pd.DataFrame({
        'age': ages,
        'mobility_score': mobility_scores,
        'prior_falls': prior_falls,
        'comorbidity_count': comorbidity_count,
        'surgery_required': surgery_required,
        'admission_emergency': (admission_type == 'Emergency').astype(int),
        'admission_elective': (admission_type == 'Elective').astype(int),
        'admission_transfer': (admission_type == 'Transfer').astype(int),
        'days_until_discharge': days_until_discharge
    })
    return df

def train():
    print("Generating synthetic data...")
    df = generate_synthetic_data()
    print(f"Dataset shape: {df.shape}")
    print(f"Average stay: {df['days_until_discharge'].mean():.1f} days")
    
    X = df.drop('days_until_discharge', axis=1)
    y = df['days_until_discharge']
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=RANDOM_STATE)
    
    print("Training XGBoost regressor...")
    model = xgb.XGBRegressor(
        n_estimators=100,
        max_depth=4,
        learning_rate=0.1,
        subsample=0.8,
        colsample_bytree=0.8,
        random_state=RANDOM_STATE
    )
    model.fit(X_train, y_train)
    
    y_pred = model.predict(X_test)
    mae = mean_absolute_error(y_test, y_pred)
    r2 = r2_score(y_test, y_pred)
    print(f"MAE: {mae:.2f} days")
    print(f"R² Score: {r2:.3f}")
    
    model_path = os.path.join(os.path.dirname(__file__), "bed_flow_model.pkl")
    joblib.dump(model, model_path)
    print(f"Model saved to {model_path}")
    
    # Save feature names for prediction
    feature_names = list(X.columns)
    joblib.dump(feature_names, os.path.join(os.path.dirname(__file__), "bed_flow_features.pkl"))
    
    return model

if __name__ == "__main__":
    train()