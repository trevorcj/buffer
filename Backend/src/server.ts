import app from './app';
import dotenv from 'dotenv';
import prisma from '@infrastructure/db/prisma';
import { initCronJobs } from '@infrastructure/jobs/cron';

dotenv.config();

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    // Attempt DB connection to ensure DB is up
    await prisma.$connect();
    console.log('✅ Connected to database');

    initCronJobs();

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
