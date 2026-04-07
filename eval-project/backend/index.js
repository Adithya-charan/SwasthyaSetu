require('dotenv').config();
const express = require('express');
const cors = require('cors');
const userController = require('./controller/userController');
const appointmentController = require('./controller/appointmentController');
const doctorController = require('./controller/doctorController');
const authFilter = require('./security/authFilter');
const globalErrorHandler = require('./exception/globalErrorHandler');

const app = express();

app.use(cors());
app.use(express.json());

// Public Auth Routes
app.post('/api/auth/register', (req, res, next) => userController.register(req, res, next));
app.post('/api/auth/login', (req, res, next) => userController.login(req, res, next));

// Protected Auth Routes
app.get('/api/auth/profile', authFilter, (req, res, next) => userController.profile(req, res, next));
app.post('/api/auth/logout', authFilter, (req, res, next) => {
    res.json({ success: true, message: "Logged out successfully" });
});

// User CRUD Management
app.get('/api/users', authFilter, (req, res, next) => userController.getAll(req, res, next));
app.get('/api/users/:id', authFilter, (req, res, next) => userController.getOne(req, res, next));
app.put('/api/users/:id', authFilter, (req, res, next) => userController.update(req, res, next));
app.delete('/api/users/:id', authFilter, (req, res, next) => userController.delete(req, res, next));

// Appointments CRUD
app.get('/api/appointments', authFilter, (req, res, next) => appointmentController.getAll(req, res, next));
app.get('/api/appointments/:id', authFilter, (req, res, next) => appointmentController.getOne(req, res, next));
app.post('/api/appointments', authFilter, (req, res, next) => appointmentController.create(req, res, next));
app.put('/api/appointments/:id', authFilter, (req, res, next) => appointmentController.update(req, res, next));
app.delete('/api/appointments/:id', authFilter, (req, res, next) => appointmentController.delete(req, res, next));

// Doctors Management
app.get('/api/doctors', (req, res, next) => doctorController.getAll(req, res, next));
app.post('/api/doctors', authFilter, (req, res, next) => doctorController.create(req, res, next));
app.get('/api/doctors/:id', (req, res, next) => doctorController.getOne(req, res, next));
app.put('/api/doctors/:id', authFilter, (req, res, next) => doctorController.update(req, res, next));
app.delete('/api/doctors/:id', authFilter, (req, res, next) => doctorController.delete(req, res, next));

// Error Handler
app.use(globalErrorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
