import { responseModel } from "../models/response.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getResponses = asyncHandler(async (req, res) => {
  const responses = await responseModel.find({ userId: req.user._id });
  res.status(200).json(new ApiResponse(200, responses, "Responses fetched successfully"));
});

export { getResponses };
