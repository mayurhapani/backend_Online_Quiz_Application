import { Grade } from "../models/grade.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createGrade = asyncHandler(async (req, res) => {
  const { student, course, assignment, grade } = req.body;

  if (!student || !course || !assignment || !grade) {
    throw new ApiError(400, "All fields are required");
  }

  const newGrade = await Grade.create({
    student,
    course,
    assignment,
    grade,
    submittedBy: req.user._id,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, newGrade, "Grade created successfully"));
});

const getGrades = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const options = {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
    sort: { createdAt: -1 },
    populate: [
      { path: "student", select: "name" },
      { path: "course", select: "title" },
      { path: "assignment", select: "title" },
      { path: "submittedBy", select: "name" },
    ],
  };

  let grades;
  grades = await Grade.paginate({}, options);

  if (req.user.role === "student") {
    grades = await Grade.paginate({ student: req.user._id }, options);
  }

  return res
    .status(200)
    .json(new ApiResponse(200, grades, "Grades fetched successfully"));
});

const updateGrade = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { grade } = req.body;

  if (!grade) {
    throw new ApiError(400, "Grade value is required");
  }

  const updatedGrade = await Grade.findByIdAndUpdate(
    id,
    { grade, submittedBy: req.user._id },
    { new: true, runValidators: true }
  );

  if (!updatedGrade) {
    throw new ApiError(404, "Grade not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, updatedGrade, "Grade updated successfully"));
});

const deleteGrade = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const deletedGrade = await Grade.findByIdAndDelete(id);

  if (!deletedGrade) {
    throw new ApiError(404, "Grade not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Grade deleted successfully"));
});

export { createGrade, getGrades, updateGrade, deleteGrade };
