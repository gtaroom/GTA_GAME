// main-backend/src/services/QueueService.ts
import { Queue } from 'bullmq';
import IORedis from 'ioredis';

export class QueueService {
  private queues: Map<string, Queue> = new Map();
  private redis: IORedis;

  constructor() {
    this.redis = new IORedis({
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
    });
  }

  async addJob(dashboard: string, action: string, data: any): Promise<string> {
    const queue = await this.getQueue(dashboard);
    
    const jobId = `${dashboard}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const jobOptions = {
      jobId,
      attempts: action === 'recharge' ? 1 : 3,
      backoff: {
        type: 'fixed',
        delay: 0
      },
      // Keep jobs for 1 hour after completion/failure
      removeOnComplete: {
        age: 3600 // 1 hour in seconds
      },
      removeOnFail: {
        age: 3600 // 1 hour in seconds
      }
    };
    
    const job = await queue.add(action, data, jobOptions);

    if (!job.id) {
      throw new Error('Failed to create job: No job ID returned');
    }

    return job.id;
  }

  async getJobStatus(jobId: string): Promise<any> {
    const dashboard = jobId.split('-')[0];
    const queue = await this.getQueue(dashboard);
    const job = await queue.getJob(jobId);
    
    if (!job) {
      throw new Error('Job not found');
    }

    const state = await job.getState();
    
    // If job failed due to user not found, remove it after getting status
    if (state === 'failed' && job.failedReason?.includes('not found in search results')) {
      await job.remove();
    }

    return {
      jobId,
      status: state,
      progress: job.progress,
      error: job.failedReason,
      dashboard,
    };
  }

  private async getQueue(dashboard: string): Promise<Queue> {
    if (!this.queues.has(dashboard)) {
      const queue = new Queue(dashboard, {
        connection: this.redis,
        prefix: 'puppeteer',
      });
      this.queues.set(dashboard, queue);
    }
    return this.queues.get(dashboard)!;
  }
}