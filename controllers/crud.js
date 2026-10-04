const messageModel = require("../models/message");
const mongoose = require("mongoose");
const { Worker } = require("worker_threads");
const path = require("path");
const Policy = require("../models/policy");
const User = require("../models/user");
const Carrier = require("../models/carrier");
const Lob = require("../models/lob");
const Agent = require("../models/agent");

class CrudController {
  /**
   * @Method sendMessage
   * @Description: To save the message along with day and time
   */
  async sendMessage(req, res) {
    try {
      if (!req.body || !req.body.message || !req.body.day || !req.body.time) {
        return res.json({
          status: 400,
          data: {},
          message: "(Message,Day and time) fields are required",
        });
      }

      const savedMessage = await messageModel.create({
        message: req.body.message,
        day: req.body.day,
        time: req.body.time,
      });

      return res.json({
        status: 200,
        data: savedMessage,
        message: "Message saved successfully",
      });
    } catch (err) {
      return res.json({
        status: 400,
        data: {},
        message: "something went wrong!!!!" + err,
      });
    }
  }

  /**
   * @Method uploadCsv
   * @Description: To upload the CSV data into DB using worker threads
   */
  async uploadCsv(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const file = req.file;
      const worker = new Worker(path.join(__dirname, "worker.js"), {
        workerData: { filePath: file.path },
      });

      worker.on("message", (msg) => {
        if (msg.status === "success") {
          return res.status(200).json({ message: msg.message });
        } else {
          return res.status(500).json({ message: msg.message });
        }
      });

      worker.on("error", (err) => {
        return res.status(500).json({ message: err.message });
      });

      worker.on("exit", (code) => {
        if (code !== 0) {
          console.error(new Error(`Worker stopped with exit code ${code}`));
        }
      });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  }

  /**
   * @Method searchPolicy
   * @Description: Search API to find policy info with the help of the username.
   */
  async searchPolicy(req, res) {
    try {
      const { username } = req.query; // Assuming username maps to firstname in User schema
      if (!username) {
        return res.status(400).json({ message: "Username is required" });
      }

      const users = await User.find({ firstname: username });
      if (users.length === 0) {
        return res.status(404).json({ message: "User not found" });
      }

      const userIds = users.map((u) => u._id);
      const policies = await Policy.find({ user_id: { $in: userIds } })
        .populate("company_id")
        .populate("category_id")
        .populate("user_id")
        .populate("agent_id");

      return res.status(200).json({ policies });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  }

  /**
   * @Method aggregatePolicies
   * @Description: API to provide aggregated policy by each user.
   */
  async aggregatePolicies(req, res) {
    try {
      const aggregated = await Policy.aggregate([
        {
          $lookup: {
            from: "users",
            localField: "user_id",
            foreignField: "_id",
            as: "user",
          },
        },
        {
          $unwind: "$user",
        },
        {
          $group: {
            _id: "$user._id",
            firstname: { $first: "$user.firstname" },
            policies: { $push: "$$ROOT" },
            totalPremium: { $sum: "$premium_amount" },
            policyCount: { $sum: 1 },
          },
        },
      ]);

      return res.status(200).json({ aggregated });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  }
}

module.exports = new CrudController();
