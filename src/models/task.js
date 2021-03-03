const moogose = require("mongoose");
const validator = require("validator");

const taskSchema = new moogose.Schema(
  {
    description: {
      type: String,
      required: true,
      trim: true,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    owner: {
      type: moogose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

const Task = moogose.model("Task", taskSchema);

module.exports = Task;
