const router = require("express").Router();
const multer = require("multer");
const fs = require("fs");
const crudController = require("../controllers/crud");

const Storage = multer.diskStorage({
  destination: (req, file, callback) => {
    if (!fs.existsSync("./public/uploads")) {
      fs.mkdirSync("./public/uploads", { recursive: true });
    }
    callback(null, "./public/uploads");
  },
  filename: (req, file, callback) => {
    callback(null, Date.now() + "_" + file.originalname.replace(/\s/g, "_"));
  },
});

const uploadFile = multer({ storage: Storage });

/** API to upload the csv file and save the data */
router.post("/upload", uploadFile.single("file"), crudController.uploadCsv);

/** Search API to find policy info with the help of the username */
router.get("/search-policy", crudController.searchPolicy);

/** API to provide aggregated policy by each user */
router.get("/aggregated-policies", crudController.aggregatePolicies);

/** API to save the message data in the database*/
router.post("/send-message", crudController.sendMessage);

module.exports = router;