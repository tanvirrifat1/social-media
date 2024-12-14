import Stripe from 'stripe';
import { stripe } from '../../../shared/stripe';
import { Plan } from '../plan/plan.model';
import { User } from '../user/user.model';
import { Types } from 'mongoose';
import ApiError from '../../../errors/ApiError';
import { StatusCodes } from 'http-status-codes';
import { Subscribtion } from './subs.model';
import { WebhookService } from '../../../shared/webhook';

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
    case 'checkout.session.completed':
      WebhookService.handleCheckoutSessionCompleted(event.data.object);
      break;

    case 'invoice.payment_succeeded':
      WebhookService.handleInvoicePaymentSucceeded(event.data.object);
      break;

    case 'invoice.payment_failed':
      WebhookService.handleInvoicePaymentFailed(event.data.object);
      break;

    case 'checkout.session.async_payment_failed':
      WebhookService.handleAsyncPaymentFailed(event.data.object);
      break;

    case 'customer.subscription.deleted':
      WebhookService.handleSubscriptionDeleted(event.data.object);
      break;

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

const cancelSubscriptation = async (userId: string) => {
  const isUser = await User.findById(userId);

  if (!isUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'User not found');
  }

  const subscription = await Subscribtion.findOne({ user: userId });
  if (!subscription) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Subscribtion not found');
  }

  await stripe.subscriptions.update(subscription.subscriptionId, {
    cancel_at_period_end: true,
  });

  const updatedSub = await Subscribtion.findOneAndUpdate(
    { user: userId },
    { status: 'cancel' },
    { new: true }
  );
  return updatedSub;
};

const getAllSubs = async (query: Record<string, unknown>) => {
  const { page, limit } = query;
  const anyConditions: any[] = [{ status: 'active' }];

  const whereConditions =
    anyConditions.length > 0 ? { $and: anyConditions } : {};

  // Pagination setup
  const pages = parseInt(page as string) || 1;
  const size = parseInt(limit as string) || 10;
  const skip = (pages - 1) * size;

  // Fetch campaigns
  const result = await Subscribtion.find(whereConditions)
    .populate('user', 'fullName')
    .populate('plan', 'name unitAmount interval')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(size)
    .lean();

  const count = await Subscribtion.countDocuments(whereConditions);

  return {
    result,
    meta: {
      page: pages,
      total: count,
    },
  };
};

const updateSubscriptionPlanService = async (
  userId: string,
  newPlanId: string
) => {
  // Step 1: Fetch the user
  const isUser = await User.findById(userId);
  if (!isUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'User not found');
  }

  // Step 2: Fetch the user's subscription
  const subscription = await Subscribtion.findOne({ user: userId });
  if (!subscription) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Subscription not found');
  }

  // Fetch the new plan details
  const newPlan = await Plan.findById(newPlanId);
  if (!newPlan) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'New plan not found');
  }

  // Fetch the current subscription from Stripe
  const stripeSubscription = await stripe.subscriptions.retrieve(
    subscription.subscriptionId
  );

  if (!stripeSubscription) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Stripe subscription not found'
    );
  }

  // Step 3: Update the subscription in Stripe
  const updatedSubscription = await stripe.subscriptions.update(
    subscription.subscriptionId,
    {
      items: [
        {
          id: stripeSubscription.items.data[0].id,
          price: newPlan.priceId,
        },
      ],
      proration_behavior: 'create_prorations',
    }
  );

  // After the update, retrieve the upcoming invoice
  const invoicePreview = await stripe.invoices.retrieveUpcoming({
    customer: stripeSubscription.customer as string,
    subscription: subscription.subscriptionId,
  });

  const prorationAmount = (invoicePreview.total || 0) / 100;

  // Step 4: Update the subscription in the database
  const updatedSub = await Subscribtion.findOneAndUpdate(
    { user: userId },
    {
      plan: newPlanId,
      amount: prorationAmount,
    },
    { new: true }
  );

  return updatedSub;
};

export const SubscriptationService = {
  createCheckoutSessionService,
  handleStripeWebhookService,
  getSubscribtionService,
  cancelSubscriptation,
  getAllSubs,
  updateSubscriptionPlanService,
};
