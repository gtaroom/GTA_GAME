import { model, Schema, Document, models } from "mongoose";

export interface LegalDocumentSchemaIn extends Document {
  documentType: string;
  pdfUrl: string;
  fileName: string;
  fileSize: number;
  version: number;
  updatedBy?: string;
  isActive: boolean;
}

const LegalDocumentSchema = new Schema<LegalDocumentSchemaIn>(
  {
    documentType: {
      type: String,
      required: true,
      unique: true,
      enum: [
        "privacy-policy",
        "terms-conditions",
        "age-policy",
        "accessibility",
        "responsible-gaming",
        "sms-terms",
        "sweepstakes-rules",
        "refund-policy",
      ],
    },
    pdfUrl: {
      type: String,
      required: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number,
      required: true,
    },
    version: {
      type: Number,
      default: 1,
    },
    updatedBy: {
      type: String,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Index for faster queries
LegalDocumentSchema.index({ documentType: 1 });

const LegalDocumentModel =
  models.LegalDocument ||
  model<LegalDocumentSchemaIn>("LegalDocument", LegalDocumentSchema);
export default LegalDocumentModel;
