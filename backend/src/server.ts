import 'dotenv/config';
import app from './app';
import prisma from '@infrastructure/db/prisma';

const PORT = process.env.PORT || 3000;
console.log('Starting with DB:', process.env.DATABASE_URL);

const startServer = async () => {
  try {
    // Attempt DB connection to ensure DB is up
    await prisma.$connect();
    console.log('✅ Connected to database');

    app.listen(PORT, () => {
      console.log(`🚀 Buffer API Server is running on port ${PORT}`);
      console.log(`📄 Swagger documentation available at http://localhost:${PORT}/api-docs`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
