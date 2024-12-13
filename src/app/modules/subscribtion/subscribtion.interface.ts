import { Types } from 'mongoose';

export type SubscriptionSchema = {
  plan: Types.ObjectId;
  user: Types.ObjectId;
  stripeSubscriptionId: string;
  stripeCustomerId: string;
  status: string;
  startDate: Date;
  endDate: Date;
};
