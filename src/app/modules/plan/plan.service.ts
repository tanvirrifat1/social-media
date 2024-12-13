import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { IPlan } from './plan.interface';
import { stripe } from '../../../shared/stripe';
import { Plan } from './plan.model';

const createPlan = async (payload: Partial<IPlan>) => {
  try {
    if (
      !payload.name ||
      !payload.description ||
      !payload.unitAmount ||
      !payload.interval
    ) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid plan data');
    }

    const isPlanExist = await Plan.findOne({ name: payload.name });

    if (isPlanExist) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Plan already exist');
    }

    // Create Stripe product
    const product = await stripe.products.create({
      name: payload.name,
      description: payload.description,
    });

    // Handle recurring intervals, including custom 'half-year'
    let recurring: {
      interval: 'day' | 'week' | 'month' | 'year';
      interval_count?: number; // Optional for custom intervals
    } = {
      interval: payload.interval === 'half-year' ? 'month' : payload.interval,
    };

    if (payload.interval === 'half-year') {
      recurring.interval_count = 6; // Custom interval count for half-year
    }

    // Create Stripe price
    const price = await stripe.prices.create({
      unit_amount: payload.unitAmount * 100,
      currency: 'usd',
      recurring, // Pass the constructed recurring object
      product: product.id,
    });

    // Save plan in MongoDB
    if (price) {
      const plan = await Plan.create({
        name: payload.name,
        description: payload.description,
        unitAmount: payload.unitAmount,
        interval: payload.interval,
        productId: product.id,
        priceId: price.id,
      });
      return plan;
    }
  } catch (error) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create plan');
  }
};

export const PlanService = {
  createPlan,
};
