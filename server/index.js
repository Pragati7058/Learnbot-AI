require("dotenv").config();

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const cron = require("node-cron");
const connectDB = require("./config/db");
const StudyPlan = require("./models/StudyPlan");
const { sendStudyReminder } = require("./services/email");
const { sendWeeklyReports } = require("./services/weeklyReport");

const app = express();

app.set("trust proxy", 1);

connectDB();

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (origin === "http://localhost:5173") return callback(null, true);
    if (origin && origin.includes("vercel.app")) return callback(null, true);
    return callback(null, false);
  },
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json({ limit: "2mb" }));
app.use(morgan("dev"));

if (process.env.NODE_ENV !== "production") {
  app.use((req, res, next) => {
    console.log("Incoming:", req.method, req.url);
    next();
  });
}

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: "Too many requests, please try again later",
});
app.use("/api/", limiter);

app.get("/", (req, res) => res.send("🚀 LearnBot API is running"));

app.use("/api/auth", require("./routes/auth"));
app.use("/api/history", require("./routes/history"));
app.use("/api/bookmarks", require("./routes/bookmarks"));
app.use("/api/studyplan", require("./routes/studyplan"));
app.use("/api/stats", require("./routes/stats"));
app.use("/api/report", require("./routes/report"));

app.get("/api/health", (req, res) => res.json({ status: "ok", timestamp: new Date() }));

app.use((req, res) => res.status(404).json({ message: "Route not found" }));

app.use((err, req, res, next) => {
  console.error("ERROR:", err.message);
  res.status(500).json({ message: err.message || "Internal Server Error" });
});

cron.schedule("0 8 * * *", async () => {
  console.log("⏰ Running study plan reminder cron...");
  try {
    const today = new Date();
    const plans = await StudyPlan.find({
      "reminder.email": { $ne: null },
      "reminder.sent": false,
      targetDate: { $ne: null },
    });

    let sent = 0;
    for (const plan of plans) {
      const daysLeft = Math.ceil((new Date(plan.targetDate) - today) / 86400000);
      if (daysLeft !== plan.reminder.daysBefore) continue;
      const ok = await sendStudyReminder(plan);
      if (ok) {
        plan.reminder.sent = true;
        await plan.save();
        sent++;
      }
    }
    console.log(`✅ Reminders sent: ${sent}`);
  } catch (e) {
    console.error("Cron error:", e.message);
  }
});

cron.schedule("0 8 * * 1", async () => {
  try {
    await sendWeeklyReports();
  } catch (e) {
    console.error("Weekly report cron error:", e.message);
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 LearnBot server running on port ${PORT}`));