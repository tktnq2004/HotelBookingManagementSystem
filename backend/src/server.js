import app from "./app.js";
import connectDB from "./config/db.js";
import dotenv from "dotenv";
dotenv.config();

const PORT = 5000;

connectDB(process.env.MONGO_URI);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});