const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

const sendEmail = async ({ to, subject, html }) => {
  if (!process.env.MAIL_USER || !process.env.MAIL_PASS) {
    console.warn("Email skipped: MAIL_USER or MAIL_PASS not set");
    return false;
  }
  try {
    await transporter.sendMail({
      from: `"CoreLogic" <${process.env.MAIL_USER}>`,
      to, subject, html,
    });
    console.log(`Email sent -> ${to} | ${subject}`);
    return true;
  } catch (e) {
    console.error("Email error:", e.message);
    return false;
  }
};

const sendWelcome = async (email, name) => sendEmail({
  to: email,
  subject: "Welcome to CoreLogic!",
  html: `<h2>Welcome, ${name}!</h2><p>Your account is ready.</p>`,
});

const sendPasswordReset = async (email, token, name) => sendEmail({
  to: email,
  subject: "Reset your CoreLogic password",
  html: `<h2>Password Reset</h2><p>Hi ${name},</p><a href="${process.env.APP_URL}/reset?token=${token}">Reset Password</a>`,
});

const sendStudyReminder = async (plan) => sendEmail({
  to: plan.reminder.email,
  subject: `Reminder: "${plan.subject}" due in ${plan.reminder.daysBefore} day(s)`,
  html: `<h2>Study Reminder</h2><p>${plan.subject} is due on ${new Date(plan.targetDate).toDateString()}</p><p>Tasks remaining: ${plan.tasks.filter(t=>!t.done).length}/${plan.tasks.length}</p>`,
});

const sendReminderConfirmation = async (plan) => sendEmail({
  to: plan.reminder.email,
  subject: `Reminder set for "${plan.subject}"`,
  html: `<h2>Reminder confirmed!</h2><p>We will remind you ${plan.reminder.daysBefore} day(s) before ${new Date(plan.targetDate).toDateString()}</p>`,
});

module.exports = { sendEmail, sendWelcome, sendPasswordReset, sendStudyReminder, sendReminderConfirmation };
