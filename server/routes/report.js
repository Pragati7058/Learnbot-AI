const router = require("express").Router();
const { protect: auth } = require("../middleware/auth");
const { sendWeeklyReports } = require("../services/weeklyReport");

router.post("/trigger", auth, async (req, res) => {
  try {
    await sendWeeklyReports();
    res.json({ success: true, message: "Weekly reports sent" });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

module.exports = router;