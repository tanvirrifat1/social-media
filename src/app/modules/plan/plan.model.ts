import mongoose from 'mongoose';
import { IPlan } from './plan.interface';

const planSchema = new mongoose.Schema<IPlan>({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  unitAmount: {
    type: Number,
    required: true,
    default: 0,
  },
  interval: {
    type: String,
    enum: ['day', 'week', 'month', 'year', 'half-year'],
  },
  productId: {
    type: String,
  },
  priceId: {
    type: String,
  },
});

export const Plan = mongoose.model<IPlan>('Plan', planSchema);
