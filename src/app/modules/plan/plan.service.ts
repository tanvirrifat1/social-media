import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { IPlan } from './plan.interface';
import { stripe } from '../../../shared/stripe';
import { Plan } from './plan.model';
import { mapInterval } from './plan.constant';

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

const getAllPlans = async () => {
  const plans = await Plan.find({});

  if (!plans) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to get plans');
  }

  return plans;
};

const updatePlan = async (
  planId: string,
  updates: Partial<IPlan>
): Promise<IPlan> => {
  try {
    // Step 1: Retrieve the existing plan from the database
    const plan = await Plan.findById(planId);
    if (!plan) {
      throw new Error('Plan not found');
    }

    // Step 2: Update the product in Stripe (if relevant fields are updated)
    if (updates.name || updates.description) {
      await stripe.products.update(plan.productId, {
        name: updates.name || plan.name,
        description: updates.description || plan.description,
      });
    }

    // Step 3: Handle price updates (Stripe does not allow updating unit_amount or interval directly)
    if (updates.unitAmount || updates.interval) {
      const stripeInterval = mapInterval(updates.interval || plan.interval); // Map the interval

      // Create a new price if the amount or interval is updated
      const newPrice = await stripe.prices.create({
        unit_amount: updates.unitAmount
          ? updates.unitAmount * 100
          : plan.unitAmount * 100,
        currency: 'usd',
        recurring: { interval: stripeInterval },
        product: plan.productId,
      });

      updates.priceId = newPrice.id;
    }

    // Step 4: Update the database
    const updatedPlan = await Plan.findByIdAndUpdate(planId, updates, {
      new: true,
      runValidators: true,
    });

    if (!updatedPlan) {
      throw new Error('Failed to update plan');
    }

    return updatedPlan.toObject();
  } catch (error) {
    console.error('Error updating plan:', error);
    throw new Error('Failed to update plan');
  }
};

const deletePlan = async (planId: string) => {
  try {
    // Step 1: Find the plan in the database
    const plan = await Plan.findById(planId);

    if (!plan) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Plan not found');
    }

    // Step 2: Update the Stripe Price to make it inactive
    const stripePriceId = plan.priceId; // Ensure `priceId` exists in your Plan schema
    const updatedPrice = await stripe.prices.update(stripePriceId, {
      active: false, // Mark the price as inactive
    });

    console.log('Price deactivated in Stripe:', updatedPrice);

    // Step 3: Delete the plan from the database
    await Plan.findByIdAndDelete(planId);

    return { message: 'Plan deleted successfully' };
  } catch (error) {
    console.error('Error deleting plan:', error);

    if (error instanceof ApiError) {
      throw error; // Rethrow known API errors
    }

    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      'Failed to delete plan'
    );
  }
};

export const PlanService = {
  createPlan,
  getAllPlans,
  updatePlan,
  deletePlan,
};
