# 🏥 Intelligent Healthcare Ecosystem

A full-stack hackathon project demonstrating **5 AI Agents**, **blockchain consent management**, and a **color-coded role-based UI** for hospital operations.

---

## 🧠 5 AI Agents

| # | Agent | Role | Technology |
|---|-------|------|------------|
| 1 | **Triage NLP Agent** | Routes incoming patients to departments | Keyword NLP |
| 2 | **Bed Flow Optimizer** | Predicts discharge readiness + fall risk | XGBoost + SHAP |
| 3 | **Nurse Assistant Agent** | Parses voice commands, dispatches tasks | Speech Recognition |
| 4 | **Decision Support Agent** | Summarizes history, flags drug interactions | Rule-based + LLM-ready |
| 5 | **Green Sustainability Agent** | Correlates occupancy with energy usage | Recharts visualization |

---

## 🎨 Color Theme by Role

| Role | Color | Zone |
|------|-------|------|
| Admin | 🟡 Gold `#F5A623` | Administration |
| Nurse | 🔵 Blue `#4A90E2` | Ward / OPD |
| Patient | 🟢 Green `#7ED321` | General Ward |
| Ambulance | 🔴 Red `#D0021B` | Emergency |
| Maternity | 🩷 Pink `#FFB6C1` | Maternity |
| Lab | 🟣 Violet `#9013FE` | Pathology |
| Pharmacy | 🟠 Orange `#F5A623` | Pharmacy |
| OT | ⚪ Silver `#B8B8B8` | Operation Theatre |
| Cleaning | ⬜ Grey `#9B9B9B` | Housekeeping |
| Security | ⬛ Black `#1A1A1A` | Security |
| Radiology | 🩵 Teal `#50E3C2` | Imaging |

---

## 🚀 Quick Start

### Option 1: Docker Compose (Recommended)

```bash
# Clone the repo
git clone <repo-url>
cd project

# Set Telegram bot token (optional – defaults to demo mode)
export TELEGRAM_BOT_TOKEN=your_bot_token_here

# Start all services
docker-compose up --build
```

Services will start at:
- **Frontend**: http://localhost:5173
- **API Docs**: http://localhost:8000/docs
- **Hardhat Node**: http://localhost:8545

---

### Option 2: Manual Setup

#### Backend

```bash
cd backend

# Create virtual environment
python3.11 -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Train the ML model (runs once, saves model.pkl)
python train_model.py

# Start FastAPI server
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

#### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start Vite dev server
npm run dev
```

#### Blockchain (Hardhat)

```bash
cd blockchain

# Install dependencies
npm install

# Start local Hardhat node (in a separate terminal)
npx hardhat node

# Deploy the HealthcareConsent contract
npx hardhat run scripts/deploy.js --network localhost
```

---

## 📱 Portals

| Portal | Route | Description |
|--------|-------|-------------|
| Login | `/` | Role selection screen |
| Admin Dashboard | `/admin` | Energy, blockchain log, agent panel, chaos mode |
| Nurse Dashboard | `/nurse` | Voice commands, fall risk, task list |
| Ambulance Portal | `/ambulance` | Emergency dispatch with Triage NLP |
| Patient Portal | `/patient` | Records, consent management, chat |
| Patient Chat | `/patient/chat` | WhatsApp-style AI assistant |

---

## ⛓️ Blockchain Smart Contract

`HealthcareConsent.sol` deployed to local Hardhat node.

```solidity
struct Access {
    bool active;
    uint256 expiry;
    string dataScope;
}

mapping(address => mapping(address => Access)) public consents;

function grantConsent(address provider, uint256 duration, string calldata dataScope) external;
function revokeConsent(address provider) external;
function logAccess(address patient, string calldata action) external;
function hasValidConsent(address patient, address provider) external view returns (bool);
```

**Events**: `ConsentGranted`, `ConsentRevoked`, `AccessLogged`

---

## 📲 Telegram Channels

Configure a Telegram bot and set the environment variable:

```bash
export TELEGRAM_BOT_TOKEN=your_bot_token_here
```

Channel mapping:
- `@cardio_alerts` → Cardiology OT (Silver)
- `@trauma_alerts` → Trauma OT (Silver)
- `@maternity_alerts` → Maternity (Pink)
- `@lab_alerts` → Lab (Violet)

If `TELEGRAM_BOT_TOKEN` is not set, the system runs in simulation mode and still returns success responses.

---

## 🧪 ML Model Details

**File**: `backend/train_model.py` + `backend/predict.py`

- **Algorithm**: XGBoost Classifier
- **Features**: `age`, `mobility_score`, `prior_falls`, `med_count`, `hr_variability`
- **Training data**: 1,000 synthetic patient records
- **Explainability**: SHAP TreeExplainer (top-3 feature contributions)
- **Output**: `risk_score` (0–100), `risk_label` ("High"/"Low"), `explanation` (list of top features)

---

## 🔌 API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/patients` | Patient list with AI risk scores |
| POST | `/api/voice/command` | Voice command dispatch |
| POST | `/api/ambulance/alert` | Emergency triage + Telegram |
| GET | `/api/blockchain/events` | Blockchain audit log |
| POST | `/api/patient/consent` | Consent grant/revoke |
| GET | `/health` | Health check |

Full Swagger docs: **http://localhost:8000/docs**

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Recharts, Lucide React, ethers.js v6
- **Backend**: FastAPI, SQLite, SQLAlchemy, Python 3.11
- **ML**: XGBoost, scikit-learn, SHAP, pandas, numpy
- **Blockchain**: Hardhat, Solidity ^0.8.20, ethers.js
- **Notifications**: python-telegram-bot v21
- **Infrastructure**: Docker Compose

---

## ✨ Special Features

- **Chaos Mode** (Admin): Applies `grayscale(100%) contrast(1.2)` to the dashboard
- **Voice Commands** (Nurse): `webkitSpeechRecognition` for hands-free task dispatch
- **SHAP Explanations**: Click any fall-risk badge to see AI reasoning
- **Consent Toggles**: Blockchain-logged consent management for patients
- **Verified Records**: Mock lab reports with on-chain verification badges
- **Patient Chat**: WhatsApp-style bot with keyword-based responses

---

## 📝 License

MIT — Free to use for hackathons and educational purposes.