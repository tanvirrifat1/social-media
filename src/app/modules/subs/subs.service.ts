import Stripe from 'stripe';
import { stripe } from '../../../shared/stripe';
import { Plan } from '../plan/plan.model';
import { User } from '../user/user.model';

import { Types } from 'mongoose';
import ApiError from '../../../errors/ApiError';
import { StatusCodes } from 'http-status-codes';
import { Subscribtion } from './subs.model';

const createCheckoutSessionService = async (userId: string, planId: string) => {
  const isUser = await User.findById(userId);

  try {
    const plan = await Plan.findById(planId);
    if (!plan) {
      throw new Error('Plan not found');
    }

    // Create a checkout session for a subscription
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: plan.priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url:
        'https://yourapp.com/success?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: 'https://yourapp.com/cancel',
      metadata: {
        userId,
        planId,
      },
      customer_email: isUser?.email,
    });

    // Return the checkout session URL
    return session.url;
  } catch (error) {
    throw new Error('Failed to create checkout session');
  }
};

const handleStripeWebhookService = async (event: Stripe.Event) => {
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;

      const { amount_total, metadata, payment_intent, status } = session;
      const userId = metadata?.userId as string;
      const planId = metadata?.planId as string;
      const products = JSON.parse(metadata?.products || '[]');
      const email = session.customer_email || '';

      const amountTotal = (amount_total ?? 0) / 100;

      const subscription = await stripe.subscriptions.retrieve(
        session.subscription as string
      );

      const startDate = new Date(subscription.start_date * 1000);
      const endDate = new Date(subscription.current_period_end * 1000);

      const paymentRecord = new Subscribtion({
        amount: amountTotal,
        user: new Types.ObjectId(userId),
        planId: new Types.ObjectId(planId),
        products,
        email,
        transactionId: payment_intent,
        startDate,
        endDate,
        status: 'Pending',
        subscriptionId: session.subscription,
        stripeCustomerId: session.customer as string,
      });

      await paymentRecord.save();
      break;
    }

    case 'invoice.payment_succeeded': {
      const invoice = event.data.object as Stripe.Invoice;
      const subscription = await Subscribtion.findOne({
        subscriptionId: invoice.subscription,
      });

      if (subscription) {
        subscription.status = 'active';
        await subscription.save();
      }
      break;
    }

    case 'checkout.session.async_payment_failed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const payment = await Subscribtion.findOne({
        stripeCustomerId: session.customer as string,
      });
      if (payment) {
        payment.status = 'Failed';
        await payment.save();
      }
      break;
    }

    default:
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid event type');
  }
};

const getSubscribtionService = async (userId: string) => {
  const subscription = await Subscribtion.findOne({ user: userId });
  if (!subscription) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Subscribtion not found');
  }
  return subscription;
};

export const SubscriptationService = {
  createCheckoutSessionService,
  handleStripeWebhookService,
  getSubscribtionService,
};
