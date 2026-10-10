# TRAFFICPULSE AI — Smart Traffic Monitoring & Violation Management System

[![MERN Stack](https://img.shields.io/badge/Stack-MERN-blue.svg)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-React%2019-646CFF.svg)](https://vite.dev)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-38B2AC.svg)](https://tailwindcss.com)
[![MongoDB](https://img.shields.io/badge/MongoDB-Live%20Cluster-green.svg)](https://www.mongodb.com)
[![Status](https://img.shields.io/badge/Hackathon-Production%20Ready-emerald.svg)]()

> A full-stack, enterprise-grade Traffic Enforcement & Violation Management Platform built with the **MERN** stack (MongoDB, Express, React with Vite, Node.js). Designed for high hackathon impact, complete role-based views, live CCTV simulation, photographic evidence uploads, and automated fine issuance.

---

## Quick Start (Run in 1 Command)

### 1. Install all dependencies
```bash
npm run install:all
```
*(Installs root orchestrator, backend packages, and frontend Vite packages)*

### 2. Run the Full Stack Application
```bash
npm run dev
```
Both services will start simultaneously:
- **Frontend Dashboard:** [http://localhost:5173](http://localhost:5173)
- **Backend API Server:** [http://localhost:5000](http://localhost:5000)
- **API Health Telemetry:** [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## Pre-Configured Demo Accounts (1-Click Switcher)

You can toggle between roles **in one click** using the top navigation bar dropdown or sign in using these pre-seeded accounts (password for all demo accounts is `password123`):

| Role | Name | Email | Key Capabilities |
| :--- | :--- | :--- | :--- |
| **Traffic Officer** *(Default)* | Inspector Vikram Rathore | `officer@traffic.gov` | Adjudicate evidence, verify/reject violations, CCTV camera feeds, radar alerts |
| **Citizen Reporter** | Pooja Verma | `citizen@citizen.in` | Submit violation reports with photos, track report status, earn civic safety points |
| **Vehicle Owner** | Rajesh Sharma | `owner@citizen.in` | Owns `DL-01-AB-1234` & `HR-26-EQ-9012`, views violations, settles challans via UPI |
| **Commercial Driver** | Amit Kumar | `driver@citizen.in` | Assigned driver for `DL-01-AB-1234`, views driving safety record |
| **System Admin** | HQ Controller | `admin@traffic.gov` | Complete registry overview, system analytics, fine revenues, database telemetry |

---

## Hackathon 2-Minute Winning Demo Script

Follow this step-by-step workflow during your presentation to demonstrate the entire lifecycle of the system:

1. **Start as Citizen (`citizen@citizen.in`):**
   - Click the top-bar role selector and pick **Citizen Reporter**.
   - Navigate to **"Report Violation"**.
   - Enter Vehicle Plate `DL-01-AB-1234`, pick infraction `Red Light Jumping`, location `Janpath Intersection`.
   - Pick or upload an evidence photo (or click one of the instant demo photo buttons).
   - Click **"Submit Violation Report"**. Notice the generated Ticket ID (e.g., `VIO-2026-XXXX`). Status begins as `Pending`.

2. **Switch to Traffic Officer (`officer@traffic.gov`):**
   - Use the top-bar dropdown to switch to **Traffic Officer**.
   - Go to **"All Reports & Review"**. The report submitted by the citizen appears right at the top!
   - Click **"Review"** to inspect high-resolution photo evidence in the zoom viewer.
   - Add officer remarks: *"Stop-line violation corroborated"*.
   - Click **"Verify & Issue E-Challan"**.
   - **Point out to judges:** Notice how verifying the report automatically triggers an official electronic challan in the system with statutory fine amounts!

3. **Simulate AI CCTV Radar Detection (Officer View):**
   - Head over to **"Camera Monitoring"**.
   - Show the simulated multi-camera corridor feeds with live FPS, HUD radar boxes, and OCR plate tracking.
   - Click **"Trigger AI Plate Capture (Demo)"**.
   - An automated high-speed detection (e.g. 88 km/h in a 50 km/h zone) is instantly processed and queued into the police workflow.

4. **Switch to Vehicle Owner (`owner@citizen.in`):**
   - Switch role to **Vehicle Owner**.
   - Go to **"My Vehicles"** -> Show vehicle `DL-01-AB-1234` and linked driver `Amit Kumar`.
   - Go to **"Payable Fines / Challans"**. The newly generated challan is waiting for settlement.
   - Click **"Pay Now"** -> Choose UPI / QR -> Click **"Confirm & Pay"**.
   - An official digital receipt with Transaction ID and settlement timestamp is instantly generated!

5. **Review Central Analytics as Admin (`admin@traffic.gov`):**
   - Switch role to **System Admin**.
   - Show the **Dashboard**: KPI metrics, Infraction Breakdown charts, and the **MongoDB Live Cluster status badge**.

---

## Technical Architecture

```
smart-traffic-monitoring/
├── client/                     # Vite + React 19 + Tailwind CSS Frontend
│   ├── src/
│   │   ├── api/api.js          # Axios client with JWT interceptor & baseURL proxy
│   │   ├── context/AuthContext # RBAC context with 1-click role switcher
│   │   ├── components/         # Navbar, Sidebar, StatusBadge, Modals
│   │   ├── pages/              # 8 Dedicated role-based pages
│   │   ├── App.jsx             # React Router DOM layout and routing
│   │   └── index.css           # Modern dark-mode palette & radar styles
│   └── vite.config.js          # Vite config with @tailwindcss/vite & API proxy
├── server/                     # Node.js + Express + MongoDB Backend
│   ├── src/
│   │   ├── config/db.js        # MongoDB connection with auto-fallback
│   │   ├── config/inMemoryStore# High-speed in-memory store for 100% demo resilience
│   │   ├── models/             # User, Vehicle, Violation, Fine, Camera
│   │   ├── middleware/         # JWT auth protect, RBAC authorize, multer upload
│   │   ├── routes/             # auth, vehicles, violations, fines, cameras, stats
│   │   ├── seed/               # Initial seed data for Indian traffic scenarios
│   │   └── server.js           # Express app, static /uploads, health check
│   ├── uploads/                # Safe disk storage for photo evidence
│   └── .env                    # PORT=5000, MONGO_URI, JWT_SECRET
├── test-e2e.js                 # Automated end-to-end integration test suite
└── package.json                # Root orchestrator with concurrently scripts
```

---

## Dual-Engine Resilience Guarantee

This project is built to **never fail during a live demo**:
- **Primary:** Automatically connects to your local **MongoDB Server** (`mongodb://127.0.0.1:27017/smart_traffic_db`).
- **Resilient Fallback:** If MongoDB is ever stopped or unreachable, the server automatically and transparently toggles to a **Local Demo In-Memory Store** that supports identical CRUD workflows, ensuring the presentation runs uninterrupted without crashing.

---

## Automated Verification Suite

To verify all backend and frontend workflows programmatically, run:
```bash
npm run test:e2e
```

Checks tested and passing:
- Health check & database connection
- JWT token authentication for multiple roles
- Public violation reporting
- Officer review & approval workflow
- Automated fine generation
- Instant UPI payment clearance
- Simulated AI camera trigger
- Central command analytics calculation
