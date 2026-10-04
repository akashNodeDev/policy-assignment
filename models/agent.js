const mongoose = require("mongoose");

const AgentSchema = mongoose.Schema(
  {
    name: { type: String, default: "", required: true },
    code: { type: String, default: "", required: true }
  },
  { timestamps: true, versionKey: false },
);

module.exports = mongoose.model("Agent", AgentSchema);
