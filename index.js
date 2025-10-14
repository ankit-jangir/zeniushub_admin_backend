const express = require("express");
// const { connectDb } = require("./src/config/db");
const { router } = require("./src/routes");
const path = require("path");
const { PORT } = require("./src/config/server.config");
require("dotenv").config();
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// const cron = require('node-cron');
const db = require("./src/models");
const cors = require("cors");
const { try_catch } = require("./src/utils/tryCatch.handler");
const { getBlob, deleteAllBlobs } = require("./src/utils/azureUploader");
const customError = require("./src/utils/error.handler");
const authenticate = require("./src/middleware/admin.auth");
const multer = require("multer");

app.use(express.static(path.join(__dirname, "src")));
// const corsOptions = {
//   origin: ['http://localhost:3002/', 'https://adminv2-dev.intellix360.in/'], // Add your frontend localhost URL here
//   optionsSuccessStatus: 200 // Some legacy browsers (IE11, various SmartTVs) choke on 204
// };


const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:3002",
  "http://localhost:3003",
  // "https://adminv2-dev.intellix360.in"
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
  })
);
// deleteAllBlobs()

app.get(
  "/viewimagefromazure",
  try_catch(async (req, res) => {
    const { filePath } = req.query;

    const blobResponse = await getBlob(filePath);
    const readableStream = blobResponse.readableStreamBody;

    if (!readableStream) {
      console.error("readableStreamBody is undefined");
      throw new customError("Failed to get readable stream from blob.", 500);
    }

    if (filePath.endsWith(".jpg") || filePath.endsWith(".jpeg")) {
      res.setHeader("Content-Type", "image/jpeg");
    } else if (filePath.endsWith(".png")) {
      res.setHeader("Content-Type", "image/png");
    } else if (filePath.endsWith(".svg")) {
      res.setHeader("Content-Type", "image/svg+xml");
    } else if (filePath.endsWith(".webp")) {
      res.setHeader("Content-Type", "image/webp");
    } else if (filePath.endsWith(".pdf")) {
      res.setHeader("Content-Type", "application/pdf");
    } else {
      throw new customError("Unsupported file format.", 400);
    }

    readableStream.pipe(res);9
  })
);


app.get('/ping', authenticate, (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'Token is valid'
  });
});



app.use("/api", router);

console.log(process.memoryUsage());
// app.use(cors())
// app.get("/",(req,res)=>{console.log("adi")})
app.listen(PORT, () => {
  console.log("server started", PORT);
  // connectDb();
});



