const pool = require('../config/db');

class DoctorRepository {
    async findAll() {
        const [rows] = await pool.query('SELECT * FROM doctors');
        return rows;
    }

    async findById(id) {
        const [rows] = await pool.query('SELECT * FROM doctors WHERE id = ?', [id]);
        return rows[0];
    }

    async create({ name, specialization, experience, availability }) {
        const [result] = await pool.query(
            'INSERT INTO doctors (name, specialization, experience, availability) VALUES (?, ?, ?, ?)',
            [name, specialization, experience, availability]
        );
        return { id: result.insertId, name, specialization, experience, availability };
    }

    async update(id, { name, specialization, experience, availability }) {
        await pool.query(
            'UPDATE doctors SET name = ?, specialization = ?, experience = ?, availability = ? WHERE id = ?',
            [name, specialization, experience, availability, id]
        );
        return { id, name, specialization, experience, availability };
    }

    async delete(id) {
        await pool.query('DELETE FROM doctors WHERE id = ?', [id]);
        return true;
    }
}

module.exports = new DoctorRepository();
