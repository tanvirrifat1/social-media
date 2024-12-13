import { Request, Response } from 'express';
import { SubscriptationService } from './subscribtion.service';
import { stripe } from '../../../shared/stripe';
import config from '../../../config';

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

export const SubscriptationController = {
  createCheckoutSessionController,
  stripeWebhookController,
};
