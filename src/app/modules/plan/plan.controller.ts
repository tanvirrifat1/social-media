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

const getAllPlan = catchAsync(async (req, res) => {
  const result = await PlanService.getAllPlans();
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Plan retrived successfully',
    data: result,
  });
});

const updatePlan = catchAsync(async (req, res) => {
  const result = await PlanService.updatePlan(req.params.planId, req.body);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Plan updated successfully',
    data: result,
  });
});

const deletePlan = catchAsync(async (req, res) => {
  const result = await PlanService.deletePlan(req.params.planId);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Plan deleted successfully',
    data: result,
  });
});

export const PlanController = {
  createPlanToDB,
  getAllPlan,
  updatePlan,
  deletePlan,
};
