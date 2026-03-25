import app from "./app.js";
import connectDB from "./config/db.js";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

dotenv.config({quiet: true});

const PORT = 5000;

const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log("Created uploads directory");
}


connectDB(process.env.MONGO_URI);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});