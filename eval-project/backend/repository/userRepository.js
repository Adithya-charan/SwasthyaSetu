const pool = require('../config/db');

class UserRepository {
    async findByEmail(email) {
        const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        return rows[0];
    }

    async findById(id) {
        const [rows] = await pool.query('SELECT id, name, email, role FROM users WHERE id = ?', [id]);
        return rows[0];
    }

    async create({ name, email, password, role = 'user' }) {
        const [result] = await pool.query(
            'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
            [name, email, password, role]
        );
        return { id: result.insertId, name, email, role };
    }

    async findAll() {
        const [rows] = await pool.query('SELECT id, name, email, role FROM users');
        return rows;
    }

    async update(id, { name, role }) {
        await pool.query('UPDATE users SET name = ?, role = ? WHERE id = ?', [name, role, id]);
        return { id, name, role };
    }

    async delete(id) {
        await pool.query('DELETE FROM users WHERE id = ?', [id]);
        return true;
    }
}

module.exports = new UserRepository();
