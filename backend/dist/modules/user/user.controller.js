"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const user_service_1 = require("./user.service");
class UserController {
    service = new user_service_1.UserService();
    getProfile = async (req, res) => {
        try {
            if (!req.user)
                throw new Error('Unauthorized');
            const profile = await this.service.getProfile(req.user.id);
            res.status(200).json(profile);
        }
        catch (error) {
            res.status(404).json({ error: error.message });
        }
    };
    verifyIdentity = async (req, res) => {
        try {
            if (!req.user)
                throw new Error('Unauthorized');
            const result = await this.service.verifyIdentity(req.user.id, req.body);
            res.status(200).json({ message: 'Identity verified', ...result });
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    };
    getSettings = async (req, res) => {
        try {
            if (!req.user)
                throw new Error('Unauthorized');
            const settings = await this.service.getSettings(req.user.id);
            res.status(200).json(settings);
        }
        catch (error) {
            res.status(404).json({ error: error.message });
        }
    };
    updateSettings = async (req, res) => {
        try {
            if (!req.user)
                throw new Error('Unauthorized');
            const updated = await this.service.updateSettings(req.user.id, req.body);
            res.status(200).json(updated);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    };
}
exports.UserController = UserController;
