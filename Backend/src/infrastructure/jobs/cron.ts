import cron from 'node-cron';
import prisma from '@infrastructure/db/prisma';

export const initCronJobs = () => {
  // We set a default of every 5 minutes for demo/hackathon purposes to show it's working
  const schedule = process.env.CRON_SCHEDULE || '*/5 * * * *';
  
  cron.schedule(schedule, async () => {
    console.log('[Cron] Running scheduled background jobs...');
    try {
      // Example implementation: Retrying failed savings or running daily sweep
      const pendingUsers = await prisma.userSettings.count();
      console.log(`[Cron] Sweeping records for ${pendingUsers} user settings...`);
      // Add actual bulk ledger savings or retry logic here
    } catch (error) {
      console.error('[Cron] Error running scheduled jobs:', error);
    }
  });

  console.log(`[Cron] Background jobs initialized with schedule: ${schedule}`);
};
