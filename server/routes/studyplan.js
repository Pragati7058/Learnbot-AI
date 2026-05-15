const router = require("express").Router();
const { protect: auth } = require("../middleware/auth");
const StudyPlan = require("../models/StudyPlan");
const { sendStudyReminder, sendReminderConfirmation } = require("../services/email");

router.get("/", auth, async (req, res) => {
  try {
    const plans = await StudyPlan.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ plans });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.post("/", auth, async (req, res) => {
  try {
    const { reminder, ...rest } = req.body;

    const plan = await StudyPlan.create({
      ...rest,
      user: req.user._id,
      reminder: reminder?.email
        ? { email: reminder.email, daysBefore: reminder.daysBefore ?? 1 }
        : null,
    });

    console.log("saved reminder:", JSON.stringify(plan.reminder));

    if (plan.reminder?.email && plan.targetDate) {
      sendReminderConfirmation(plan)
        .then(ok => console.log("Mail sent:", ok))
        .catch(e => console.error("Mail fail:", e.message));
    }

    res.json({ plan });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.delete("/:id", auth, async (req, res) => {
  try {
    await StudyPlan.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    res.json({ success: true });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.patch("/:id/tasks/:taskId", auth, async (req, res) => {
  try {
    const plan = await StudyPlan.findOne({ _id: req.params.id, user: req.user._id });
    if (!plan) return res.status(404).json({ message: "Plan not found" });
    const task = plan.tasks.id(req.params.taskId);
    if (!task) return res.status(404).json({ message: "Task not found" });
    task.done = !task.done;
    await plan.save();
    res.json({ plan });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;