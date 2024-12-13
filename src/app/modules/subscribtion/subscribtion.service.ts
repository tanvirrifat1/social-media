import Stripe from 'stripe';
import { stripe } from '../../../shared/stripe';
import { Plan } from '../plan/plan.model';
import { User } from '../user/user.model';
import { Subscribtion } from './subscribtion.model';
import { Types } from 'mongoose';

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
      const userId = metadata?.userId as string; // Ensure you pass metadata when creating a checkout session
      const products = JSON.parse(metadata?.products || '[]');
      const email = session.customer_email || '';
      // const client_secret = payment_intent || '';

      const amountTotal = (amount_total ?? 0) / 100;

      console.log(session, 'session');

      const paymentRecord = new Subscribtion({
        amount: amountTotal, // Convert from cents to currency
        user: new Types.ObjectId(userId),
        products,
        email,
        transactionId: payment_intent,
        status: status,
      });

      await paymentRecord.save();
      break;
    }

    case 'checkout.session.async_payment_failed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const { payment_intent } = session;
      const payment = await Subscribtion.findOne({
        transactionId: payment_intent,
      });
      if (payment) {
        payment.status = 'Failed';
        await payment.save();
      }
      break;
    }

    default:
      console.log(`Unhandled event type ${event.type}`);
  }
};

export const SubscriptationService = {
  createCheckoutSessionService,
  handleStripeWebhookService,
};
