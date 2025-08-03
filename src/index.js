import express from "express";
import "dotenv/config";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import bookRoutes from "./routes/bookRoutes.js";
import { connectDB } from "./lib/db.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors({
  origin: "*",
  credentials: true
}));
app.use("/api/auth", authRoutes);
app.use("/api/books", bookRoutes);

app.listen(PORT, "0.0.0.0", async () => {
  console.log(`Server is running on port ${PORT}`);
  await connectDB();
});
