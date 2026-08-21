# Emergency UI — Full Overhaul Plan

## Overview
Comprehensive Emergency module fix: role-gating, dispatch workflow, fleet management, paramedic notifications, voice assistant, profile/settings pages, and Doctor dashboard ER access.

## Key Design Decisions

> [!IMPORTANT]
> **Backend changes are minimal** — only adding fleet seed data and two small API endpoints (fleet CRUD + dispatch notification). No schema migration needed.

> [!WARNING]
> The current Emergency index lets any user switch roles via a UI toggle. This will be replaced with strict role-gating from `user.role`.

---

## Proposed Changes

### 1. Emergency Role Gating & Layout (`index.jsx`)
#### [MODIFY] [index.jsx](file:///c:/Users/hp/OneDrive/Desktop/codeverse'/clinicOS_plus/frontend/src/pages/Emergency/index.jsx)
- Remove role-switcher toggle entirely
- Map `user.role` → view: `acc`/`dispatcher` → ACCView, `paramedic` → ParamedicView, `admin` → ACCView with fleet mgmt
- Remove `Doctor` from Emergency UI completely
- Add Profile page modal trigger + Settings modal

---

### 2. Emergency Header Components
#### [NEW] `Emergency/components/EmergencyHeader.jsx`
- Role-aware header (no switcher)
- Profile button → opens profile modal
- Settings button → opens settings modal

#### [NEW] `Emergency/components/ProfileModal.jsx`
- Shows user info (name, role, hospital, emergency unit)
- Edit display name / contact number

#### [NEW] `Emergency/components/SettingsModal.jsx`
- Notifications toggle, GPS toggle, theme (light/dark)
- Role-specific settings (paramedic: voice sensitivity; dispatcher: auto-refresh interval)

---

### 3. Dispatcher (ACC) View — Full Dispatch Workflow
#### [MODIFY] [ACCView.jsx](file:///c:/Users/hp/OneDrive/Desktop/codeverse'/clinicOS_plus/frontend/src/pages/Emergency/ACCView.jsx)
- Add **Dispatch Panel**: location input + available ambulance chooser (sorted: Available first)
- "Send Ambulance" button → calls new backend endpoint POST `/api/ambulance/dispatch`
- Live Runs section: editable status (En Route → Arrived → Completed)
- Fleet stats bar: Total fleet count + Active count badge

#### [NEW] `Emergency/components/DispatchPanel.jsx`
- Location input (text + optional coords)
- Ambulance dropdown (Available units on top, sorted)
- Paramedic assignment
- Send button

#### [NEW] `Emergency/components/ActiveRunsTable.jsx`
- Shows runs in progress with edit controls for dispatcher/admin

---

### 4. Fleet Management
#### [MODIFY] [FleetPanel.jsx](file:///c:/Users/hp/OneDrive/Desktop/codeverse'/clinicOS_plus/frontend/src/pages/Emergency/FleetPanel.jsx)
- Add/Remove fleet units (dispatcher + admin only)
- Stats: Total Fleet / Active (Busy) / Available
- Per-unit edit: name, driver, paramedic assignment

#### [NEW] `Emergency/components/FleetStats.jsx`
- Stats bar: Total / Active / Available / Maintenance

---

### 5. Paramedic View — Location + Status + Voice
#### [MODIFY] [ParamedicView.jsx](file:///c:/Users/hp/OneDrive/Desktop/codeverse'/clinicOS_plus/frontend/src/pages/Emergency/ParamedicView.jsx)
- Show dispatched location (from dispatcher) prominently
- "Patient Reached" status update button → calls PATCH `/api/ambulance/alerts/:id`
- Voice assistant: full-screen voice mode button
- Show notification banner when dispatcher sends a run

#### [NEW] `Emergency/components/DispatchNotification.jsx`
- Animated banner with destination address
- Accept / En Route confirmation button

#### [NEW] `Emergency/components/VoiceAssistant.jsx`
- Paramedic-optimized voice capture
- Hands-free status updates ("patient reached", "en route", "returning")

---

### 6. Backend — Fleet Seed + Dispatch API
#### [MODIFY] [emergency.js (routes)](file:///c:/Users/hp/OneDrive/Desktop/codeverse'/clinicOS_plus/backend-node/src/routes/emergency.js)
- Add `POST /api/ambulance/dispatch` — assigns ambulance + stores location + notifies paramedic
- Add `POST /api/ambulance/fleet` — add fleet unit
- Add `DELETE /api/ambulance/fleet/:id` — remove fleet unit

#### [MODIFY] [schema.js (db)](file:///c:/Users/hp/OneDrive/Desktop/codeverse'/clinicOS_plus/backend-node/src/db/schema.js)
- Add fleet seed data (5-8 realistic ambulances per hospital)
- Add `dispatched_location` column to `emergency_alerts`
- Add `assigned_paramedic_id` to `emergency_alerts`

---

### 7. Doctor Dashboard — ER Access
#### [MODIFY] [DoctorDashboard/index.jsx](file:///c:/Users/hp/OneDrive/Desktop/codeverse'/clinicOS_plus/frontend/src/pages/DoctorDashboard/index.jsx)
- Add department tabs based on `user.departments` (array of assigned depts)
- If doctor has emergency duty: show ER Receiving Bay tab (DoctorView from Emergency)
- Profile + Settings modal in header

#### [NEW] `DoctorDashboard/components/DeptTabs.jsx`
- Tab bar for each department the doctor is assigned to

#### [NEW] `DoctorDashboard/components/ERPanel.jsx`
- Embeds `DoctorView` from Emergency module (receives em data)

---

### 8. useEmergency Hook Updates
#### [MODIFY] [useEmergency.js](file:///c:/Users/hp/OneDrive/Desktop/codeverse'/clinicOS_plus/frontend/src/pages/Emergency/useEmergency.js)
- Add `dispatchRun(location, ambulanceId, paramedicId)` function
- Add `dispatchedLocation` state (for paramedic view)
- Add `updateRunStatus(alertId, status)` function
- Add `addFleetUnit(data)` / `removeFleetUnit(id)` functions
- Poll for paramedic's own assigned run (paramedic view)

---

## Verification Plan

### Manual
1. Log in as `acc`/`dispatcher` → only see ACCView (no switcher)
2. Log in as `paramedic` → only see ParamedicView with location banner
3. Log in as `admin` → see ACCView + fleet add/remove
4. Log in as `er_doctor` → Emergency page not accessible; Doctor Dashboard shows ER tab
5. Dispatch a run → paramedic UI updates with location
6. Paramedic hits "Patient Reached" → ACCView status updates
7. Voice assistant works on ParamedicView
8. Fleet seed data visible (realistic ambulance names)
9. Profile + Settings modals work for both roles

