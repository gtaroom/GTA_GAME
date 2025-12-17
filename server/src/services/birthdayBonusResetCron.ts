import cron from 'node-cron';
import vipService from './vip.service';
import { logger } from '../utils/logger';

/**
 * Birthday Bonus Reset Cron Job
 * Runs every January 1st at 00:01 AM to reset all birthday bonus claims
 */
class BirthdayBonusResetCron {
  private cronJob: cron.ScheduledTask | null = null;

  /**
   * Start the birthday bonus reset cron job
   */
  start() {
    // Run every January 1st at 00:01 AM
    this.cronJob = cron.schedule('1 0 1 1 *', async () => {
      try {
        logger.info('Starting annual birthday bonus reset...');
        const result = await vipService.resetAllBirthdayBonusClaims();
        logger.info(`Annual birthday bonus reset completed. Reset ${result.resetCount} users.`);
      } catch (error) {
        logger.error('Error during annual birthday bonus reset:', error);
      }
    }, {
      scheduled: false,
      timezone: 'UTC'
    });

    this.cronJob.start();
    logger.info('Birthday bonus reset cron job started - will run annually on January 1st at 00:01 AM UTC');
  }

  /**
   * Stop the birthday bonus reset cron job
   */
  stop() {
    if (this.cronJob) {
      this.cronJob.stop();
      this.cronJob = null;
      logger.info('Birthday bonus reset cron job stopped');
    }
  }

  /**
   * Manually trigger birthday bonus reset (for testing or emergency)
   */
  async manualReset(): Promise<{ resetCount: number }> {
    try {
      logger.info('Manual birthday bonus reset triggered...');
      const result = await vipService.resetAllBirthdayBonusClaims();
      logger.info(`Manual birthday bonus reset completed. Reset ${result.resetCount} users.`);
      return result;
    } catch (error) {
      logger.error('Error during manual birthday bonus reset:', error);
      throw error;
    }
  }
}

export default new BirthdayBonusResetCron();
