# Run once to populate departments
from your_app.database import SessionLocal
from your_app.models import BedOccupancy

db = SessionLocal()
departments = ["Cardiology", "Neurology", "Trauma", "Pediatrics", "General Medicine"]
for dept in departments:
    exists = db.query(BedOccupancy).filter(BedOccupancy.department == dept).first()
    if not exists:
        bed = BedOccupancy(department=dept, total_beds=20, occupied_beds=12)
        db.add(bed)
db.commit()
db.close()