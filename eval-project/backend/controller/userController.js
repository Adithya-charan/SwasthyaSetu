const userService = require('../service/userService');

class UserController {
    async register(req, res, next) {
        try {
            const user = await userService.registerUser(req.body);
            res.status(201).json({ success: true, user });
        } catch (err) {
            next(err);
        }
    }

    async login(req, res, next) {
        try {
            const data = await userService.loginUser(req.body);
            res.status(200).json({ success: true, ...data });
        } catch (err) {
            next(err);
        }
    }

    async profile(req, res, next) {
        try {
            const user = await userService.getUserProfile(req.user.id);
            res.json({ success: true, user });
        } catch (err) {
            next(err);
        }
    }

    async getAll(req, res, next) {
        try {
            // Usually restricted to admin role in production
            const users = await userService.getAllUsers();
            res.json({ success: true, users });
        } catch (err) {
            next(err);
        }
    }

    async getOne(req, res, next) {
        try {
            const user = await userService.getUserProfile(req.params.id);
            res.json({ success: true, user });
        } catch (err) {
            next(err);
        }
    }

    async update(req, res, next) {
        try {
            const user = await userService.updateUser(req.params.id, req.body);
            res.json({ success: true, user });
        } catch (err) {
            next(err);
        }
    }

    async delete(req, res, next) {
        try {
            await userService.deleteUser(req.params.id);
            res.status(204).json({ success: true });
        } catch (err) {
            next(err);
        }
    }
}

module.exports = new UserController();
