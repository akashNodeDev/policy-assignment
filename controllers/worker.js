const { parentPort, workerData } = require("worker_threads");
const csv = require("csv-parser");
const fs = require("fs");
const mongoose = require("mongoose");
const path = require("path");

require("dotenv").config({ path: path.join(__dirname, "../.env") });

const Agent = require("../models/agent");
const User = require("../models/user");
const UserAccount = require("../models/user_account");
const Lob = require("../models/lob");
const Carrier = require("../models/carrier");
const Policy = require("../models/policy");

const DB_URL =
  "mongodb+srv://" +
  process.env.DB_USERNAME +
  ":" +
  process.env.DB_PASSWORD +
  "@cluster0.zyrkerp.mongodb.net/" +
  process.env.DB_NAME +
  "?retryWrites=true&w=majority";

async function processCSV(filePath) {
  try {
    await mongoose.connect(DB_URL);

    const results = [];
    fs.createReadStream(filePath)
      .pipe(
        csv({
          skipLines: 1,
          mapHeaders: ({ header }) => header.trim().replace(/\n|\r/g, ""),
        })
      )
      .on("data", (data) => {
        //console.log("Data===>>>>", data);
        // Clean keys and values
        const cleanedData = {};
        for (const [key, value] of Object.entries(data)) {
          //console.log("KEY======>>>>", key);
          //console.log("VALUE======>>>>", value);
          if (key) {
            cleanedData[key.trim()] = value ? value.trim().replace(/\n|\r/g, "") : "";
          }
        }
        //console.log("cleanedData>>>>>>>>>>>>>>", cleanedData);
        if (cleanedData.firstname) {
          results.push(cleanedData);
        }
      })
      .on("end", async () => {
        let successCount = 0;
        let errorCount = 0;

        for (let row of results) {
          try {
            //console.log("rows=====>>>>>>>>", row);

            // Validate mandatory fields before any DB operation
            if (!row.firstname || !row.email || !row.phone || !row.policy_no || !row.code) {
              console.log("Skipping row due to missing required fields (firstname, email, phone, policy_no, or code)");
              errorCount++;
              continue;
            }

            // 1. Agent
            let agent = await Agent.findOne({ code: row.code });
            if (!agent && row.code) {
              agent = await Agent.create({ name: row.agent, code: row.code });
            }

            // 2. UserAccount
            let userAccount = await UserAccount.findOne({ account_name: row.account_name });
            if (!userAccount && row.account_name) {
              userAccount = await UserAccount.create({ account_name: row.account_name });
            }

            // 3. Lob
            let lob = await Lob.findOne({ category_name: row.category_name });
            if (!lob && row.category_name) {
              lob = await Lob.create({ category_name: row.category_name });
            }
            // console.log("LOB Records======>>>>>>", lob);

            // 4. Carrier
            let carrier = await Carrier.findOne({ company_name: row.company_name });
            if (!carrier && row.company_name) {
              carrier = await Carrier.create({ company_name: row.company_name });
            }

            // 5. User
            let user = await User.findOne({ email: row.email, phone: row.phone });
            if (!user) {
              user = await User.create({
                firstname: row.firstname,
                dob: row.dob ? new Date(row.dob) : null,
                address: row.Address || row.address,
                phone: row.phone,
                state: row.state,
                zipcode: row.zipcode,
                email: row.email,
                gender: row.gender,
                city: row.city,
                userType: row.userType || "Personal",
                agentId: agent ? agent._id : null,
              });
            }

            // 6. Policy
            let policy = await Policy.findOne({ policy_no: row.policy_no });
            if (!policy) {
              await Policy.create({
                policy_no: row.policy_no,
                policy_start_date: row.policy_start_date ? new Date(row.policy_start_date) : null,
                policy_end_date: row.policy_end_date ? new Date(row.policy_end_date) : null,
                premium_amount: row.premium_amount ? Number(row.premium_amount) : 0,
                company_id: carrier ? carrier._id : null,
                category_id: lob ? lob._id : null,
                user_id: user ? user._id : null,
                agent_id: agent ? agent._id : null,
              });
            }

            successCount++;
          } catch (err) {
            console.error(`Error processing row for ${row.email}:`, err.message);
            errorCount++;
          }
        }

        mongoose.connection.close();
        parentPort.postMessage({
          status: "success",
          message: `Data processing completed. Successfully uploaded: ${successCount}, Failed or Skipped: ${errorCount}`
        });
      });
  } catch (error) {
    parentPort.postMessage({ status: "error", message: error.message });
  }
}

if (workerData && workerData.filePath) {
  processCSV(workerData.filePath);
}
