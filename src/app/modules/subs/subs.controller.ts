import { Request, Response } from 'express';

import { stripe } from '../../../shared/stripe';
import config from '../../../config';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import { SubscriptationService } from './subs.service';

const createCheckoutSessionController = async (req: Request, res: Response) => {
  const { userId, planId } = req.body;

  try {
    const sessionUrl = await SubscriptationService.createCheckoutSessionService(
      userId,
      planId
    );
    res.status(200).json({ url: sessionUrl });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create checkout session' });
  }
};

const stripeWebhookController = async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'];

  try {
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig as string,
      config.webhook_secret as string
    );

    await SubscriptationService.handleStripeWebhookService(event);

    res.status(200).send({ received: true });
  } catch (err) {
    console.error('Error in Stripe webhook');
    res.status(400).send(`Webhook Error:`);
  }
};

const getAllSubscriptation = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.id;

  const result = await SubscriptationService.getSubscribtionService(userId);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Subscriptation retrived successfully',
    data: result,
  });
});

const cancelSubscriptation = catchAsync(async (req: Request, res: Response) => {
  const result = await SubscriptationService.cancelSubscriptation(
    req.params.userId
  );

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Subscriptation canceled successfully',
    data: result,
  });
});

const getAllSubs = catchAsync(async (req: Request, res: Response) => {
  const result = await SubscriptationService.getAllSubs(req.query);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Subscriptation retrived successfully',
    data: result,
  });
});

const updateSubs = catchAsync(async (req: Request, res: Response) => {
  const { userId, newPlanId } = req.body;

  const result = await SubscriptationService.updateSubscriptionPlanService(
    userId,
    newPlanId
  );
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Subscriptation updated successfully',
    data: result,
  });
});

export const SubscriptationController = {
  createCheckoutSessionController,
  stripeWebhookController,
  getAllSubscriptation,
  cancelSubscriptation,
  getAllSubs,
  updateSubs,
};
