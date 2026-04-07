const pool = require('../config/db');

class AppointmentRepository {
    async findAll(userId) {
        const [rows] = await pool.query('SELECT * FROM appointments WHERE user_id = ?', [userId]);
        return rows;
    }

    async findById(id, userId) {
        const [rows] = await pool.query('SELECT * FROM appointments WHERE id = ? AND user_id = ?', [id, userId]);
        return rows[0];
    }

    async create({ userId, doctorName, appointmentDate, reason }) {
        const [result] = await pool.query(
            'INSERT INTO appointments (user_id, doctor_name, appointment_date, reason) VALUES (?, ?, ?, ?)',
            [userId, doctorName, appointmentDate, reason]
        );
        return { id: result.insertId, userId, doctorName, appointmentDate, reason };
    }

    async update(id, { doctorName, appointmentDate, reason }, userId) {
        await pool.query(
            'UPDATE appointments SET doctor_name = ?, appointment_date = ?, reason = ? WHERE id = ? AND user_id = ?',
            [doctorName, appointmentDate, reason, id, userId]
        );
        return { id, doctorName, appointmentDate, reason };
    }

    async delete(id, userId) {
        await pool.query('DELETE FROM appointments WHERE id = ? AND user_id = ?', [id, userId]);
        return true;
    }
}

module.exports = new AppointmentRepository();
