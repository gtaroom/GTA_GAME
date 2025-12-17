import cron from 'node-cron';
import UserBonusModel from '../models/bonus.model';
import TransactionModel from '../models/transaction.model';
import { logger } from '../utils/logger'; // Assuming you have a logger utility

/**
 * Service to handle transaction expiry
 * Runs every 5 minutes and efficiently processes expired transactions
 * - For withdrawal transactions: Refunds the money to the user's sweep coins
 * - For deposit transactions: Simply marks them as failed
 * 
 */
class TransactionExpiryService {
  // Default expiry time: 15 minutes
  private expiryTimeMinutes: number = 15;
  // Default batch size for processing
  private batchSize: number = 50;
  private scheduledTask: any;

  constructor(expiryTimeMinutes?: number, batchSize?: number) {
    if (expiryTimeMinutes) {
      this.expiryTimeMinutes = expiryTimeMinutes;
    }
    if (batchSize) {
      this.batchSize = batchSize;
    }
  }

  /**
   * Start the cron job to check for expired transactions
   */
  public startExpiryCheck(): void {
    // Run every 5 minutes instead of every minute
    this.scheduledTask = cron.schedule('*/5 * * * *', async () => {
      try {
        await this.handleExpiredTransactions();
      } catch (error) {
        logger.error('Error in transaction expiry cron job:', error);
      }
    });
    
    logger.info(`Transaction expiry service started. Runs every 5 minutes. Expiry time: ${this.expiryTimeMinutes} minutes`);
  }

  /**
   * Stop the cron job
   */
  public stopExpiryCheck(): void {
    if (this.scheduledTask) {
      this.scheduledTask.stop();
      logger.info('Transaction expiry service stopped');
    }
  }

  /**
   * Handle expired transactions
   * - Find pending transactions older than the expiry time
   * - Process them based on transaction type
   * - Uses batching for better performance
   */
  private async handleExpiredTransactions(): Promise<void> {
    const expiryTime = new Date();
    // Set the time 15 minutes ago
    expiryTime.setMinutes(expiryTime.getMinutes() - this.expiryTimeMinutes);
    
    // Get count first to avoid unnecessary processing
    const expiredCount = await TransactionModel.countDocuments({
      status: 'pending',
      createdAt: { $lt: expiryTime }
    });
    
    if (expiredCount === 0) {
      return;
    }
    
    logger.info(`Found ${expiredCount} expired transactions to process`);
    
    // Process transactions in batches for better performance
    let processedCount = 0;
    let hasMore = true;
    
    while (hasMore) {
      // Find a batch of expired transactions
      const expiredTransactions = await TransactionModel.find({
        status: 'pending',
        createdAt: { $lt: expiryTime }
      })
      .limit(this.batchSize)
      .lean(); // Use lean() for better performance when we don't need Mongoose documents
      
      if (expiredTransactions.length === 0) {
        hasMore = false;
        break;
      }
      
      // Collect all user IDs for withdrawal transactions to fetch user bonuses in bulk
      const withdrawalUserIds = expiredTransactions
        .filter(t => t.type === 'withdrawal')
        .map(t => t.userId);
      
      // Fetch all relevant user bonuses in a single query
      const userBonuses = withdrawalUserIds.length > 0 
        ? await UserBonusModel.find({ userId: { $in: withdrawalUserIds } }) 
        : [];
      
      // Create a map for quick lookup
      const userBonusMap = new Map();
      userBonuses.forEach(bonus => {
        userBonusMap.set(bonus.userId.toString(), bonus);
      });
      
      // Prepare bulk operations
      const bulkOps = [];
      const bonusUpdates = [];
      
      // Process each transaction
      for (const transaction of expiredTransactions) {
        try {
          // Prepare transaction update
          bulkOps.push({
            updateOne: {
              filter: { _id: transaction._id },
              update: { 
                $set: { 
                  status: 'failed',
                  'metadata.expiredAt': new Date(),
                  'metadata.expiryReason': 'Transaction expired after 15 minutes'
                }
              }
            }
          });
          
          // For withdrawal transactions, refund the money
          if (transaction.type === 'withdrawal') {
            const userBonus = userBonusMap.get(transaction.userId.toString());
            
            if (userBonus) {
              // Refund the sweepCoins
              userBonus.sweepCoins += transaction.amount;
              bonusUpdates.push(userBonus);
              
              logger.info(`Prepared refund of ${transaction.amount} sweepCoins to user ${transaction.userId}`);
            } else {
              logger.error(`User bonus not found for user ${transaction.userId}`);
            }
          }
          
          processedCount++;
        } catch (error) {
          logger.error(`Error preparing transaction ${transaction._id} for update:`, error);
        }
      }
      
      // Execute bulk operations if any
      if (bulkOps.length > 0) {
        try {
          await TransactionModel.bulkWrite(bulkOps);
          logger.info(`Bulk updated ${bulkOps.length} transactions`);
        } catch (error) {
          logger.error('Error executing bulk update:', error);
        }
      }
      
      // Save all user bonus updates
      for (const bonus of bonusUpdates) {
        try {
          await bonus.save();
        } catch (error) {
          logger.error(`Error saving user bonus for user ${bonus.userId}:`, error);
        }
      }
      
      // Check if we've processed all transactions
      if (expiredTransactions.length < this.batchSize) {
        hasMore = false;
      }
    }
    
    logger.info(`Completed processing ${processedCount} expired transactions`);
  }
}

// Export singleton instance
const transactionExpiryService = new TransactionExpiryService();
export default transactionExpiryService; 