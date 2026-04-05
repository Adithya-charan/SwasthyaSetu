<div align="center">

<img src="https://img.shields.io/badge/SwasthyaSetu-स्वास्थ्य_सेतु-2563EB?style=for-the-badge&logoColor=white" alt="SwasthyaSetu" />

# 🏥 SwasthyaSetu — स्वास्थ्य सेतु

### *Bridging the Healthcare Gap Across India*

A modern, **multilingual telemedicine platform** connecting patients and doctors through real-time video consultations, AI-powered voice translation, and intelligent healthcare management — accessible in 8 Indian languages.

<br/>

[![Next.js](https://img.shields.io/badge/Next.js_14-000000?style=flat-square&logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot_3.2-6DB33F?style=flat-square&logo=spring-boot&logoColor=white)](https://spring.io/projects/spring-boot)
[![Python](https://img.shields.io/badge/FastAPI-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![MySQL](https://img.shields.io/badge/MySQL_8-4479A1?style=flat-square&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![LiveKit](https://img.shields.io/badge/LiveKit-FF4F00?style=flat-square&logo=livekit&logoColor=white)](https://livekit.io/)

<br/>

[📋 Features](#-features) · [🏗 Architecture](#-architecture) · [🚀 Quick Start](#-quick-start) · [📡 API Reference](#-api-reference) · [⚠️ Known Issues](#️-known-issues--fixes)

</div>

---

## 📌 Problem Statement

Traditional healthcare in India suffers from:
- **Long queues** and overcrowded hospitals, especially in Tier 2/3 cities
- **Language barriers** — a Tamil-speaking patient cannot communicate with a Hindi-speaking doctor
- **No digital health records** — every visit starts from scratch
- **Poor rural accessibility** — patients travel hours for a 10-minute consultation

**SwasthyaSetu** solves this with offline-capable AI translation, WebRTC video calls, and a role-based digital health ecosystem.

---

## ✨ Features

| Feature | Description | Status |
|---|---|---|
| 🎥 Video Consultations | Real-time peer-to-peer calls via WebRTC + LiveKit | ✅ Built |
| 🗣️ AI Voice Translation | Offline STT (Vosk) + IndicTrans2 — 8 Indian languages | ✅ Built |
| 📅 Appointment Booking | Book, confirm, reschedule with real-time status | ✅ Built |
| 💊 Digital Prescriptions | Doctor issues e-prescriptions, patient downloads PDF | ✅ Built |
| 🧾 Medical Records | Centralized lab reports, history, consultation logs | ✅ Built |
| 👥 Role-Based Dashboards | Admin / Doctor / Patient / Pharmacist views | ✅ Built |
| 🔔 Reminders | Appointment and medication reminders | ✅ Built |
| 🌐 8 Indian Languages | en, hi, ta, te, bn, mr, gu, kn | ✅ Built |
| 🔐 JWT Auth | Secure token-based authentication | ✅ Built |
| 📱 Responsive | Mobile-first Tailwind CSS design | ✅ Built |

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                  Next.js 14 Frontend (Port 3000)            │
│        App Router · TypeScript · Tailwind CSS               │
│   WebRTC (LiveKit) · Socket.IO · SpeechSynthesis API        │
└──────────────────────┬──────────────────────────────────────┘
                       │ REST + WebSocket
          ┌────────────┴────────────┐
          │                         │
          ▼                         ▼
┌──────────────────┐    ┌─────────────────────────┐
│  Spring Boot     │    │  Node.js / Express       │
│  (Port 8080)     │    │  (Port 5000)             │
│                  │    │                          │
│  • JWT Auth      │    │  • Socket.IO signaling   │
│  • Appointments  │    │  • LiveKit token server  │
│  • Prescriptions │    │  • File uploads (Multer) │
│  • JPA + MySQL   │    │  • MongoDB / Mongoose    │
└────────┬─────────┘    └──────────────────────────┘
         │ HTTP (internal)
         ▼
┌──────────────────────────┐
│  Python FastAPI          │
│  ML Microservice         │
│  (Port 8000)             │
│                          │
│  • Vosk Offline STT      │
│  • IndicTrans2 (NMT)     │
│  • FFmpeg audio pipeline │
└──────────────────────────┘
         │
    ┌────┴────┐
    │  MySQL  │   ← Spring Boot entities
    │  Mongo  │   ← Node.js (users, sessions)
    └─────────┘
```

---

## 🗂 Project Structure

```
SwasthyaSetu/
├── src/                          # Next.js 14 App Router frontend
│   ├── app/
│   │   ├── admin/                # Admin dashboard & management
│   │   ├── doctor/               # Doctor portal
│   │   ├── patient/              # Patient portal
│   │   │   ├── appointments/
│   │   │   ├── book/
│   │   │   ├── consultation/     # WebRTC video room
│   │   │   ├── dashboard/
│   │   │   ├── doctors/
│   │   │   ├── lab-reports/
│   │   │   ├── prescriptions/
│   │   │   ├── profile/
│   │   │   ├── records/
│   │   │   ├── reminders/
│   │   │   ├── settings/
│   │   │   └── symptoms/
│   │   ├── pharmacist/
│   │   ├── login/
│   │   ├── signup/
│   │   └── api/                  # Next.js API proxy routes
│   ├── components/               # Shared UI components
│   ├── context/                  # React Context providers
│   ├── data/                     # Static mock data / constants
│   ├── lib/                      # Utilities (utils.ts, swasthyas...)
│   └── services/                 # WebRTC, API call wrappers
│
├── server/                       # Node.js + Express backend
│   └── index.js                  # Socket.IO + REST API
│
├── webrtc-demo/                  # Standalone WebRTC test harness
│
├── .env.example                  # Environment variable template
├── DESIGN_SYSTEM.md              # Design tokens & component guide
├── next.config.js
├── tailwind.config.ts
└── package.json
```

---

## 🚀 Quick Start

### Prerequisites

| Tool | Version | Install |
|---|---|---|
| Node.js | ≥ 18.x | [nodejs.org](https://nodejs.org) |
| Java JDK | 17 | [adoptium.net](https://adoptium.net) |
| Python | ≥ 3.10 | [python.org](https://python.org) |
| MySQL | 8.x | [mysql.com](https://mysql.com) |
| FFmpeg | Latest | `sudo apt install ffmpeg` |
| Maven | 3.9+ | [maven.apache.org](https://maven.apache.org) |

---

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/Adithya-charan/SwasthyaSetu.git
cd SwasthyaSetu
```

---

### 2️⃣ Environment Setup

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
# Next.js Frontend
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
NEXT_PUBLIC_LIVEKIT_URL=wss://your-livekit-server.com

# Node.js Server
MONGODB_URI=mongodb://localhost:27017/swasthyasetu
JWT_SECRET=your_super_secret_jwt_key_min_32_chars
PORT=5000

# LiveKit
LIVEKIT_API_KEY=your_livekit_api_key
LIVEKIT_API_SECRET=your_livekit_api_secret
LIVEKIT_URL=wss://your-livekit-server.com

# Spring Boot (also set in application.properties)
MYSQL_URL=jdbc:mysql://localhost:3306/swasthyasetu_db
MYSQL_USERNAME=root
MYSQL_PASSWORD=your_mysql_password
```

---

### 3️⃣ Database Setup

**MySQL** (for Spring Boot):
```sql
CREATE DATABASE swasthyasetu_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
```

**MongoDB** (for Node.js server):
```bash
# MongoDB starts automatically on most systems
# Verify it's running:
mongosh --eval "db.runCommand({ connectionStatus: 1 })"
```

---

### 4️⃣ Install Frontend Dependencies

```bash
npm install
```

---

### 5️⃣ Run the Node.js Server

```bash
npm run server
# Starts Express + Socket.IO on http://localhost:5000
```

---

### 6️⃣ Run the Spring Boot Backend

```bash
# Edit src/main/resources/application.properties first
cd swasthyasetu-backend   # if the Spring Boot project is separate
mvn clean install
mvn spring-boot:run
# Starts on http://localhost:8080
```

---

### 7️⃣ Run the Python ML Microservice

```bash
cd python-ml-service
python -m venv venv
source venv/bin/activate       # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Download Vosk models (required for offline STT)
mkdir -p vosk_models
# Hindi model (~1.4GB):
wget https://alphacephei.com/vosk/models/vosk-model-hi-0.22.zip
unzip vosk-model-hi-0.22.zip -d vosk_models/hi

# English fallback (~40MB):
wget https://alphacephei.com/vosk/models/vosk-model-small-en-us-0.15.zip
unzip vosk-model-small-en-us-0.15.zip -d vosk_models/en

# Start the service
uvicorn app:app --host 0.0.0.0 --port 8000
```

---

### 8️⃣ Run the Next.js Frontend

```bash
npm run dev
# Opens http://localhost:3000
```

### Run Everything at Once

```bash
npm run dev:all
# Concurrently starts: Next.js + Node server + LiveKit token server + AI agent
```

---

## 📡 API Reference

### Authentication (Node.js — Port 5000)

| Method | Endpoint | Auth | Body | Description |
|---|---|---|---|---|
| `POST` | `/api/auth/register` | None | `{fullName, email, password, role}` | Register new user |
| `POST` | `/api/auth/login` | None | `{email, password}` | Login, returns JWT |

### Appointments (Spring Boot — Port 8080)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/appointments/my` | JWT | Get current user's appointments |
| `POST` | `/api/appointments` | PATIENT | Book a new appointment |
| `PATCH` | `/api/appointments/{id}/status` | DOCTOR | Update appointment status |

### Prescriptions (Spring Boot — Port 8080)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/prescriptions` | DOCTOR | Submit prescription |
| `GET` | `/api/prescriptions/my` | PATIENT | Get patient's prescriptions |
| `GET` | `/api/prescriptions/appointment/{id}` | JWT | Get by appointment |

### AI Voice Translation (Python — Port 8000)

| Method | Endpoint | Body | Description |
|---|---|---|---|
| `POST` | `/process-audio-chunk` | `multipart: audio, sourceLanguage, targetLanguage` | STT + translate |
| `GET` | `/health` | — | Check model load status |

**Response:**
```json
{
  "originalText": "मुझे बुखार है",
  "translatedText": "I have a fever",
  "sourceLanguage": "hi",
  "targetLanguage": "en"
}
```

### WebSocket Events (Socket.IO — Port 5000)

| Event | Direction | Payload | Description |
|---|---|---|---|
| `join-room` | Client → Server | `{roomId, userId}` | Join consultation room |
| `offer` | Client → Server | `{roomId, offer}` | WebRTC SDP offer |
| `answer` | Client → Server | `{roomId, answer}` | WebRTC SDP answer |
| `ice-candidate` | Client → Server | `{roomId, candidate}` | ICE candidate exchange |
| `user-connected` | Server → Client | `{userId}` | New peer joined |
| `user-disconnected` | Server → Client | `{userId}` | Peer left |

---

## 👥 User Roles

### 🔴 Admin
- Manage all user accounts (approve doctors, deactivate patients)
- View platform analytics and system usage
- Broadcast announcements
- Configure system settings

### 🔵 Doctor
- View and manage appointment schedule
- Conduct video consultations with real-time translation
- Record diagnosis and issue e-prescriptions
- Access patient medical history

### 🟢 Patient
- Search doctors by specialization and language
- Book, reschedule, or cancel appointments
- Attend video consultations
- View e-prescriptions, lab reports, and medical records
- Set medication and appointment reminders

### 🟡 Pharmacist
- View doctor-issued prescriptions
- Manage medicine inventory
- Process medication orders

---

## 🌐 Supported Languages

| Code | Language | Script |
|---|---|---|
| `en` | English | Latin |
| `hi` | हिंदी (Hindi) | Devanagari |
| `ta` | தமிழ் (Tamil) | Tamil |
| `te` | తెలుగు (Telugu) | Telugu |
| `bn` | বাংলা (Bengali) | Bengali |
| `mr` | मराठी (Marathi) | Devanagari |
| `gu` | ગુજરાતી (Gujarati) | Gujarati |
| `kn` | ಕನ್ನಡ (Kannada) | Kannada |

---

## ⚠️ Known Issues & Fixes

> These are real problems found in the current codebase. Fix these before deploying.

### 🔴 Critical

**1. Dual Backend Conflict — Node.js vs Spring Boot**
```
PROBLEM: package.json has both Node.js/Express (server/) AND
         references to a Spring Boot backend. Both handle auth
         differently (MongoDB vs MySQL, different JWT secrets).
         This causes auth tokens from one to be rejected by the other.

FIX: Decide on ONE backend:
  Option A: Use Node.js/Express + MongoDB only (remove Spring Boot)
  Option B: Use Spring Boot + MySQL only (remove server/index.js)
  Option C: Clearly namespace — Node.js handles WebSocket/LiveKit only,
            Spring Boot handles all REST APIs
```

**2. JWT Secret Exposed in package.json Scripts**
```
PROBLEM: JWT_SECRET is likely hardcoded in server/index.js
         and not loaded from environment variables consistently.

FIX: Ensure ALL secrets come from process.env only.
     Add .env.local to .gitignore (verify it's there).
     Rotate any secrets that were ever committed to git.
```

**3. No `.env.local` File — Only `.env.example`**
```
PROBLEM: New contributors cannot run the project without knowing
         which values to fill in. LiveKit keys, MongoDB URI,
         and JWT secret are all required but undocumented.

FIX: Expand .env.example with inline comments explaining
     where to get each value (done in this README above).
```

### 🟡 Moderate

**4. `webrtc-demo/` is a Separate Abandoned Folder**
```
PROBLEM: webrtc-demo/ appears to be a standalone test app that
         is NOT integrated with the main Next.js project.
         It adds confusion and dead weight to the repo.

FIX: Delete webrtc-demo/ and move any useful code into
     src/services/webrtc.ts
```

**5. README Tech Stack Mismatch**
```
PROBLEM: The current README.md says:
         Backend: "Node.js + Express"
         Database: "MongoDB or Firebase"
         But the actual stack is:
         Backend: Node.js + Spring Boot (dual)
         Database: MongoDB + MySQL (dual)
         This misleads contributors and evaluators.

FIX: This README (the one you're reading now) corrects this.
```

**6. `concurrently` Runs 4 Processes — No Error Isolation**
```
PROBLEM: npm run dev:all starts Next.js + Node server +
         LiveKit token server + AI agent simultaneously.
         If one crashes, the logs are unreadable.

FIX: Add --prefix-colors and --names flags to concurrently:
```
```json
"dev:all": "concurrently --names 'NEXT,SRV,LK,AGENT' --prefix-colors 'cyan,green,yellow,magenta' \"npm run dev\" \"npm run server\" \"npm run token-server\" \"npm run agent\""
```

**7. No Input Validation on Audio Upload**
```
PROBLEM: The /process-audio-chunk endpoint in Python accepts
         any file with no MIME type or size validation.

FIX: Add FastAPI file type + size guards (already done in
     the Spring Boot VoiceTranslationController bridge).
```

### 🟢 Minor

**8. Missing `repository`, `author`, and `license` in `package.json`**
```json
"author": "Adithya Charan",
"license": "MIT",
"repository": {
  "type": "git",
  "url": "https://github.com/Adithya-charan/SwasthyaSetu"
}
```

**9. No GitHub Actions CI/CD**
```
FIX: Add .github/workflows/ci.yml to run:
     - npm run lint
     - npm run build
     on every push to main.
```

**10. No `CONTRIBUTING.md` or `LICENSE` file**

---

## 🛠 Tech Stack (Accurate)

### Frontend
| Technology | Purpose |
|---|---|
| Next.js 14 (App Router) | React framework, SSR, routing |
| TypeScript | Type safety |
| Tailwind CSS | Utility-first styling |
| Framer Motion | Animations |
| LiveKit Components React | Video call UI |
| Socket.IO Client | Real-time signaling |
| Recharts | Data visualization |
| Lucide React | Icons |

### Backend — Node.js
| Technology | Purpose |
|---|---|
| Express.js | REST API server |
| Socket.IO | WebSocket signaling |
| Mongoose | MongoDB ODM |
| jsonwebtoken | JWT auth |
| bcryptjs | Password hashing |
| Multer | File uploads |

### Backend — Spring Boot (Java 17)
| Technology | Purpose |
|---|---|
| Spring Boot 3.2 | REST API framework |
| Spring Security + JWT | Authentication & authorization |
| Spring WebSocket (STOMP) | WebRTC signaling alternative |
| Spring Data JPA / Hibernate | MySQL ORM |
| MySQL 8 | Relational database |

### ML Microservice (Python)
| Technology | Purpose |
|---|---|
| FastAPI | ML API server |
| Vosk | Offline Speech-to-Text |
| IndicTrans2 (AI4Bharat) | Indic language translation |
| FFmpeg | Audio format conversion |
| PyTorch | Model inference |

### Infrastructure
| Technology | Purpose |
|---|---|
| LiveKit | Scalable video conferencing |
| Vercel | Frontend deployment |
| Docker (recommended) | Service containerization |

---

## 🗄 Database Schema (MySQL)

```sql
-- Users & Roles
users (id, full_name, email, password, phone_number,
       preferred_language, specialization,
       medical_registration_number, is_active,
       created_at, updated_at)

roles (id, name)          -- ROLE_PATIENT, ROLE_DOCTOR, ROLE_ADMIN
user_roles (user_id, role_id)

-- Core Domain
appointments (id, room_id, patient_id, doctor_id,
              appointment_date, appointment_time,
              duration_minutes, status, patient_language,
              doctor_language, reason_for_visit, created_at)

prescriptions (id, appointment_id, doctor_id, patient_id,
               doctor_notes, medications, diagnosis,
               follow_up_date, submitted_at)

consultation_logs (id, appointment_id, chat_transcript,
                   recording_url, source_language,
                   target_language, session_started_at,
                   session_ended_at)
```

---

## 🚢 Deployment

### Frontend (Vercel)
```bash
npx vercel --prod
# Set environment variables in Vercel dashboard
```

### Backend (Render / Railway)
```bash
# Node.js server — auto-detected by Render
# Set: MONGODB_URI, JWT_SECRET, LIVEKIT_API_KEY, LIVEKIT_API_SECRET

# Spring Boot — deploy as JAR
mvn clean package
java -jar target/swasthyasetu-backend-1.0.0.jar
```

### Python ML Service (GPU recommended)
```bash
# Use a GPU instance (e.g., RunPod, Vast.ai, or AWS g4dn)
uvicorn app:app --host 0.0.0.0 --port 8000 --workers 2
```

### Docker Compose (Recommended for local)
```yaml
# docker-compose.yml (create this)
version: '3.8'
services:
  frontend:
    build: .
    ports: ["3000:3000"]
  node-server:
    build: ./server
    ports: ["5000:5000"]
    environment:
      - MONGODB_URI=mongodb://mongo:27017/swasthyasetu
  mysql:
    image: mysql:8
    environment:
      MYSQL_DATABASE: swasthyasetu_db
      MYSQL_ROOT_PASSWORD: password
  mongo:
    image: mongo:7
  ml-service:
    build: ./python-ml-service
    ports: ["8000:8000"]
```

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/AmazingFeature`
3. Commit changes: `git commit -m 'Add AmazingFeature'`
4. Push to the branch: `git push origin feature/AmazingFeature`
5. Open a Pull Request

Please read [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) before contributing UI changes.

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

## 👤 Author

**Adithya Charan**

[![GitHub](https://img.shields.io/badge/GitHub-Adithya--charan-181717?style=flat-square&logo=github)](https://github.com/Adithya-charan)

---

<div align="center">

Built with ❤️ for accessible healthcare across India

*स्वास्थ्य सेतु — Bridging Health*

</div>
