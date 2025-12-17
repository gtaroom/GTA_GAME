// main-backend/src/routes/dashboard.ts
import express from 'express';
import { DashboardController } from '../controllers/dashboard.controller';
import { QueueService } from '../services/QueueService';

const router = express.Router();
const queueService = new QueueService();
const controller = new DashboardController(queueService);

router.post('/recharge', controller.recharge.bind(controller));
router.post('/withdraw', controller.withdraw.bind(controller));
router.post('/create-user', controller.createUser.bind(controller));
router.get('/status/:jobId', controller.getStatus.bind(controller));

export default router;