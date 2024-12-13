import { model, Schema } from 'mongoose';
import { SubscriptionSchema } from './subscribtion.interface';

const subscribtionSchema = new Schema<SubscriptionSchema>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  plan: {
    type: Schema.Types.ObjectId,
    ref: 'Plan',
  },
  stripeSubscriptionId: {
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
});

export const Subscribtion = model('Subscribtion', subscribtionSchema);
