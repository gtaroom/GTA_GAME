import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs"; // Import file system to create directories
import { asyncHandler } from "../utils/async-handler";
import {
  getBanners,
  createBanner,
  updateBanner,
  deleteBanner,
} from "../controllers/banner.controller";
import { verifyJWT, verifyPermission } from "../middlewares/auth-middleware";
import { adminLimiter } from "../middlewares/rate-limiters";
import { checkPermission } from "../middlewares/permission-middleware";
const bannerRouter = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Uses process.cwd() to get the absolute path to the server root
    const uploadPath = path.join(process.cwd(), "public", "banners");

    // Check if directory exists, if not, create it recursively
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit per image
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error("Only images (jpeg, jpg, png, webp) are allowed!"));
    }
  },
});

// --- ROUTES ---

// Public routes
bannerRouter.get("/", asyncHandler(getBanners));

// Admin routes (Protected)
bannerRouter.use(verifyJWT, verifyPermission(["ADMIN"]), adminLimiter);

// Create Banner
bannerRouter.post(
  "/create",
  upload.fields([
    { name: "background", maxCount: 1 },
    { name: "main", maxCount: 1 },
    { name: "cover", maxCount: 1 },
  ]),
  checkPermission("canManageBanners"),
  asyncHandler(createBanner)
);

// Update Banner
bannerRouter.put(
  "/:id",
  upload.fields([
    { name: "background", maxCount: 1 },
    { name: "main", maxCount: 1 },
    { name: "cover", maxCount: 1 },
  ]),
  checkPermission("canManageBanners"),
  asyncHandler(updateBanner)
);

// Delete Banner
bannerRouter.delete(
  "/:id",
  asyncHandler(deleteBanner),
  checkPermission("canManageBanners")
);

export default bannerRouter;
