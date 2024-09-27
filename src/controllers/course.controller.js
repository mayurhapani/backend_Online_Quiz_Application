import { courseModel } from "../models/course.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import redisClient from "../config/redis.js";
import { Assignment, Submission } from "../models/assignment.model.js";
import { Grade } from "../models/grade.model.js";

const createCourse = asyncHandler(async (req, res) => {
  const { title, description, teacher } = req.body;

  const course = await courseModel.create({
    title,
    description,
    teacher,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, course, "Course created successfully"));
});

const getCourses = asyncHandler(async (req, res) => {
  try {
    const { page = 1, limit = 10, sort = "asc" } = req.query;

    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      sort: { title: sort === "asc" ? 1 : -1 },
      populate: "teacher",
    };

    const aggregate = courseModel.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "teacher",
          foreignField: "_id",
          as: "teacher",
        },
      },
      { $unwind: "$teacher" },
      {
        $project: {
          title: 1,
          description: 1,
          "teacher.name": 1,
          "teacher._id": 1,
          studentsCount: { $size: "$students" },
          assignmentsCount: { $size: "$assignments" },
        },
      },
    ]);

    const courses = await courseModel.aggregatePaginate(aggregate, options);

    if (!courses || courses.docs.length === 0) {
      return res
        .status(200)
        .json(
          new ApiResponse(200, { docs: [], totalDocs: 0 }, "No courses found")
        );
    }

    return res
      .status(200)
      .json(new ApiResponse(200, courses, "Courses fetched successfully"));
  } catch (error) {
    console.error("Error in getCourses:", error);
    throw new ApiError(500, "Failed to fetch courses", error);
  }
});

const getCourseById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const course = await courseModel.findById(id).populate("teacher students");

  if (!course) {
    throw new ApiError(404, "Course not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, course, "Course fetched successfully"));
});

const updateCourse = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, description, teacher, students, assignments } = req.body;

  const course = await courseModel.findByIdAndUpdate(
    id,
    { title, description, teacher, students, assignments },
    { new: true }
  );

  if (!course) {
    throw new ApiError(404, "Course not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, course, "Course updated successfully"));
});

const deleteCourse = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const course = await courseModel.findByIdAndDelete(id);

  if (!course) {
    throw new ApiError(404, "Course not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, course, "Course deleted successfully"));
});

const getEnrolledCourses = asyncHandler(async (req, res) => {
  const studentId = req.user._id;
  const courses = await courseModel
    .find({ students: studentId })
    .populate("teacher");

  // Calculate progress for each course
  const coursesWithProgress = await Promise.all(
    courses.map(async (course) => {
      const totalAssignments = await Assignment.countDocuments({
        course: course._id,
      });
      const submittedAssignments = await Submission.countDocuments({
        assignment: {
          $in: await Assignment.find({ course: course._id }).distinct("_id"),
        },
        student: studentId,
      });

      // Calculate progress based on assignments
      let progress =
        totalAssignments > 0
          ? (submittedAssignments / totalAssignments) * 100
          : 0;

      // Optionally factor in grades
      const totalGrades = await Grade.countDocuments({
        course: course._id,
        student: studentId,
      });
      const maxGrade = course.maxGrade || 100;
      const gradeProgress =
        totalGrades > 0 ? (totalGrades / maxGrade) * 100 : 0;

      // Combine assignment progress and grade progress
      progress = (progress + gradeProgress) / 2;

      // Update the course progress
      course.progress = progress;
      await course.save();

      return { ...course.toObject(), progress };
    })
  );

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        coursesWithProgress,
        "Enrolled courses fetched successfully"
      )
    );
});

const enrollStudents = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const { studentIds } = req.body;

  if (!studentIds || !Array.isArray(studentIds)) {
    throw new ApiError(400, "Student IDs must be provided as an array");
  }

  const course = await courseModel.findById(courseId).populate("students");
  if (!course) {
    throw new ApiError(404, "Course not found");
  }

  // Check if the user is the teacher of the course or an admin
  if (
    req.user.role !== "admin" &&
    course.teacher.toString() !== req.user._id.toString()
  ) {
    throw new ApiError(
      403,
      "You are not authorized to enroll students in this course"
    );
  }

  // Find already enrolled students
  const alreadyEnrolledStudents = course.students.filter((student) =>
    studentIds.includes(student._id.toString())
  );

  if (alreadyEnrolledStudents.length > 0) {
    const alreadyEnrolledNames = alreadyEnrolledStudents
      .map((student) => student.name)
      .join(", ");
    throw new ApiError(
      400,
      `The following students are already enrolled: ${alreadyEnrolledNames}`
    );
  }

  // Add students to the course
  course.students = [
    ...new Set([
      ...course.students.map((student) => student._id.toString()),
      ...studentIds,
    ]),
  ];
  await course.save();

  return res
    .status(200)
    .json(new ApiResponse(200, course, "Students enrolled successfully"));
});

const getCoursesByTeacher = asyncHandler(async (req, res) => {
  const teacherId = req.user._id;

  const courses = await courseModel
    .find({ teacher: teacherId })
    .populate("teacher");

  if (!courses || courses.length === 0) {
    return res
      .status(200)
      .json(
        new ApiResponse(200, { docs: [], totalDocs: 0 }, "No courses found")
      );
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { docs: courses, totalDocs: courses.length },
        "Courses fetched successfully"
      )
    );
});

export {
  createCourse,
  getCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
  getEnrolledCourses,
  enrollStudents,
  getCoursesByTeacher, // Add this line
};
