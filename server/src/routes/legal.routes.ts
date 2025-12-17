import express from "express";
import multer from "multer";
import path from "path";
import { asyncHandler } from "../utils/async-handler";
import {
  getAllLegalDocuments,
  uploadLegalDocument,
  deleteLegalDocument,
  getPublicLegalDocument,
} from "../controllers/legal.controller";
import { verifyJWT, verifyPermission } from "../middlewares/auth-middleware";
import { adminLimiter } from "../middlewares/rate-limiters";

const legalRouter = express.Router();

// Configure multer for PDF uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/pdfs/"); // Make sure this directory exists
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
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed!"));
    }
  },
});

// Public routes (no authentication required)
legalRouter.get("/public/:documentType", asyncHandler(getPublicLegalDocument));

// Admin routes (require authentication and admin permission)
legalRouter.use(verifyJWT, verifyPermission(["ADMIN"]), adminLimiter);

legalRouter.get("/documents", asyncHandler(getAllLegalDocuments));
legalRouter.post(
  "/upload",
  upload.single("pdf"),
  asyncHandler(uploadLegalDocument)
);
legalRouter.delete(
  "/documents/:documentType",
  asyncHandler(deleteLegalDocument)
);

export default legalRouter;
