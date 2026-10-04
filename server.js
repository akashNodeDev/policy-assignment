const express = require("express");
const app = express();
require("dotenv").config();
const path = require("path");
_ = require("underscore");
const os = require("os");

function getCpuUsage() {
  const cpus = os.cpus();
  let user = 0, nice = 0, sys = 0, idle = 0, irq = 0;
  for (let cpu of cpus) {
    user += cpu.times.user;
    nice += cpu.times.nice;
    sys += cpu.times.sys;
    idle += cpu.times.idle;
    irq += cpu.times.irq;
  }
  return { idle, total: user + nice + sys + idle + irq };
}

let startMeasure = getCpuUsage();

setInterval(() => {
  const endMeasure = getCpuUsage();
  const idleDiff = endMeasure.idle - startMeasure.idle;
  const totalDiff = endMeasure.total - startMeasure.total;
  if (totalDiff === 0) return;
  const percentageCpu = 100 - Math.floor((100 * idleDiff) / totalDiff);
  
  if (percentageCpu >= 70) {
    console.log(`CPU usage is ${percentageCpu}%. Restarting server...`);
    process.exit(1);
  }
  startMeasure = getCpuUsage();
}, 5000);

const bodyParser = require("body-parser");

app.use(
  bodyParser.urlencoded({
    extended: true,
  }),
);

app.use(
  bodyParser.json({
    limit: "50mb",
  }),
);

const crudRouter = require("./routes/crud");

app.use("/api", crudRouter);

const port = process.env.PORT;

// Database Connection

require(path.join(__dirname, "/config", "database"))();

app.listen(port, () => {
  console.log(`Server is connected @ http://localhost:${port}`);
});
