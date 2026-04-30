<div align="center">



# 🏥 SwasthyaSetu — स्वास्थ्य सेतु

### *Bridging the Healthcare Gap Across India*

A modern, **multilingual telemedicine platform** connecting patients and doctors through real-time video consultations, AI-powered voice translation, and intelligent healthcare management — accessible in **8 Indian languages**.

<br/>

[![Next.js](https://img.shields.io/badge/Next.js_14-000000?style=flat-square&logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot_3.2-6DB33F?style=flat-square&logo=spring-boot&logoColor=white)](https://spring.io/projects/spring-boot)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![MySQL](https://img.shields.io/badge/MySQL_8-4479A1?style=flat-square&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![LiveKit](https://img.shields.io/badge/LiveKit-FF4F00?style=flat-square)](https://livekit.io/)

<br/>

### 🌐 Live Deployments

| Service | URL |
|---|---|
| 🖥️ **Frontend** (Vercel) | [adithya-charan-swasthya-setu-fiip.vercel.app](https://adithya-charan-swasthya-setu-fiip.vercel.app/) |
| ⚙️ **Backend API** (Render) | [swasthyasetu-ijl5.onrender.com](https://swasthyasetu-ijl5.onrender.com) |

### 📦 Repositories

| Repo | Link |
|---|---|
| 🎨 **Frontend + Node Server** | [github.com/Adithya-charan/SwasthyaSetu](https://github.com/Adithya-charan/SwasthyaSetu) |
| ☕ **Spring Boot Backend** | [github.com/Adithya-charan/swasthyasetu-backend](https://github.com/Adithya-charan/swasthyasetu-backend) |

<br/>

[📌 Problem](#-problem-statement) · [✨ Features](#-features) · [🏗 Architecture](#-architecture) · [🚀 Quick Start](#-quick-start) · [📡 API Reference](#-api-reference) · [👥 Roles](#-user-roles) · [🌐 Languages](#-supported-languages) · [🚢 Deployment](#-deployment)

</div>

---

## 📌 Problem Statement

Traditional healthcare in India suffers from:

- **Long queues** and overcrowded hospitals, especially in Tier 2/3 cities
- **Language barriers** — a Tamil-speaking patient cannot communicate with a Hindi-speaking doctor
- **No digital health records** — every visit starts from scratch
- **Poor rural accessibility** — patients travel hours for a 10-minute consultation

**SwasthyaSetu** solves this with offline-capable AI translation, WebRTC video calls, and a role-based digital health ecosystem — accessible from any device.

---

## ✨ Features

| Feature | Description | Status |
|---|---|---|
| 🎥 Video Consultations | Real-time peer-to-peer calls via WebRTC + LiveKit | ✅ Live |
| 🗣️ AI Voice Translation | Offline STT (Vosk) + IndicTrans2 — 8 Indian languages | ✅ Live |
| 📅 Appointment Booking | Book, confirm, reschedule with real-time status | ✅ Live |
| 💊 Digital Prescriptions | Doctor issues e-prescriptions, patient downloads PDF | ✅ Live |
| 🧾 Medical Records | Centralized lab reports, history, consultation logs | ✅ Live |
| 👥 Role-Based Dashboards | Admin / Doctor / Patient / Pharmacist views | ✅ Live |
| 🔔 Reminders | Appointment and medication reminders | ✅ Live |
| 🌐 8 Indian Languages | en, hi, ta, te, bn, mr, gu, kn | ✅ Live |
| 🔐 JWT Auth | Secure token-based authentication | ✅ Live |
| 📱 Responsive Design | Mobile-first Tailwind CSS design | ✅ Live |

---

## 🏗 Architecture

The platform uses a **three-service backend architecture** with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────────────┐
│              Next.js 14 Frontend  (Vercel · Port 3000)          │
│         App Router · TypeScript · Tailwind CSS                  │
│    LiveKit Components · Socket.IO Client · SpeechSynthesis API  │
└────────────────────────┬────────────────────────────────────────┘
                         │  REST + WebSocket
           ┌─────────────┴──────────────┐
           │                            │
           ▼                            ▼
┌──────────────────────┐    ┌───────────────────────────┐
│  Spring Boot         │    │  Node.js / Express        │
│  (Render · Port 8080)│    │  (Port 5000)              │
│                      │    │                           │
│  • JWT Auth          │    │  • Socket.IO signaling    │
│  • Appointments API  │    │  • LiveKit token server   │
│  • Prescriptions API │    │  • File uploads (Multer)  │
│  • Medical Records   │    │  • User sessions (MongoDB)│
│  • Spring Data JPA   │    │  • bcryptjs + JWT         │
│  • MySQL 8           │    │  • MongoDB / Mongoose     │
└──────────┬───────────┘    └───────────────────────────┘
           │  HTTP (internal)
           ▼
┌──────────────────────────────┐
│  Python FastAPI              │
│  ML Microservice (Port 8000) │
│                              │
│  • Vosk — Offline STT        │
│  • IndicTrans2 (AI4Bharat)   │
│  • FFmpeg audio pipeline     │
│  • PyTorch model inference   │
└──────────────────────────────┘
           │
      ┌────┴────┐
      │  MySQL  │  ← Spring Boot entities (appointments, prescriptions)
      │  MongoDB│  ← Node.js (users, sessions, file metadata)
      └─────────┘
```

### Service Responsibilities

| Service | Technology | Responsibility |
|---|---|---|
| Frontend | Next.js 14 + TypeScript | UI, routing, WebRTC client, translation UI |
| REST API | Spring Boot 3.2 (Java 17) | Auth, appointments, prescriptions, medical records |
| Realtime Server | Node.js + Express | Socket.IO signaling, LiveKit tokens, file uploads |
| ML Microservice | Python FastAPI | Speech-to-text, Indic language translation |
| Primary DB | MySQL 8 | Relational data — users, appointments, prescriptions |
| Secondary DB | MongoDB | Sessions, file metadata, chat transcripts |
| Video | LiveKit | Scalable WebRTC video infrastructure |

---

## 🗂 Project Structure

```
SwasthyaSetu/                          ← Frontend repo
├── src/
│   ├── app/
│   │   ├── admin/                     # Admin dashboard & management
│   │   ├── doctor/                    # Doctor portal
│   │   ├── patient/
│   │   │   ├── appointments/
│   │   │   ├── book/
│   │   │   ├── consultation/          # WebRTC video room
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
│   │   └── api/                       # Next.js API proxy routes
│   ├── components/                    # Shared UI components
│   ├── context/                       # React Context providers
│   ├── data/                          # Static data / constants
│   ├── lib/                           # Utilities (utils.ts etc.)
│   └── services/                      # WebRTC, API wrappers
│
├── server/
│   └── index.js                       # Node.js Express + Socket.IO
│
├── .env.example
├── DESIGN_SYSTEM.md
├── next.config.js
├── tailwind.config.ts
└── package.json

swasthyasetu-backend/                  ← Spring Boot repo (separate)
├── src/main/java/
│   └── com/swasthyasetu/
│       ├── controller/
│       ├── service/
│       ├── repository/
│       ├── model/
│       ├── security/
│       └── config/
├── src/main/resources/
│   └── application.properties
└── pom.xml

python-ml-service/                     ← ML service (inside frontend repo)
├── app.py
├── requirements.txt
└── vosk_models/
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
| MongoDB | 7.x | [mongodb.com](https://www.mongodb.com/try/download/community) |
| FFmpeg | Latest | `sudo apt install ffmpeg` |
| Maven | 3.9+ | [maven.apache.org](https://maven.apache.org) |

---

### 1️⃣ Clone Both Repositories

```bash
# Frontend + Node server
git clone https://github.com/Adithya-charan/SwasthyaSetu.git
cd SwasthyaSetu

# Spring Boot backend (in a separate terminal / folder)
git clone https://github.com/Adithya-charan/swasthyasetu-backend.git
```

---

### 2️⃣ Environment Setup

```bash
cp .env.example .env.local
```

Edit `.env.local` with your values:

```env
# ──────────────────────────────
# Next.js Frontend
# ──────────────────────────────
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
NEXT_PUBLIC_LIVEKIT_URL=wss://your-livekit-server.livekit.cloud

# ──────────────────────────────
# Node.js Server (port 5000)
# ──────────────────────────────
MONGODB_URI=mongodb://localhost:27017/swasthyasetu
JWT_SECRET=your_super_secret_jwt_key_minimum_32_chars
PORT=5000

# ──────────────────────────────
# LiveKit
# Get keys at: https://cloud.livekit.io
# ──────────────────────────────
LIVEKIT_API_KEY=your_livekit_api_key
LIVEKIT_API_SECRET=your_livekit_api_secret
LIVEKIT_URL=wss://your-livekit-server.livekit.cloud

# ──────────────────────────────
# Spring Boot (also set in application.properties)
# ──────────────────────────────
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
# Verify MongoDB is running
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
cd ../swasthyasetu-backend

# Edit src/main/resources/application.properties with your MySQL credentials first

mvn clean install
mvn spring-boot:run
# Starts REST API on http://localhost:8080
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

# Hindi model (~1.4 GB):
wget https://alphacephei.com/vosk/models/vosk-model-hi-0.22.zip
unzip vosk-model-hi-0.22.zip -d vosk_models/hi

# English fallback (~40 MB):
wget https://alphacephei.com/vosk/models/vosk-model-small-en-us-0.15.zip
unzip vosk-model-small-en-us-0.15.zip -d vosk_models/en

# Start the ML service
uvicorn app:app --host 0.0.0.0 --port 8000
```

---

### 8️⃣ Run the Next.js Frontend

```bash
npm run dev
# Opens http://localhost:3000
```

---

### ⚡ Run Everything at Once

```bash
npm run dev:all
# Concurrently starts: Next.js · Node server · LiveKit token server · AI agent
```

> **Tip:** For readable logs when running all services together, the `concurrently` script uses `--names` and `--prefix-colors` flags to color-code each service's output.

---

## 📡 API Reference

### Authentication — Node.js (Port 5000)

| Method | Endpoint | Auth | Body | Description |
|---|---|---|---|---|
| `POST` | `/api/auth/register` | None | `{fullName, email, password, role}` | Register new user |
| `POST` | `/api/auth/login` | None | `{email, password}` | Login, returns JWT |

### Appointments — Spring Boot (Port 8080)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/appointments/my` | JWT | Get current user's appointments |
| `POST` | `/api/appointments` | PATIENT | Book a new appointment |
| `PATCH` | `/api/appointments/{id}/status` | DOCTOR | Update appointment status |
| `DELETE` | `/api/appointments/{id}` | PATIENT | Cancel an appointment |

### Prescriptions — Spring Boot (Port 8080)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/prescriptions` | DOCTOR | Submit a prescription |
| `GET` | `/api/prescriptions/my` | PATIENT | Get patient's prescriptions |
| `GET` | `/api/prescriptions/appointment/{id}` | JWT | Get prescription by appointment |

### Medical Records — Spring Boot (Port 8080)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/records/my` | PATIENT | Get all medical records |
| `POST` | `/api/records` | DOCTOR | Upload a new record |
| `GET` | `/api/records/{id}` | JWT | Get a specific record |

### AI Voice Translation — Python (Port 8000)

| Method | Endpoint | Body | Description |
|---|---|---|---|
| `POST` | `/process-audio-chunk` | `multipart: audio, sourceLanguage, targetLanguage` | STT + translate audio |
| `GET` | `/health` | — | Check model load status |

**Sample Response:**
```json
{
  "originalText": "मुझे बुखार है",
  "translatedText": "I have a fever",
  "sourceLanguage": "hi",
  "targetLanguage": "en"
}
```

### WebSocket Events — Socket.IO (Port 5000)

| Event | Direction | Payload | Description |
|---|---|---|---|
| `join-room` | Client → Server | `{roomId, userId}` | Join a consultation room |
| `offer` | Client → Server | `{roomId, offer}` | WebRTC SDP offer |
| `answer` | Client → Server | `{roomId, answer}` | WebRTC SDP answer |
| `ice-candidate` | Client → Server | `{roomId, candidate}` | ICE candidate exchange |
| `user-connected` | Server → Client | `{userId}` | New peer joined room |
| `user-disconnected` | Server → Client | `{userId}` | Peer left room |

---

## 👥 User Roles

### 🔴 Admin
- Manage all user accounts (approve doctors, deactivate patients)
- View platform analytics and system usage
- Broadcast announcements
- Configure system settings

### 🔵 Doctor
- View and manage appointment schedule
- Conduct video consultations with real-time AI translation
- Record diagnosis and issue e-prescriptions
- Access patient medical history

### 🟢 Patient
- Search doctors by specialization and preferred language
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

## 🛠 Tech Stack

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

### Backend — Spring Boot (Java 17)
| Technology | Purpose |
|---|---|
| Spring Boot 3.2 | REST API framework |
| Spring Security + JWT | Authentication & authorization |
| Spring Data JPA / Hibernate | MySQL ORM |
| MySQL 8 | Relational database |

### Backend — Node.js
| Technology | Purpose |
|---|---|
| Express.js | REST API + server |
| Socket.IO | WebSocket signaling |
| Mongoose | MongoDB ODM |
| jsonwebtoken | JWT auth |
| bcryptjs | Password hashing |
| Multer | File uploads |
| MongoDB | Session & file metadata storage |

### ML Microservice (Python)
| Technology | Purpose |
|---|---|
| FastAPI | ML API server |
| Vosk | Offline Speech-to-Text (no internet required) |
| IndicTrans2 (AI4Bharat) | Indic language neural machine translation |
| FFmpeg | Audio format conversion |
| PyTorch | Model inference |

### Infrastructure
| Technology | Purpose |
|---|---|
| LiveKit | Scalable WebRTC video conferencing |
| Vercel | Frontend deployment |
| Render | Spring Boot backend deployment |
| Docker | Recommended for local multi-service setup |

---

## 🗄 Database Schema (MySQL)

```sql
-- Users & Roles
users (
  id, full_name, email, password_hash, phone_number,
  preferred_language, specialization,
  medical_registration_number, is_active,
  created_at, updated_at
)
roles (id, name)           -- ROLE_PATIENT, ROLE_DOCTOR, ROLE_ADMIN, ROLE_PHARMACIST
user_roles (user_id, role_id)

-- Core Domain
appointments (
  id, room_id, patient_id, doctor_id,
  appointment_date, appointment_time,
  duration_minutes, status,
  patient_language, doctor_language,
  reason_for_visit, created_at
)

prescriptions (
  id, appointment_id, doctor_id, patient_id,
  doctor_notes, medications, diagnosis,
  follow_up_date, submitted_at
)

consultation_logs (
  id, appointment_id, chat_transcript,
  recording_url, source_language, target_language,
  session_started_at, session_ended_at
)
```

---

## 🚢 Deployment

### Frontend — Vercel

```bash
npx vercel --prod
# Set all NEXT_PUBLIC_* environment variables in the Vercel dashboard
```

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Adithya-charan/SwasthyaSetu)

### Spring Boot Backend — Render

```bash
# Build the JAR
cd swasthyasetu-backend
mvn clean package -DskipTests

# Run on your server / Render
java -jar target/swasthyasetu-backend-*.jar
```

Set these environment variables on Render:
- `MYSQL_URL`
- `MYSQL_USERNAME`
- `MYSQL_PASSWORD`
- `JWT_SECRET`

### Python ML Service — GPU Recommended

```bash
# Recommended: GPU instance (RunPod, Vast.ai, or AWS g4dn)
uvicorn app:app --host 0.0.0.0 --port 8000 --workers 2
```

### Docker Compose — Local Development

```yaml
# docker-compose.yml
version: '3.8'
services:

  frontend:
    build: .
    ports:
      - "3000:3000"
    env_file: .env.local
    depends_on:
      - node-server
      - spring-boot

  node-server:
    build: ./server
    ports:
      - "5000:5000"
    environment:
      - MONGODB_URI=mongodb://mongo:27017/swasthyasetu
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      - mongo

  spring-boot:
    build: ../swasthyasetu-backend
    ports:
      - "8080:8080"
    environment:
      - MYSQL_URL=jdbc:mysql://mysql:3306/swasthyasetu_db
      - MYSQL_USERNAME=root
      - MYSQL_PASSWORD=${MYSQL_PASSWORD}
    depends_on:
      - mysql

  ml-service:
    build: ./python-ml-service
    ports:
      - "8000:8000"

  mysql:
    image: mysql:8
    environment:
      MYSQL_DATABASE: swasthyasetu_db
      MYSQL_ROOT_PASSWORD: ${MYSQL_PASSWORD}
    volumes:
      - mysql_data:/var/lib/mysql

  mongo:
    image: mongo:7
    volumes:
      - mongo_data:/data/db

volumes:
  mysql_data:
  mongo_data:
```

```bash
docker-compose up --build
```

---

## 🤝 Contributing

1. Fork the relevant repository
2. Create your feature branch: `git checkout -b feature/AmazingFeature`
3. Commit your changes: `git commit -m 'Add AmazingFeature'`
4. Push to the branch: `git push origin feature/AmazingFeature`
5. Open a Pull Request

Please read [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) before contributing UI changes.

---

## 📄 License

Distributed under the MIT License. See [`LICENSE`](./LICENSE) for more information.

---

## 👤 Author

**Adithya Charan**

[![GitHub](https://img.shields.io/badge/GitHub-Adithya--charan-181717?style=flat-square&logo=github)](https://github.com/Adithya-charan)
[![Frontend Repo](https://img.shields.io/badge/Repo-SwasthyaSetu_Frontend-2563EB?style=flat-square&logo=github)](https://github.com/Adithya-charan/SwasthyaSetu)
[![Backend Repo](https://img.shields.io/badge/Repo-SwasthyaSetu_Backend-6DB33F?style=flat-square&logo=github)](https://github.com/Adithya-charan/swasthyasetu-backend)

---

<div align="center">

Built with ❤️ for accessible healthcare across India

**Live Demo:** [adithya-charan-swasthya-setu-fiip.vercel.app](https://adithya-charan-swasthya-setu-fiip.vercel.app/)

*स्वास्थ्य सेतु — Bridging Health*

</div>
