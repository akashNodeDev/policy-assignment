const mongoose = require("mongoose");

const UserSchema = mongoose.Schema(
  {
    firstname: { type: String, required: true },
    dob: { type: Date, default: null },
    address: { type: String, default: "" },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    state: { type: String, default: "" },
    zipcode: { type: String, default: "" },
    gender: { type: String, enum: ["Male", "Female", "Other"] },
    city: { type: String, default: "" },
    userType: {
      type: String,
      default: "Personal",
      enum: ["Personal", "Commercial"],
    },
    agentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Agent",
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

module.exports = mongoose.model("User", UserSchema);
