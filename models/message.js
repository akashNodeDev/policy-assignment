const mongoose = require("mongoose");

const MessageSchema = mongoose.Schema(
    {
        message: { type: String, required: true },
        time: { type: Date, default: null },
        day: { type: String, default: "" }
    },
    {
        timestamps: true,
        versionKey: false,
    },
);

module.exports = mongoose.model("Message", MessageSchema);