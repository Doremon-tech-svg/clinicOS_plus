from database import SessionLocal, engine
import models
from predict import predict_risk

models.Base.metadata.create_all(bind=engine)

db = SessionLocal()

patients_data = [
    {"name": "Mrs. Sharma", "mrn": "MRN-2024-00041", "age": 78, "ward": "Ward B", "bed": "4A",
     "diagnosis": "Hip fracture post-op", "mobility_score": 3, "prior_falls": 2, "med_count": 7, "hr_variability": 32},
    {"name": "Mr. Gupta", "mrn": "MRN-2024-00082", "age": 45, "ward": "Ward B", "bed": "2B",
     "diagnosis": "Post-appendectomy", "mobility_score": 8, "prior_falls": 0, "med_count": 2, "hr_variability": 65},
    {"name": "Mr. Kapoor", "mrn": "MRN-2024-00113", "age": 61, "ward": "Ward B", "bed": "6B",
     "diagnosis": "Hypertension management", "mobility_score": 6, "prior_falls": 1, "med_count": 5, "hr_variability": 45},
    {"name": "Mrs. Menon", "mrn": "MRN-2024-00124", "age": 52, "ward": "Ward B", "bed": "3A",
     "diagnosis": "Diabetic care", "mobility_score": 7, "prior_falls": 0, "med_count": 4, "hr_variability": 58},
]

for p in patients_data:
    # Predict risk
    pred = predict_risk({
        "age": p["age"],
        "mobility_score": p["mobility_score"],
        "prior_falls": p["prior_falls"],
        "med_count": p["med_count"],
        "hr_variability": p["hr_variability"],
    })
    patient = models.Patient(
        name=p["name"],
        mrn=p["mrn"],
        age=p["age"],
        ward=p["ward"],
        bed=p["bed"],
        diagnosis=p["diagnosis"],
        risk_score=pred["risk_score"],
        risk_label=pred["risk_label"],
    )
    db.add(patient)

db.commit()
db.close()
print("Database seeded with patients.")