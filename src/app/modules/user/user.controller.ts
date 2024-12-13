import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { UserService } from './user.service';
import getFilePath from '../../../shared/getFilePath';

const createBrandToDB = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { ...brandData } = req.body;
    await UserService.createBrandToDB(brandData);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message:
        'Please check your email to verify your account. We have sent you an OTP to complete the registration process.',
    });
  }
);

const createInfluencer = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { ...influencerData } = req.body;
    await UserService.creatInfluencerToDB(influencerData);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message:
        'Please check your email to verify your account. We have sent you an OTP to complete the registration process.',
    });
  }
);

const getUserProfile = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;

  const result = await UserService.getUserProfileFromDB(user);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Profile data retrieved successfully',
    data: result,
  });
});

//update profile
const updateProfile = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    let image;
    if (req.files && 'image' in req.files && req.files.image[0]) {
      image = `/images/${req.files.image[0].filename}`;
    }

    const data = {
      image,
      ...req.body,
    };
    const result = await UserService.updateProfileToDB(user, data);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Profile updated successfully',
      data: result,
    });
  }
);

const getAllBrands = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.getAllBrand(req.query);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'All Brand retrieved successfully',
    data: result,
  });
});

const getAllInfluencer = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.getAllInfluencer(req.query);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'All Influencer retrieved successfully',
    data: result,
  });
});

const updateProfileToDB = catchAsync(async (req: Request, res: Response) => {
  let image;
  if (req.files && 'image' in req.files && req.files.image[0]) {
    image = `/images/${req.files.image[0].filename}`;
  }

  const value = {
    image,
    ...req.body,
  };

  const result = await UserService.updateProfile(req.params.id, value);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Profile updated successfully',
    data: result,
  });
});

const getSingleInflueencer = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.getSingleInflueencer(req.params.id);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'get single Influeencer successfully',
    data: result,
  });
});
const getAllInfluencerForBrand = catchAsync(
  async (req: Request, res: Response) => {
    const result = await UserService.getAllInfluencerForBrand(req.query);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'get single Influeencer successfully',
      data: result,
    });
  }
);

export const UserController = {
  getUserProfile,
  updateProfile,
  createBrandToDB,
  createInfluencer,
  getAllBrands,
  getAllInfluencer,
  updateProfileToDB,
  getSingleInflueencer,
  getAllInfluencerForBrand,
};
