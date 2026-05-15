const router    = require("express").Router();
const { protect: auth } = require("../middleware/auth");
const History   = require("../models/History");
const Bookmark  = require("../models/Bookmark");
const StudyPlan = require("../models/StudyPlan");

router.get("/", auth, async (req, res) => {
  try {
    const uid = req.user._id;
    const [sessions, totalBookmarks, plans] = await Promise.all([
      History.find({ user: uid }),
      Bookmark.countDocuments({ user: uid }),
      StudyPlan.find({ user: uid }),
    ]);

    const totalSessions   = sessions.length;
    const starredSessions = sessions.filter(s => s.starred).length;
    const totalPlans      = plans.length;

    const toolMap = {};
    sessions.forEach(s => { toolMap[s.tool] = (toolMap[s.tool] || 0) + 1; });
    const toolBreakdown = Object.entries(toolMap).map(([_id, count]) => ({ _id, count })).sort((a, b) => b.count - a.count);
    const topTool = toolBreakdown[0]?._id || null;

    const quizSessions = sessions.filter(s => s.tool === "quiz" && s.quizScore != null);
    const quizTotal    = quizSessions.length;
    const quizAvgScore = quizTotal ? Math.round(quizSessions.reduce((a, s) => a + s.quizScore, 0) / quizTotal) : 0;

    const since = new Date(Date.now() - 30 * 86400000);
    const dayMap = {};
    sessions.filter(s => new Date(s.createdAt) >= since).forEach(s => {
      const key = new Date(s.createdAt).toISOString().slice(0, 10);
      dayMap[key] = (dayMap[key] || 0) + 1;
    });
    const dailyActivity = Object.entries(dayMap).map(([_id, count]) => ({ _id, count }));

    const allTasks  = plans.flatMap(p => p.tasks || []);
    const taskStats = { total: allTasks.length, done: allTasks.filter(t => t.done).length };

    res.json({ totalSessions, starredSessions, totalBookmarks, totalPlans, toolBreakdown, topTool, quizTotal, quizAvgScore, dailyActivity, taskStats });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;
