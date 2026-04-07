# SwasthyaSetu - Production Healthcare Platform

A production-quality full-stack web application with clean architecture, modern UI, and secure authentication.

## Features
- **Clean Architecture**: Layered backend (Controller, Service, Repository, DTO/Model, Exception, Config).
- **Secure Authentication**: JWT-based stateless auth for both frontend and backend.
- **Frontend Routing**: Protected and public routes using React Router.
- **Validation**: Strict frontend (real-time & submit) and backend validation.
- **CRUD Operations**: Appointments management (Create, Read, Update, Delete).
- **Responsive UI**: Clean design with sidebar navigation and mobile responsiveness.

## Tech Stack
- **Frontend**: React, Vite, Axios, Lucide-React, React-Router-Dom.
- **Backend**: Node.js/Express.
- **Database**: MySQL.

## Prerequisites
- Node.js (v18+)
- MySQL instance

## Setup Instructions

### 1. Database Setup
1. Open your MySQL client (e.g. MySQL Workbench or CLI).
2. Run the commands in `backend/schema.sql` to create the database and tables.

### 2. Backend Setup
1. Go to `backend/` directory.
2. Run `npm install`.
3. Create/Update `.env` with your DB credentials:
   ```env
   DB_HOST=127.0.0.1
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=eval_db
   JWT_SECRET=supersecretkey
   PORT=5000
   ```
4. Start the server: `node index.js`.

### 3. Frontend Setup
1. Go to `frontend/` directory.
2. Run `npm install`.
3. Start the dev server: `npm run dev` (running on `http://localhost:3000`).

## Project Structure
- `backend/`: Layered Node/Express API.
- `frontend/`: Modern SPA React application.

---
*Created for SwasthyaSetu Project Evaluation (2026).*
