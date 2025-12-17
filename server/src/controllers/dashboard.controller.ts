// main-backend/src/controllers/DashboardController.ts
import { Request, Response } from 'express';
import { QueueService } from '../services/QueueService';

export class DashboardController {
  constructor(private queueService: QueueService) {}

  async recharge(req: Request, res: Response) {
    try {
      const { dashboard, username, amount } = req.body;
      
      if (!dashboard || !username || !amount) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const jobId = await this.queueService.addJob(dashboard, 'recharge', {
        username,
        amount,
      });

      res.json({ jobId });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async createUser(req: Request, res: Response) {
    try {
      const { dashboard } = req.body;
      const username = 'shivam';
      const password = 'shivam';

      if (!dashboard || !username || !password) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const jobId = await this.queueService.addJob(dashboard, 'createUser', {
        username,
        password,
      });

      res.json({ jobId });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async withdraw(req: Request, res: Response) {
    try {
      const { dashboard, username, amount } = req.body;
      
      if (!dashboard || !username || !amount) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const jobId = await this.queueService.addJob(dashboard, 'withdraw', {
        username,
        amount,
      });

      res.json({ jobId });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getStatus(req: Request, res: Response) {
    try {
      const { jobId } = req.params;
      const status = await this.queueService.getJobStatus(jobId);
      res.json(status);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}