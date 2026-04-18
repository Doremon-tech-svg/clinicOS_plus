"""
train_model.py
Generates synthetic patient data and trains an XGBoost fall-risk classifier.
Saves model.pkl and shap_explainer.pkl for use in predict.py.
"""

import numpy as np
import pandas as pd
import joblib
import os
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, roc_auc_score
import xgboost as xgb
import shap

RANDOM_STATE = 42
np.random.seed(RANDOM_STATE)
N_SAMPLES = 1000


def generate_synthetic_data():
    """Generate 1000-row synthetic dataset for fall risk prediction."""
    ages = np.random.normal(62, 18, N_SAMPLES).clip(18, 95).astype(int)
    mobility_scores = np.random.randint(1, 11, N_SAMPLES)
    prior_falls = np.random.poisson(0.8, N_SAMPLES).clip(0, 5)
    med_counts = np.random.randint(0, 12, N_SAMPLES)
    hr_variability = np.random.normal(50, 20, N_SAMPLES).clip(5, 120)

    # Compute ground-truth risk score (logistic-like)
    raw_risk = (
        0.035 * (ages - 40)
        + 0.08 * (10 - mobility_scores)
        + 0.25 * prior_falls
        + 0.04 * med_counts
        - 0.005 * hr_variability
        + np.random.normal(0, 0.4, N_SAMPLES)
    )
    prob_high = 1 / (1 + np.exp(-raw_risk))
    labels = (prob_high > 0.5).astype(int)

    df = pd.DataFrame({
        "age": ages,
        "mobility_score": mobility_scores,
        "prior_falls": prior_falls,
        "med_count": med_counts,
        "hr_variability": hr_variability.round(2),
        "fall_risk": labels,
    })
    return df


def train():
    print("Generating synthetic data...")
    df = generate_synthetic_data()
    print(f"  Class distribution: {df['fall_risk'].value_counts().to_dict()}")

    X = df.drop("fall_risk", axis=1)
    y = df["fall_risk"]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=RANDOM_STATE, stratify=y
    )

    print("Training XGBoost classifier...")
    model = xgb.XGBClassifier(
        n_estimators=150,
        max_depth=4,
        learning_rate=0.1,
        subsample=0.8,
        colsample_bytree=0.8,
        use_label_encoder=False,
        eval_metric="logloss",
        random_state=RANDOM_STATE,
    )
    model.fit(X_train, y_train, eval_set=[(X_test, y_test)], verbose=False)

    y_pred = model.predict(X_test)
    y_prob = model.predict_proba(X_test)[:, 1]
    auc = roc_auc_score(y_test, y_prob)
    print(f"  AUC-ROC: {auc:.4f}")
    print(classification_report(y_test, y_pred, target_names=["Low Risk", "High Risk"]))

    print("Computing SHAP explainer...")
    explainer = shap.TreeExplainer(model)

    model_path = os.path.join(os.path.dirname(__file__), "model.pkl")
    explainer_path = os.path.join(os.path.dirname(__file__), "shap_explainer.pkl")
    joblib.dump(model, model_path)
    joblib.dump(explainer, explainer_path)
    print(f"  Saved model → {model_path}")
    print(f"  Saved SHAP explainer → {explainer_path}")
    return model, explainer


if __name__ == "__main__":
    train()