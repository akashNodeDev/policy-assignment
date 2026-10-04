const mongoose = require("mongoose");

const UserAccountSchema = mongoose.Schema(
  {
    account_name: { type: String, default: "" },
  },
  { timestamps: true, versionKey: false },
);

module.exports = mongoose.model("User_Account", UserAccountSchema);
