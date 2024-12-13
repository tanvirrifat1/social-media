import express from 'express';
import { PlanController } from './plan.controller';

const router = express.Router();

router.post('/create-plan', PlanController.createPlanToDB);

export const PlanRoutes = router;
