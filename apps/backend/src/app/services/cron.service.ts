import cron from 'node-cron';
import { SnapshotService } from './snapshot.service';
import { safeLogError } from '../utils/safeLogger';

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
        return;
      }

      this.isRunning = true;

      try {
        const result = await SnapshotService.runDailyProcess();
        void result;
      } catch (error) {
        safeLogError('cron_daily_snapshot', error);
      } finally {
        this.isRunning = false;
      }
    }, {
      scheduled: true,
      timezone: 'UTC'
    });

  }

  /**
   * Start all cron jobs
   */
  static startAllCronJobs(): void {
    this.startDailySnapshot();
  }

  /**
   * Stop all cron jobs
   */
  static stopAllCronJobs(): void {
    cron.getTasks().forEach(task => {
      task.stop();
    });
  }
}
