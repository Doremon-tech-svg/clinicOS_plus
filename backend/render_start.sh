#!/bin/bash
echo "Starting healthcare backend..."

# Train model if not present (first deployment)
if [ ! -f "bed_flow_model_v2.pkl" ]; then
    echo "Model not found. Training model..."
    python train_bed_flow_model_v2.py
fi

# Start the server
uvicorn main:app --host 0.0.0.0 --port $PORT