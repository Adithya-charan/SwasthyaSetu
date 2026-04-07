const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userRepository = require('../repository/userRepository');

class UserService {
    async registerUser({ name, email, password }) {
        const existing = await userRepository.findByEmail(email);
        if (existing) {
            const err = new Error('User already exists');
            err.statusCode = 400;
            throw err;
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        return await userRepository.create({ name, email, password: hashedPassword });
    }

    async loginUser({ email, password }) {
        const user = await userRepository.findByEmail(email);
        if (!user) {
            const err = new Error('Invalid credentials');
            err.statusCode = 401;
            throw err;
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            const err = new Error('Invalid credentials');
            err.statusCode = 401;
            throw err;
        }

        const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, {
            expiresIn: '7d'
        });

        return { token, user: { id: user.id, name: user.name, email: user.email, role: user.role } };
    }

    async getUserProfile(id) {
        return await userRepository.findById(id);
    }

    async getAllUsers() {
        return await userRepository.findAll();
    }

    async updateUser(id, data) {
        return await userRepository.update(id, data);
    }

    async deleteUser(id) {
        return await userRepository.delete(id);
    }
}

module.exports = new UserService();
