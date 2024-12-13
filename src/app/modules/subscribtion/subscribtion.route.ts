import { Router } from 'express';
import { SubscriptationController } from './subscribtion.controller';

const router = Router();

router.post(
  '/check-out',
  SubscriptationController.createCheckoutSessionController
);

export const SubscriptionRoutes = router;
