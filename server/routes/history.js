const express = require("express");
const History = require("../models/History");
const { protect } = require("../middleware/auth");

const router = express.Router();

// All routes require auth
router.use(protect);

// GET /api/history — get all sessions for current user
router.get("/", async (req, res) => {
  try {
    const { tool, search, limit = 50, page = 1 } = req.query;
    const filter = { userId: req.user._id };
    if (tool) filter.tool = tool;
    if (search) filter.$text = { $search: search };

    const sessions = await History.find(filter)
      .sort({ updatedAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .select("-messages -svgData -flashcards -quizData");

    const total = await History.countDocuments(filter);
    res.json({ sessions, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/history/:id — get full session
router.get("/:id", async (req, res) => {
  try {
    const session = await History.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });
    if (!session) return res.status(404).json({ message: "Session not found" });
    res.json({ session });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/history — create new session
router.post("/", async (req, res) => {
  try {
    const { tool, title, messages, svgData, flashcards, quizData, quizScore } = req.body;
    const session = await History.create({
      userId: req.user._id,
      tool,
      title: title || "Untitled session",
      messages: messages || [],
      svgData: svgData || null,
      flashcards: flashcards || null,
      quizData: quizData || null,
      quizScore: quizScore || null,
    });
    res.status(201).json({ session });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/history/:id — update session (append messages etc)
router.put("/:id", async (req, res) => {
  try {
    const session = await History.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { $set: req.body },
      { new: true }
    );
    if (!session) return res.status(404).json({ message: "Session not found" });
    res.json({ session });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/history/:id
router.delete("/:id", async (req, res) => {
  try {
    const session = await History.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });
    if (!session) return res.status(404).json({ message: "Session not found" });
    res.json({ message: "Session deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/history — clear all
router.delete("/", async (req, res) => {
  try {
    await History.deleteMany({ userId: req.user._id });
    res.json({ message: "History cleared" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/history/:id/star
router.patch("/:id/star", async (req, res) => {
  try {
    const session = await History.findOne({ _id: req.params.id, userId: req.user._id });
    if (!session) return res.status(404).json({ message: "Not found" });
    session.isStarred = !session.isStarred;
    await session.save();
    res.json({ isStarred: session.isStarred });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
