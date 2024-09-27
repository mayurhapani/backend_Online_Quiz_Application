import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const assignmentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const submissionSchema = new mongoose.Schema(
  {
    assignment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Assignment",
      required: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    submissionText: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

assignmentSchema.plugin(mongoosePaginate);
submissionSchema.plugin(mongoosePaginate);

export const Assignment = mongoose.model("Assignment", assignmentSchema);
export const Submission = mongoose.model("Submission", submissionSchema);
