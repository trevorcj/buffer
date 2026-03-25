"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("express-async-errors");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const swagger_1 = require("@shared/utils/swagger");
const app = (0, express_1.default)();
// Middlewares
app.use(express_1.default.json());
app.use((0, cors_1.default)());
app.use((0, helmet_1.default)());
app.use((0, morgan_1.default)('dev'));
// Swagger Documentation
app.use('/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_1.swaggerSpec));
// Health Check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'UP', timestamp: new Date() });
});
const auth_routes_1 = __importDefault(require("@modules/auth/auth.routes"));
const user_routes_1 = __importDefault(require("@modules/user/user.routes"));
const wallet_routes_1 = __importDefault(require("@modules/wallet/wallet.routes"));
const transaction_routes_1 = __importDefault(require("@modules/transaction/transaction.routes"));
const cushion_routes_1 = __importDefault(require("@modules/cushion/cushion.routes"));
const card_routes_1 = __importDefault(require("@modules/card/card.routes"));
app.use('/auth', auth_routes_1.default);
app.use('/user', user_routes_1.default);
app.use('/wallet', wallet_routes_1.default);
app.use('/transactions', transaction_routes_1.default);
app.use('/cushion', cushion_routes_1.default);
app.use('/card', card_routes_1.default);
// Global Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: err.message || 'Internal Server Error' });
});
exports.default = app;
