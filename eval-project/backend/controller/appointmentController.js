const appointmentService = require('../service/appointmentService');

class AppointmentController {
    async getAll(req, res, next) {
        try {
            const userId = req.user.id;
            const appointments = await appointmentService.getAppointments(userId);
            res.json({ success: true, appointments });
        } catch (err) {
            next(err);
        }
    }

    async getOne(req, res, next) {
        try {
            const userId = req.user.id;
            const appointment = await appointmentService.getAppointment(req.params.id, userId);
            res.json({ success: true, appointment });
        } catch (err) {
            next(err);
        }
    }

    async create(req, res, next) {
        try {
            const userId = req.user.id;
            const appointment = await appointmentService.createAppointment({ ...req.body, userId });
            res.status(201).json({ success: true, appointment });
        } catch (err) {
            next(err);
        }
    }

    async update(req, res, next) {
        try {
            const userId = req.user.id;
            const appointment = await appointmentService.updateAppointment(req.params.id, req.body, userId);
            res.json({ success: true, appointment });
        } catch (err) {
            next(err);
        }
    }

    async delete(req, res, next) {
        try {
            const userId = req.user.id;
            await appointmentService.deleteAppointment(req.params.id, userId);
            res.status(204).json({ success: true });
        } catch (err) {
            next(err);
        }
    }
}

module.exports = new AppointmentController();
