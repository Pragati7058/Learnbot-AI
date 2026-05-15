const mongoose = require("mongoose");

const BookmarkSchema = new mongoose.Schema({
  user:        { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title:       { type: String, required: true },
  tool:        { type: String, required: true },
  content:     { type: String, default: "" },
  contentType: { type: String, default: "text" },
  note:        { type: String, default: "" },
  tags:        [String],
}, { timestamps: true });

module.exports = mongoose.model("Bookmark", BookmarkSchema);
