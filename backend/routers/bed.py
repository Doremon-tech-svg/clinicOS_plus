# routers/bed.py (or inside main.py)

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from . import models, schemas, bed_optimiser
from .database import get_db

router = APIRouter(prefix="/api/bed", tags=["bed"])

@router.post("/update-occupancy")
def update_occupancy(department: str, occupied_beds: int, db: Session = Depends(get_db)):
    bed_record = db.query(models.BedOccupancy).filter(models.BedOccupancy.department == department).first()
    if not bed_record:
        raise HTTPException(status_code=404, detail="Department not found")
    if occupied_beds > bed_record.total_beds:
        raise HTTPException(status_code=400, detail="Occupied beds cannot exceed total beds")
    bed_record.occupied_beds = occupied_beds
    bed_record.last_updated = datetime.utcnow()
    db.commit()
    return {"message": "Updated", "department": department, "occupied": occupied_beds}

@router.get("/status")
def bed_status(db: Session = Depends(get_db)):
    depts = bed_optimiser.get_current_bed_status(db)
    result = []
    for d in depts:
        free = d.total_beds - d.occupied_beds
        result.append({
            "department": d.department,
            "total": d.total_beds,
            "occupied": d.occupied_beds,
            "free": free,
            "predicted_releases": d.predicted_releases or 0
        })
    return {"departments": result}