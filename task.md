# MediKiosk UI — Build Tasks

## Phase 1 — Project Scaffold
- [x] Create task.md
- [x] Scaffold Vite + React project
- [x] Install dependencies (Tailwind, Recharts, Lucide, Framer Motion, React Router, React Query)
- [x] Configure Tailwind + PostCSS
- [x] Write index.html, main.jsx, index.css, App.jsx

## Phase 2 — Shared Design System
- [x] Button, Card, Badge, Avatar, Input, Modal
- [x] StatCard, Table, Tabs, Timeline, RedFlagBanner
- [x] Mock data (patients, doctors, hospitals, encounters)

## Phase 3 — Landing Portal Selector
- [x] Landing.jsx (4 portal cards)

## Phase 4 — Patient Platform
- [x] PatientLayout (sidebar + topbar)
- [x] Dashboard (Health summary, recent activity, quick actions, consent banner)
- [x] MyCase (4-step AI flow: Start → Adaptive Interview → Upload Reports → Case Summary)
- [x] HealthRecords (Vitals + Timeline)
- [x] Documents (OCR status, uploads)
- [x] HospitalVisits (Encounter history + diagnosis + clinician details)
- [x] ConsentSharing (Zero-trust purpose-scoped grants + revocation)
- [x] Prescriptions (Active & completed medications)
- [x] LabReports (Extracted parameters & status)
- [x] Profile (Demographics + QR code identity)

## Phase 5 — Doctor Portal
- [x] DoctorLayout (Dark theme, global patient search, fast switch)
- [x] Dashboard (Today's queue, OPD metrics)
- [x] PatientCase (6-tab deep clinical view: AI Case Summary, Timeline, Documents, History, Vitals, Clinical Notes, Red-Flag Alerts, Actions drawer)
- [x] Referrals (Inter-hospital referral workflow)
- [x] Analytics (Consultation volume & charts)
- [x] Messages (Inter-clinician communication)

## Phase 6 — Hospital Admin Portal
- [x] HospitalLayout (Emerald theme, branch selector)
- [x] Dashboard (Organizational hierarchy tree, OPD/IPD metrics)
- [x] Branches (Multi-branch directory)
- [x] Departments (Clinical wings & staffing)
- [x] Doctors (Staff directory & specialty filters)
- [x] Staff (Nurses, technicians, receptionists)
- [x] Reception (Live token queue & registration)
- [x] Reports (Monthly audit charts & downloads)
- [x] Settings (ABDM HFR connector, OPD shift timings)

## Phase 7 — Super Admin Portal
- [x] SuperAdminLayout (Violet theme, national authority overview)
- [x] Dashboard (National overview KPIs, state distribution chart)
- [x] Verification (Interactive Approve/Reject workflow with checklists)
- [x] Hospitals (National registry & search)
- [x] Users (Platform RBAC governance)
- [x] AuditLogs (Immutable access logs & cryptographic trail)
- [x] Analytics (12-month growth curves & state volume)
- [x] Settings (Red-flag confidence thresholds & encryption policy)

## Phase 8 — Polish & Verify
- [x] Full production build test (`npm run build`) passed with zero errors
