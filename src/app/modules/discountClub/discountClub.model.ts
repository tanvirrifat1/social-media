import { model, Schema } from 'mongoose';

import { IDiscountClub } from './discountClub.interface';

const discountClubSchema = new Schema<IDiscountClub>(
  {
    image: {
      type: String,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    buyGuide: {
      type: String,
      required: true,
    },

    startTime: {
      type: String,
      required: true,
    },
    endTime: {
      type: String,
      required: true,
    },
    price: {
      type: String,
      required: true,
    },
    discount: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'delete'],
      default: 'active',
    },
  },
  {
    timestamps: true,
  }
);

// discountClubSchema.pre('save', async function (next) {
//   //check user

//   const existingCampaign = await DiscountClub.findOne({ name: this.name });
//   if (existingCampaign) {
//     throw new ApiError(StatusCodes.CONFLICT, 'Discount Club already exists');
//   }

//   next();
// });

export const DiscountClub = model<IDiscountClub>(
  'discountClub',
  discountClubSchema
);
