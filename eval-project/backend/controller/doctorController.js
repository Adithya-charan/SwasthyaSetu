const doctorService = require('../service/doctorService');

class DoctorController {
    async getAll(req, res, next) {
        try {
            const doctors = await doctorService.getAllDoctors();
            res.json({ success: true, doctors });
        } catch (err) {
            next(err);
        }
    }

    async getOne(req, res, next) {
        try {
            const doctor = await doctorService.getDoctor(req.params.id);
            res.json({ success: true, doctor });
        } catch (err) {
            next(err);
        }
    }

    async create(req, res, next) {
        try {
            const doctor = await doctorService.createDoctor(req.body);
            res.status(201).json({ success: true, doctor });
        } catch (err) {
            next(err);
        }
    }

    async update(req, res, next) {
        try {
            const doctor = await doctorService.updateDoctor(req.params.id, req.body);
            res.json({ success: true, doctor });
        } catch (err) {
            next(err);
        }
    }

    async delete(req, res, next) {
        try {
            await doctorService.deleteDoctor(req.params.id);
            res.status(204).json({ success: true });
        } catch (err) {
            next(err);
        }
    }
}

module.exports = new DoctorController();
