import { Assignment, Submission } from "../models/assignment.model.js";
import { courseModel } from "../models/course.model.js"; // Make sure to import the Course model
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createAssignment = asyncHandler(async (req, res) => {
  const { title, description, dueDate, course } = req.body;

  if (!title || !description || !dueDate || !course) {
    throw new ApiError(400, "All fields are required");
  }

  const assignment = await Assignment.create({
    title,
    description,
    dueDate,
    course,
    createdBy: req.user._id,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, assignment, "Assignment created successfully"));
});

const getAssignments = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const options = {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
    sort: { createdAt: -1 },
    populate: [
      { path: "course", select: "title" },
      { path: "createdBy", select: "name" },
    ],
  };

  const assignments = await Assignment.paginate({}, options);

  return res
    .status(200)
    .json(
      new ApiResponse(200, assignments, "Assignments fetched successfully")
    );
});

const updateAssignment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, description, dueDate } = req.body;

  const assignment = await Assignment.findById(id);

  if (!assignment) {
    throw new ApiError(404, "Assignment not found");
  }

  if (title) assignment.title = title;
  if (description) assignment.description = description;
  if (dueDate) assignment.dueDate = dueDate;

  await assignment.save();

  return res
    .status(200)
    .json(new ApiResponse(200, assignment, "Assignment updated successfully"));
});

const deleteAssignment = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const assignment = await Assignment.findByIdAndDelete(id);

  if (!assignment) {
    throw new ApiError(404, "Assignment not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Assignment deleted successfully"));
});

const getAssignmentsForCourse = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const assignments = await Assignment.find({ course: courseId });
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        assignments,
        "Assignments for course fetched successfully"
      )
    );
});

const submitAssignment = asyncHandler(async (req, res) => {
  const { assignmentId, submissionText } = req.body;
  const studentId = req.user._id;

  const assignment = await Assignment.findById(assignmentId);
  if (!assignment) {
    throw new ApiError(404, "Assignment not found");
  }

  const submission = await Submission.create({
    assignment: assignmentId,
    student: studentId,
    submissionText,
  });

  return res
    .status(201)
    .json(
      new ApiResponse(201, submission, "Assignment submitted successfully")
    );
});

const getSubmittedAssignments = asyncHandler(async (req, res) => {
  const studentId = req.user._id;
  const submissions = await Submission.find({ student: studentId }).populate({
    path: "assignment",
    populate: {
      path: "course",
    },
  });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        submissions,
        "Submitted assignments fetched successfully"
      )
    );
});

const getEnrolledAssignments = asyncHandler(async (req, res) => {
  const studentId = req.user._id;
  const enrolledCourses = await courseModel.find({ students: studentId });
  const courseIds = enrolledCourses.map((course) => course._id);

  const assignments = await Assignment.find({
    course: { $in: courseIds },
  }).populate("course");
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        assignments,
        "Enrolled assignments fetched successfully"
      )
    );
});

export {
  createAssignment,
  getAssignments,
  updateAssignment,
  deleteAssignment,
  getAssignmentsForCourse,
  submitAssignment,
  getSubmittedAssignments,
  getEnrolledAssignments,
};
