const router   = require("express").Router();
const { protect: auth } = require("../middleware/auth");
const Bookmark = require("../models/Bookmark");

router.get("/", auth, async (req, res) => {
  try {
    const bookmarks = await Bookmark.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ bookmarks });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.post("/", auth, async (req, res) => {
  try {
    const bm = await Bookmark.create({ ...req.body, user: req.user._id });
    res.json({ bookmark: bm });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.delete("/:id", auth, async (req, res) => {
  try {
    await Bookmark.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    res.json({ success: true });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.delete("/", auth, async (req, res) => {
  try {
    await Bookmark.deleteMany({ user: req.user._id });
    res.json({ success: true });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;
