import cors from "cors";
import crypto from "crypto";
import dotenv from "dotenv";
import express from "express";
import fs from "fs";
import multer from "multer";
import mysql from "mysql2/promise";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, "uploads");

fs.mkdirSync(uploadDir, { recursive: true });

const app = express();
const port = Number(process.env.PORT || 5000);

const corsOrigins = (process.env.CORS_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: corsOrigins,
  })
);
app.use(express.json());
app.use("/uploads", express.static(uploadDir));

const authorities = [
  { id: 1, name: "Municipal Corporation", handle: "@municipalcorp", category: "Sanitation", followers: "12.4k" },
  { id: 2, name: "Traffic Police", handle: "@trafficpolice", category: "Traffic", followers: "9.1k" },
  { id: 3, name: "Waste Department", handle: "@wastedept", category: "Sanitation", followers: "6.8k" },
  { id: 4, name: "Road Authority", handle: "@roadauthority", category: "Roads", followers: "8.7k" },
  { id: 5, name: "Water Board", handle: "@waterboard", category: "Water", followers: "5.4k" },
  { id: 6, name: "City Clean Squad", handle: "@citycleansquad", category: "Public Misconduct", followers: "7.3k" },
];

let memoryUsers = [];
let memoryPosts = [
  {
    id: 1,
    authority: "Road Authority",
    handle: "@roadauthority",
    category: "Roads",
    caption: "Large pothole near Riverfront Circle. Vehicles are swerving dangerously during evening traffic.",
    location: "Riverfront Circle, 3.2 km away",
    reward: "Reward pending approval",
    status: "Pending",
    media_url: "https://images.unsplash.com/photo-1515263487990-61b07816b324?auto=format&fit=crop&w=900&q=80",
    media_type: "image",
    latitude: 19.033,
    longitude: 72.846,
    created_at: new Date().toISOString(),
  },
  {
    id: 2,
    authority: "Waste Department",
    handle: "@wastedept",
    category: "Sanitation",
    caption: "Garbage pickup skipped for two days near Lotus Residency. The smell is spreading across the lane.",
    location: "Lotus Residency, 6.5 km away",
    reward: "50 points on approval",
    status: "In Review",
    media_url: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=900&q=80",
    media_type: "image",
    latitude: 19.051,
    longitude: 72.829,
    created_at: new Date().toISOString(),
  },
];

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => {
    callback(null, uploadDir);
  },
  filename: (_req, file, callback) => {
    const ext = path.extname(file.originalname);
    const safeName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    callback(null, safeName);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 40 * 1024 * 1024,
  },
  fileFilter: (_req, file, callback) => {
    if (file.mimetype.startsWith("image/") || file.mimetype.startsWith("video/")) {
      callback(null, true);
      return;
    }

    callback(new Error("Only image and video files are allowed."));
  },
});

function hashPassword(password) {
  return crypto.createHash("sha256").update(password).digest("hex");
}

function sanitizeUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
  };
}

function getDbConfig() {
  const config = {
    host: process.env.MYSQL_HOST,
    port: Number(process.env.MYSQL_PORT || 3306),
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
  };

  if (!config.host || !config.user || !config.database) {
    return null;
  }

  return config;
}

let pool = null;
let databaseMode = "memory";

async function ensureSchema() {
  if (!pool) {
    return;
  }

  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(120) NOT NULL,
      email VARCHAR(190) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS posts (
      id INT AUTO_INCREMENT PRIMARY KEY,
      authority VARCHAR(100) NOT NULL,
      handle VARCHAR(100) NOT NULL,
      caption TEXT NOT NULL,
      location VARCHAR(255) NOT NULL DEFAULT 'Within your 50 km zone',
      reward VARCHAR(255) NOT NULL,
      status VARCHAR(50) NOT NULL DEFAULT 'Pending',
      media_url TEXT NOT NULL,
      media_type VARCHAR(20) NOT NULL DEFAULT 'image',
      category VARCHAR(100) NOT NULL,
      latitude DECIMAL(10, 7) NULL,
      longitude DECIMAL(10, 7) NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

async function initDb() {
  const config = getDbConfig();

  if (!config) {
    console.log("MySQL config not found. Using memory mode.");
    return;
  }

  try {
    pool = mysql.createPool({
      ...config,
      waitForConnections: true,
      connectionLimit: 10,
    });

    await pool.query("SELECT 1");
    await ensureSchema();
    databaseMode = "mysql";
    console.log("Connected to MySQL.");
  } catch (error) {
    pool = null;
    databaseMode = "memory";
    console.log("MySQL unavailable. Falling back to memory mode.");
    console.log(error.message);
  }
}

function getAuthorityDetails(name) {
  return authorities.find((authority) => authority.name === name) ?? authorities[0];
}

async function findUserByEmail(email) {
  if (databaseMode !== "mysql" || !pool) {
    return memoryUsers.find((user) => user.email === email) ?? null;
  }

  const [rows] = await pool.query(
    "SELECT id, name, email, password_hash FROM users WHERE email = ? LIMIT 1",
    [email]
  );

  return rows[0] ?? null;
}

async function createUser({ name, email, password }) {
  const passwordHash = hashPassword(password);

  if (databaseMode !== "mysql" || !pool) {
    const newUser = {
      id: Date.now(),
      name,
      email,
      password_hash: passwordHash,
    };
    memoryUsers.push(newUser);
    return sanitizeUser(newUser);
  }

  const [result] = await pool.query(
    "INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)",
    [name, email, passwordHash]
  );

  return {
    id: result.insertId,
    name,
    email,
  };
}

async function getPosts() {
  if (databaseMode !== "mysql" || !pool) {
    return memoryPosts;
  }

  const [rows] = await pool.query(
    `SELECT id, authority, handle, caption, location, reward, status, media_url, media_type, category, latitude, longitude, created_at
     FROM posts
     ORDER BY created_at DESC, id DESC`
  );

  return rows;
}

async function createPost(payload) {
  const authorityDetails = getAuthorityDetails(payload.authority);
  const reward =
    payload.category === "Public Misconduct"
      ? "5% fine share if verified"
      : "Reward points after approval";

  const nextPost = {
    authority: authorityDetails.name,
    handle: authorityDetails.handle,
    caption: payload.caption,
    location: payload.location || "Within your 50 km zone",
    reward,
    status: "Pending",
    media_url: payload.media_url,
    media_type: payload.media_type,
    category: payload.category,
    latitude: payload.latitude,
    longitude: payload.longitude,
  };

  if (databaseMode !== "mysql" || !pool) {
    const memoryPost = {
      id: Date.now(),
      ...nextPost,
      created_at: new Date().toISOString(),
    };
    memoryPosts = [memoryPost, ...memoryPosts];
    return memoryPost;
  }

  const [result] = await pool.query(
    `INSERT INTO posts
      (authority, handle, caption, location, reward, status, media_url, media_type, category, latitude, longitude)
     VALUES
      (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      nextPost.authority,
      nextPost.handle,
      nextPost.caption,
      nextPost.location,
      nextPost.reward,
      nextPost.status,
      nextPost.media_url,
      nextPost.media_type,
      nextPost.category,
      nextPost.latitude,
      nextPost.longitude,
    ]
  );

  return {
    id: result.insertId,
    ...nextPost,
    created_at: new Date().toISOString(),
  };
}

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, mode: databaseMode });
});

app.get("/api/authorities", (_req, res) => {
  res.json(authorities);
});

app.post("/api/auth/signup", async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "Name, email, and password are required." });
  }

  try {
    const existing = await findUserByEmail(email);
    if (existing) {
      return res.status(409).json({ message: "An account with this email already exists." });
    }

    const user = await createUser({ name, email, password });
    return res.status(201).json({ user });
  } catch {
    return res.status(500).json({ message: "Could not create account." });
  }
});

app.post("/api/auth/signin", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required." });
  }

  try {
    const user = await findUserByEmail(email);
    if (!user || user.password_hash !== hashPassword(password)) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    return res.json({ user: sanitizeUser(user) });
  } catch {
    return res.status(500).json({ message: "Could not sign in." });
  }
});

app.get("/api/posts", async (_req, res) => {
  try {
    const posts = await getPosts();
    res.json(posts);
  } catch {
    res.status(500).json({ message: "Failed to fetch posts." });
  }
});

app.post("/api/posts", upload.single("media"), async (req, res) => {
  const { authority, caption, category, location, latitude, longitude } = req.body;

  if (!authority || !caption || !category) {
    return res.status(400).json({
      message: "Authority, caption, and category are required.",
    });
  }

  if (!req.file) {
    return res.status(400).json({ message: "Please upload an image or video." });
  }

  try {
    const mediaType = req.file.mimetype.startsWith("video/") ? "video" : "image";
    const created = await createPost({
      authority,
      caption,
      category,
      location,
      latitude: latitude ? Number(latitude) : null,
      longitude: longitude ? Number(longitude) : null,
      media_url: `http://localhost:${port}/uploads/${req.file.filename}`,
      media_type: mediaType,
    });

    return res.status(201).json(created);
  } catch {
    return res.status(500).json({ message: "Failed to create post." });
  }
});

app.use((error, _req, res) => {
  if (error instanceof multer.MulterError || error.message) {
    return res.status(400).json({ message: error.message });
  }

  return res.status(500).json({ message: "Unexpected server error." });
});

initDb().finally(() => {
  app.listen(port, () => {
    console.log(`CivicEye server running on http://localhost:${port}`);
  });
});
