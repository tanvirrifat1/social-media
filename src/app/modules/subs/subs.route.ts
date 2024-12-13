import { Router } from 'express';

import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';
import { SubscriptationController } from './subs.controller';

const router = Router();

router.post(
  '/check-out',
  SubscriptationController.createCheckoutSessionController
);

router.get(
  '/get-all',
  auth(USER_ROLES.INFLUENCER, USER_ROLES.BRAND),
  SubscriptationController.getAllSubscriptation
);

export const SubscriptionRoute = router;
