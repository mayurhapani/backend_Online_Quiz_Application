import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const gradeSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    assignment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Assignment",
      required: true,
    },
    grade: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

gradeSchema.plugin(mongoosePaginate);

export const Grade = mongoose.model("Grade", gradeSchema);
