const mongoose = require("mongoose");

const TaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  done: { type: Boolean, default: false },
  priority: { type: String, enum: ["low", "medium", "high"], default: "medium" },
});

const ReminderSchema = new mongoose.Schema({
  email: { type: String },
  daysBefore: { type: Number, default: 1 },
  sent: { type: Boolean, default: false },
}, { _id: false });

const StudyPlanSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  subject: { type: String, required: true },
  description: { type: String, default: "" },
  color: { type: String, default: "#6366f1" },
  targetDate: { type: Date, default: null },
  tasks: [TaskSchema],
  reminder: { type: ReminderSchema, default: null },
}, { timestamps: true });

module.exports = mongoose.model("StudyPlan", StudyPlanSchema);