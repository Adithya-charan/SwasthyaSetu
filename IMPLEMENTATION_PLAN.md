# SwasthyaSetu Rewrite - Implementation Plan

## Phase 1: Authentication & Onboarding Overhaul
- [x] Implement global language context and initial language selector screen.
- [x] Remove existing signup/login flows.
- [x] Build new multi-step signup: Role Selection -> Form (Role-specific) -> OTP.
- [x] Implement Admin Approval logic (Users stay pending until admin action).
- [x] Build new OTP-based Login flow (Phone + Password -> OTP -> JWT).
- [x] Set up basic backend endpoints for new Auth flow (Registration, OTP, Approval).
- [x] Update `ProtectedRoute.tsx` to handle `account_status` (pending/active).

## Phase 2: Admin Dashboard & Monitoring
- [x] Build "Pending Approvals" dashboard section (Doctors, Patients, Pharmacists).
- [x] Build "User Management" (`/admin/users`) with search, filter, and actions (Suspend, Delete).
- [x] Build "Activity Monitoring" (Real-time Socket.io table for logins/logouts).
- [x] Update "Platform Analytics" (`/admin/dashboard`) to use real data.
- [x] Build "System Broadcast" feature (`/admin/broadcast`).
- [x] Build "Prescription Monitor" for admins.

## Phase 3: Video Calling & WebRTC (Replacing LiveKit/Jitsi)
- [x] Remove `livekit-client` and `@jitsi/react-sdk` dependencies and usage.
- [x] Build new WebRTC signaling logic in the Node.js Express server using Socket.io.
- [x] Create the new Video Call UI (large remote, PiP local, controls, connection state).
- [x] Implement slide-in Chat Panel with Socket.io real-time text chat.
- [x] Implement File/Image sharing in chat with Tesseract.js OCR for medical docs.
- [x] Build the Doctor Post-Call Prescription Modal and backend integration.

## Phase 4: Global AI Chatbot & Translations
- [x] Create floating AI Chatbot component accessible everywhere.
- [x] Implement Navigation Commands using AI intent parsing.
- [x] Integrate Web Speech API for voice input to text.
- [x] Implement Voice Password entry for the login page.
- [x] Integrate chat-based message translation in the Video call chat and Global chatbot.

## Phase 5: Pharmacist Portal & Payments
- [x] Build Real-time Prescription Queue (`/pharmacist/prescription`) via Socket.io.
- [x] Build Medicine Fulfillment & Billing flow.
- [x] Implement Payment Request feature (In-app notification + SMS placeholder).
- [x] Build Inventory Tracker (`/pharmacist/inventory`) with low-stock alerts.
- [x] Build Order History page.

## Phase 6: Patient & Doctor Portals & Data Reset
- [x] Update Patient Records (`/patient/records`) and Symptom Checker.
- [x] Build Reminders system.
- [x] Update Doctor Dashboard, Patient Records view, Schedule manager.
- [x] Wipe existing dummy data from DB initialization scripts.
- [x] Seed database with requested Indian names (8-10 Doctors, 6-8 Patients, 1 Pharmacist).

## Phase 7: Backend & Database Schema Updates
- [x] Update MySQL/PostgreSQL schema for users (language_preference, status, etc.).
- [x] Update MongoDB schema for call_sessions, prescriptions_v2, payment_records, otp_records.
- [x] Ensure robust error handling, loading states, and responsive design across all new UI.
