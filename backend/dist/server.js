"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const app_1 = __importDefault(require("./app"));
const prisma_1 = __importDefault(require("./infrastructure/db/prisma"));
const PORT = process.env.PORT || 3000;
console.log('Starting with DB:', process.env.DATABASE_URL);
const startServer = async () => {
    try {
        // Attempt DB connection to ensure DB is up
        await prisma_1.default.$connect();
        console.log('✅ Connected to database');
        app_1.default.listen(PORT, () => {
            console.log(`🚀 Buffer API Server is running on port ${PORT}`);
            console.log(`📄 Swagger documentation available at http://localhost:${PORT}/api-docs`);
        });
    }
    catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};
startServer();
