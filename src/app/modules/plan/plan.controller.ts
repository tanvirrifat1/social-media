import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { PlanService } from './plan.service';

const createPlanToDB = catchAsync(async (req, res) => {
  const result = await PlanService.createPlan(req.body);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Plan created successfully',
    data: result,
  });
});

export const PlanController = {
  createPlanToDB,
};
