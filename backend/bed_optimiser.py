# bed_optimiser.py
from sqlalchemy.orm import Session
from . import models

def get_current_bed_status(db: Session):
    """Return list of all departments with bed usage."""
    return db.query(models.BedOccupancy).all()

def recommend_department(patient_severity: str, eta_minutes: int, db: Session):
    """
    Simple heuristic:
    - Prefer departments with more free beds.
    - Prefer departments that match severity (e.g., Trauma for Critical).
    - Avoid departments with long queues (we don't have queue yet, so just beds).
    """
    all_depts = get_current_bed_status(db)
    
    # Define severity-to-department mapping
    severity_map = {
        "Critical": ["Trauma", "Cardiology", "Neurology"],
        "Moderate": ["General Medicine", "Pediatrics"],
        "Stable": ["General Medicine", "Outpatient"]
    }
    preferred = severity_map.get(patient_severity, ["General Medicine"])
    
    best_dept = None
    best_score = -1
    
    for dept in all_depts:
        free_beds = dept.total_beds - dept.occupied_beds
        # If no free beds, skip
        if free_beds <= 0:
            continue
        
        # Score: free beds + bonus if department is in preferred list
        score = free_beds
        if dept.department in preferred:
            score += 10   # boost preferred departments
        
        # Small penalty for longer ETA? Not needed now.
        if score > best_score:
            best_score = score
            best_dept = dept.department
    
    # If all departments full, return the one with most free beds (or None)
    if not best_dept and all_depts:
        best_dept = max(all_depts, key=lambda d: d.total_beds - d.occupied_beds).department
    
    return best_dept, best_score

def predict_bed_release(db: Session, department: str):
    """
    Placeholder for ML forecast.
    For now, just assume 2 beds will be free in the next hour.
    """
    # In real version: query historical discharge data, train a model, return prediction.
    return 2