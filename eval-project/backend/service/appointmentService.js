const appointmentRepository = require('../repository/appointmentRepository');

class AppointmentService {
    async getAppointments(userId) {
        return await appointmentRepository.findAll(userId);
    }

    async getAppointment(id, userId) {
        const appointment = await appointmentRepository.findById(id, userId);
        if (!appointment) throw new Error('Appointment not found');
        return appointment;
    }

    async createAppointment(data) {
        if (!data.doctorName || !data.appointmentDate) throw new Error('Doctor and Date are required');
        return await appointmentRepository.create(data);
    }

    async updateAppointment(id, data, userId) {
        const existing = await appointmentRepository.findById(id, userId);
        if (!existing) throw new Error('Appointment not found');
        return await appointmentRepository.update(id, data, userId);
    }

    async deleteAppointment(id, userId) {
        return await appointmentRepository.delete(id, userId);
    }
}

module.exports = new AppointmentService();
