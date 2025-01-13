import express from "express";
import cors from "cors";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import path from "path";

const app = express();

// -------- MULTER --------

// Middleware
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads");
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + "-" + uuidv4() + path.extname(file.originalname));
  },
});

// Configuration
const upload = multer({ storage });

// ------------------------

app.use(
  cors({
    origin: ["http://localhost:5173"],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("uploads"));

app.get("/", (req, res) => {
  res.json({ message: "Hey there!" });
});

app.post("/upload", upload.single("file"), (req, res) => {
  res.json({ message: "Upload successful" });
});

app.listen(8000, () => {
  console.log("App is listening on port 8000...");
});
