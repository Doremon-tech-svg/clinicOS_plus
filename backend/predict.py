"""
predict.py
Loads the trained XGBoost model and SHAP explainer.
Provides predict_risk() for fall-risk scoring with SHAP explanations.
"""

import os
import numpy as np
import pandas as pd
import joblib

FEATURE_NAMES = ["age", "mobility_score", "prior_falls", "med_count", "hr_variability"]
FEATURE_LABELS = {
    "age": "Age",
    "mobility_score": "Mobility Score",
    "prior_falls": "Prior Falls",
    "med_count": "Medication Count",
    "hr_variability": "HR Variability",
}

_model = None
_explainer = None


def _load_artifacts():
    global _model, _explainer
    base = os.path.dirname(__file__)
    model_path = os.path.join(base, "model.pkl")
    explainer_path = os.path.join(base, "shap_explainer.pkl")

    if not os.path.exists(model_path):
        # Auto-train if model doesn't exist
        print("[predict] model.pkl not found – training now...")
        from train_model import train
        _model, _explainer = train()
        return

    if _model is None:
        _model = joblib.load(model_path)
    if _explainer is None and os.path.exists(explainer_path):
        _explainer = joblib.load(explainer_path)


def predict_risk(patient_data: dict) -> dict:
    """
    Predict fall risk for a patient.

    Args:
        patient_data: dict with keys: age, mobility_score, prior_falls, med_count, hr_variability

    Returns:
        dict with:
          - risk_score: int 0–100
          - risk_label: str "High" | "Low"
          - explanation: list of top-3 feature dicts
    """
    _load_artifacts()

    row = {f: patient_data.get(f, 0) for f in FEATURE_NAMES}
    df = pd.DataFrame([row])

    prob = float(_model.predict_proba(df)[0][1])
    risk_score = round(prob * 100)
    risk_label = "High" if prob >= 0.5 else "Low"

    # SHAP explanation
    explanation = []
    if _explainer is not None:
        try:
            shap_values = _explainer.shap_values(df)
            # For binary classification shap may return list or ndarray
            if isinstance(shap_values, list):
                sv = np.array(shap_values[1][0])
            else:
                sv = np.array(shap_values[0])

            # Pair feature names with shap values
            pairs = sorted(zip(FEATURE_NAMES, sv), key=lambda x: abs(x[1]), reverse=True)
            for feat, val in pairs[:3]:
                explanation.append({
                    "feature": FEATURE_LABELS.get(feat, feat),
                    "raw_feature": feat,
                    "shap_value": round(float(val), 4),
                    "direction": "positive" if val > 0 else "negative",
                    "magnitude": round(abs(float(val)), 4),
                    "patient_value": row[feat],
                })
        except Exception as e:
            print(f"[predict] SHAP error: {e}")
            explanation = _fallback_explanation(row)
    else:
        explanation = _fallback_explanation(row)

    return {
        "risk_score": risk_score,
        "risk_label": risk_label,
        "probability": round(prob, 4),
        "explanation": explanation,
    }


def _fallback_explanation(row: dict) -> list:
    """Rule-based explanation when SHAP is unavailable."""
    explanations = []
    if row.get("age", 0) > 70:
        explanations.append({"feature": "Age > 70", "direction": "positive", "magnitude": 0.38})
    if row.get("mobility_score", 10) < 5:
        explanations.append({"feature": f"Mobility Score {row.get('mobility_score')}/10", "direction": "positive", "magnitude": 0.25})
    if row.get("prior_falls", 0) > 0:
        explanations.append({"feature": f"Prior Falls: {row.get('prior_falls')}", "direction": "positive", "magnitude": 0.22})
    if row.get("med_count", 0) > 5:
        explanations.append({"feature": f"High Medication Count: {row.get('med_count')}", "direction": "positive", "magnitude": 0.18})
    return explanations[:3]


if __name__ == "__main__":
    # Quick smoke test
    test_patient = {
        "age": 78,
        "mobility_score": 3,
        "prior_falls": 2,
        "med_count": 7,
        "hr_variability": 35,
    }
    result = predict_risk(test_patient)
    print("Risk Score:", result["risk_score"])
    print("Risk Label:", result["risk_label"])
    print("Explanation:")
    for ex in result["explanation"]:
        print(f"  {ex['feature']}: {ex['direction']} ({ex['magnitude']:.3f})")