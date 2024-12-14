import { Types } from 'mongoose';

export type SubscriptionSchema = {
  plan: Types.ObjectId;
  user: Types.ObjectId;
  subscriptionId: string;
  stripeCustomerId: string;
  status: string;
  startDate: Date;
  endDate: Date;
  email: string;
  amount: number;
};
