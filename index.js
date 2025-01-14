import express from "express";
import cors from "cors";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import fs from "fs";
import { exec } from "child_process";

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
  const lessonId = uuidv4();
  const videoPath = req.file.path;
  const outputPath = `./uploads/courses/${lessonId}`;
  const hlsPath = `${outputPath}/index.m3u8`;

  console.log("HLS Path:", hlsPath);

  if (!fs.existsSync(outputPath)) {
    fs.mkdirSync(outputPath, { recursive: true });
  }

  const ffmpegCommand = `ffmpeg -i ${videoPath} -codec:v libx264 -codec:a aac -hls_time 10 -hls_playlist_type vod -hls_segment_filename "${outputPath}/segment%03d.ts" -start_number 0 ${hlsPath}`;

  // TODO: Figure out a better way to do this
  exec(ffmpegCommand, (error, stdout, stderr) => {
    if (error) {
      console.log("exec error:", error);
    }

    console.log("stdout:", stdout);
    console.log("stderr:", stderr);

    const videoUrl = `http://localhost:8000/uploads/courses/${lessonId}/index.m3u8`;

    res.json({
      message: "Video converted to HLS",
      videoUrl,
      lessonId,
    });
  });
});

app.listen(8000, () => {
  console.log("App is listening on port 8000...");
});
