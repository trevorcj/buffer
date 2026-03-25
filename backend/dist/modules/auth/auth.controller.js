"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const auth_service_1 = require("./auth.service");
class AuthController {
    service = new auth_service_1.AuthService();
    register = async (req, res) => {
        try {
            const result = await this.service.register(req.body);
            res.status(201).json(result);
        }
        catch (error) {
            if (error.message === 'User already exists') {
                res.status(409).json({ error: error.message });
            }
            else {
                throw error;
            }
        }
    };
    login = async (req, res) => {
        try {
            const result = await this.service.login(req.body);
            res.status(200).json(result);
        }
        catch (error) {
            if (error.message === 'Invalid credentials') {
                res.status(401).json({ error: error.message });
            }
            else {
                throw error;
            }
        }
    };
}
exports.AuthController = AuthController;
