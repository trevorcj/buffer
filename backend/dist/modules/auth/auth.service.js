"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const auth_repository_1 = require("./auth.repository");
const password_1 = require("@shared/utils/password");
const jwt_1 = require("@shared/utils/jwt");
class AuthService {
    repository = new auth_repository_1.AuthRepository();
    async register(dto) {
        const existing = await this.repository.findUserByEmail(dto.email);
        if (existing) {
            throw new Error('User already exists');
        }
        const hashedPassword = await (0, password_1.hashPassword)(dto.password);
        const { user } = await this.repository.initializeUser({
            name: dto.name,
            email: dto.email,
            password: hashedPassword,
            bvn: dto.bvn, // Ideally encypted, simplified for hackathon or handled pre-db
            nin: dto.nin,
        });
        const token = (0, jwt_1.generateToken)({ id: user.id, email: user.email });
        return { user: { id: user.id, email: user.email }, token };
    }
    async login(dto) {
        const user = await this.repository.findUserByEmail(dto.email);
        if (!user) {
            throw new Error('Invalid credentials');
        }
        const isMatch = await (0, password_1.comparePassword)(dto.password, user.password);
        if (!isMatch) {
            throw new Error('Invalid credentials');
        }
        const token = (0, jwt_1.generateToken)({ id: user.id, email: user.email });
        return { user: { id: user.id, email: user.email }, token };
    }
}
exports.AuthService = AuthService;
