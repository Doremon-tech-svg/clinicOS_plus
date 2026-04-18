from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text
from sqlalchemy.sql import func
from database import Base

# models.py (add this class)

from sqlalchemy import Column, Integer, String, DateTime, Float
from datetime import datetime

class BedOccupancy(Base):
    __tablename__ = "bed_occupancy"

    id = Column(Integer, primary_key=True, index=True)
    department = Column(String, unique=True, index=True)   # e.g., "Cardiology"
    total_beds = Column(Integer, default=20)
    occupied_beds = Column(Integer, default=0)
    last_updated = Column(DateTime, default=datetime.utcnow)

    # Optional: predicted discharges in next hour
    predicted_releases = Column(Integer, default=0)

class Patient(Base):
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    mrn = Column(String(50), unique=True, nullable=False)
    age = Column(Integer, nullable=False)
    ward = Column(String(100))
    bed = Column(String(20))
    diagnosis = Column(String(255))
    risk_score = Column(Float, default=0.0)
    risk_label = Column(String(20), default="Low")
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    action = Column(String(100), nullable=False)
    patient_name = Column(String(100))
    details = Column(Text)
    tx_hash = Column(String(100))
    timestamp = Column(DateTime(timezone=True), server_default=func.now())


class VoiceCommandLog(Base):
    __tablename__ = "voice_commands"

    id = Column(Integer, primary_key=True, index=True)
    command = Column(Text, nullable=False)
    task = Column(String(255))
    department = Column(String(100))
    success = Column(Boolean, default=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())


class ConsentRecord(Base):
    __tablename__ = "consents"

    id = Column(Integer, primary_key=True, index=True)
    patient_mrn = Column(String(50), nullable=False)
    department = Column(String(100), nullable=False)
    granted = Column(Boolean, default=False)
    tx_hash = Column(String(100))
    timestamp = Column(DateTime(timezone=True), server_default=func.now())