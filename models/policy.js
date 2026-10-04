const mongoose = require("mongoose");

const PolicySchema = mongoose.Schema(
  {
    policy_no: { type: String, default: "" },
    policy_start_date: { type: Date, default: null },
    policy_end_date: { type: Date, default: null },
    premium_amount: { type: Number, default: 0.0 },
    company_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Carrier",
      enum: null,
    },
    category_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lob",
      default: null,
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    agent_id: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
      ref: "Agent",
    },
  },
  { timestamps: true, versionKey: false },
);

module.exports = mongoose.model("Policy", PolicySchema);
