const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  role: { type: String, enum: ["user", "assistant"], required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const historySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    tool: {
      type: String,
      enum: ["chat", "notes", "summary", "flashcards", "diagram", "flowchart", "code", "formula", "quiz"],
      required: true,
    },
    title: { type: String, required: true, maxlength: 120 },
    messages: [messageSchema],
    svgData: { type: String, default: null },       // for diagram/flowchart
    flashcards: { type: Array, default: null },     // for flashcard sessions
    quizData: { type: Array, default: null },       // for quiz sessions
    quizScore: { type: Number, default: null },
    isStarred: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Full-text search index
historySchema.index({ title: "text" });

module.exports = mongoose.model("History", historySchema);
