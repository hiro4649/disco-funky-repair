import cron from 'node-cron';
import { SnapshotService } from './snapshot.service';

export class CronService {
  private static isRunning = false;

  /**
   * Start the daily snapshot cron job
   * Runs every day at UTC 00:00
   */
  static startDailySnapshot(): void {
    // Run every day at 00:00 UTC
    cron.schedule('0 0 * * *', async () => {
      if (this.isRunning) {
        console.log('Daily snapshot already running, skipping...');
        return;
      }

      this.isRunning = true;
      console.log('Starting scheduled daily snapshot...');

      try {
        const result = await SnapshotService.runDailyProcess();
        console.log('Scheduled daily snapshot completed:', result);
      } catch (error) {
        console.error('Error in scheduled daily snapshot:', error);
      } finally {
        this.isRunning = false;
      }
    }, {
      scheduled: true,
      timezone: 'UTC'
    });

    console.log('Daily snapshot cron job started (runs at 00:00 UTC)');
  }

  /**
   * Start all cron jobs
   */
  static startAllCronJobs(): void {
    this.startDailySnapshot();
    console.log('All cron jobs started');
  }

  /**
   * Stop all cron jobs
   */
  static stopAllCronJobs(): void {
    cron.getTasks().forEach(task => {
      task.stop();
    });
    console.log('All cron jobs stopped');
  }
}