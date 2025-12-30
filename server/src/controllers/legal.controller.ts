import { Request, Response } from "express";
import LegalDocumentModel from "../models/legal-document";
import { logger } from "../utils/logger";
import path from "path";
import fs from "fs";

/**
 * @description Get all legal documents
 * @route GET /api/v1/legal/documents
 */
export const getAllLegalDocuments = async (req: Request, res: Response) => {
  try {
    let documents = await LegalDocumentModel.find({ isActive: true });

    // Auto-initialize if empty
    if (documents.length === 0) {
      const types = [
        "privacy-policy",
        "terms-conditions",
        "age-policy",
        "accessibility",
        "responsible-gaming",
        "sms-terms",
        "sweepstakes-rules",
        "refund-policy",
      ];

      for (const type of types) {
        await LegalDocumentModel.create({
          documentType: type,
          fileName: "",
          pdfUrl: "",
          fileSize: 0,
          version: 0,
          isActive: true,
        });
      }

      // Fetch again
      documents = await LegalDocumentModel.find({ isActive: true });
    }

    // Transform to object
    const documentsMap: any = {};
    documents.forEach((doc) => {
      documentsMap[doc.documentType] = {
        documentType: doc.documentType,
        pdfUrl: doc.pdfUrl,
        fileName: doc.fileName,
        fileSize: doc.fileSize,
        version: doc.version,
        updatedAt: doc.updatedAt,
        updatedBy: doc.updatedBy,
      };
    });

    res.status(200).json({ data: documentsMap });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @description Upload legal document PDF
 * @route POST /api/v1/legal/upload
 */
export const uploadLegalDocument = async (req: Request, res: Response) => {
  try {
    const { documentType } = req.body;
    const file = req.file;
    const userId = (req as any).user?._id;

    // Validation
    if (!documentType) {
      return res.status(400).json({
        message: "Missing required field: documentType",
      });
    }

    if (!file) {
      return res.status(400).json({
        message: "Please upload a PDF file",
      });
    }

    // Validate PDF
    if (file.mimetype !== "application/pdf") {
      // Delete uploaded file
      fs.unlinkSync(file.path);
      return res.status(400).json({
        message: "Only PDF files are allowed",
      });
    }

    // Create PDF URL (relative path for serving)
    const pdfUrl = `/public/pdfs/${file.filename}`;

    // Find existing document or create new one
    let document = await LegalDocumentModel.findOne({ documentType });

    if (document) {
      // Delete old PDF file if exists
      if (document.pdfUrl) {
        const oldFilePath = path.join(__dirname, `../../${document.pdfUrl}`);
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      }

      // Update existing
      document.pdfUrl = pdfUrl;
      document.fileName = file.originalname;
      document.fileSize = file.size;
      document.version += 1;
      document.updatedBy = userId;
      await document.save();
    } else {
      // Create new
      document = await LegalDocumentModel.create({
        documentType,
        pdfUrl,
        fileName: file.originalname,
        fileSize: file.size,
        version: 1,
        updatedBy: userId,
        isActive: true,
      });
    }

    logger.info(
      `Legal document uploaded: ${documentType} v${document.version}`
    );

    res.status(200).json({
      data: {
        message: "Document uploaded successfully",
        version: document.version,
        pdfUrl,
      },
    });
  } catch (error: any) {
    logger.error("Upload legal document error:", error);

    // Delete uploaded file on error
    if (req.file) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (err) {
        logger.error("Error deleting file:", err);
      }
    }

    res.status(500).json({
      message: "Failed to upload document",
      error: error.message,
    });
  }
};

/**
 * @description Delete legal document
 * @route DELETE /api/v1/legal/documents/:documentType
 */
export const deleteLegalDocument = async (req: Request, res: Response) => {
  try {
    const { documentType } = req.params;

    const document = await LegalDocumentModel.findOne({
      documentType,
      isActive: true,
    });

    if (!document) {
      return res.status(404).json({
        message: "Document not found",
      });
    }

    // Delete PDF file
    if (document.pdfUrl) {
      const filePath = path.join(__dirname, `../../${document.pdfUrl}`);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    // Soft delete (or hard delete)
    await LegalDocumentModel.deleteOne({ documentType });

    logger.info(`Legal document deleted: ${documentType}`);

    res.status(200).json({
      data: {
        message: "Document deleted successfully",
      },
    });
  } catch (error: any) {
    logger.error("Delete legal document error:", error);
    res.status(500).json({
      message: "Failed to delete document",
      error: error.message,
    });
  }
};

/**
 * @description Get single legal document (Public)
 * @route GET /api/v1/legal/public/:documentType
 */
export const getPublicLegalDocument = async (req: Request, res: Response) => {
  try {
    const { documentType } = req.params;

    const document = await LegalDocumentModel.findOne({
      documentType,
      isActive: true,
    });

    if (!document) {
      return res.status(404).json({
        message: "Document not found",
      });
    }

    res.status(200).json({
      data: {
        documentType: document.documentType,
        pdfUrl: document.pdfUrl,
        fileName: document.fileName,
        version: document.version,
        updatedAt: document.updatedAt,
      },
    });
  } catch (error: any) {
    logger.error("Get public legal document error:", error);
    res.status(500).json({
      message: "Failed to get legal document",
      error: error.message,
    });
  }
};
