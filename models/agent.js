const mongoose = require("mongoose");

const AgentSchema = mongoose.Schema(
  {
    name: { type: String, default: "" },
    code: { type: String, default: "" },
  },
  { timestamps: true, versionKey: false },
);

module.exports = mongoose.model("Agent", AgentSchema);
