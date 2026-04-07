const doctorRepository = require('../repository/doctorRepository');

class DoctorService {
    async getAllDoctors() {
        return await doctorRepository.findAll();
    }

    async getDoctor(id) {
        const doc = await doctorRepository.findById(id);
        if (!doc) throw new Error('Doctor not found');
        return doc;
    }

    async createDoctor(data) {
        return await doctorRepository.create(data);
    }

    async updateDoctor(id, data) {
        return await doctorRepository.update(id, data);
    }

    async deleteDoctor(id) {
        return await doctorRepository.delete(id);
    }
}

module.exports = new DoctorService();
