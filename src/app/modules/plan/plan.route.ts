import express from 'express';
import { PlanController } from './plan.controller';

const router = express.Router();

router.post('/create-plan', PlanController.createPlanToDB);

router.patch('/update/:planId', PlanController.updatePlan);

router.get('/get-all-plans', PlanController.getAllPlan);

router.delete('/delete/:planId', PlanController.deletePlan);

export const PlanRoutes = router;
