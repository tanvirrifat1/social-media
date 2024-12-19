import { model, Schema } from 'mongoose';
import { SubscriptionSchema } from './subs.interface';

const subscribtionSchema = new Schema<SubscriptionSchema>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  plan: {
    type: Schema.Types.ObjectId,
    ref: 'Plan',
  },
  subscriptionId: {
    type: String,
  },
  stripeCustomerId: {
    type: String,
  },
  status: {
    type: String,
  },
  startDate: {
    type: Date,
  },
  endDate: {
    type: Date,
  },
  email: {
    type: String,
  },
  amount: {
    type: Number,
  },
});

export const Subs = model('Subscribtion', subscribtionSchema);
