const messageModel = require("../models/message");
const mongoose = require("mongoose");


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
          message: "(Message,Day and time) fields are required"
        });
      }

      const savedMessage = await messageModel.create({
        message: req.body.message,
        day: req.body.day,
        time: req.body.time
      });

      return res.json({
        status: 200,
        data: savedMessage,
        message: "Message saved successfully"
      });
    } catch (err) {
      return res.json({
        status: 400,
        data: {},
        message: "something went wrong!!!!" + err
      });
    }
  }

}

module.exports = new CrudController();
