import React, { useState } from "react";
import {
  Upload,
  Download,
  FileText,
  Trash2,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import {
  useGetLegalDocumentsQuery,
  useUploadLegalDocumentMutation,
  useDeleteLegalDocumentMutation,
} from "../services/api/legalApi";
import { useToast } from "../context/ToastContext";
import Card from "../components/Card";
import LoadingSpinner from "../components/LoadingSpinner";

// Document types
const DOCUMENT_TYPES = [
  { id: "privacy-policy", label: "Privacy Policy", icon: "🔒" },
  { id: "terms-conditions", label: "Terms & Conditions", icon: "📜" },
  { id: "age-policy", label: "Age Policy", icon: "🎂" },
  { id: "sweepstakes-rules", label: "Sweepstakes Rules", icon: "🎁" },
  { id: "responsible-gaming", label: "Responsible Gaming", icon: "🎮" },
  { id: "accessibility", label: "Accessibility", icon: "♿" },
  { id: "sms-terms", label: "SMS Terms", icon: "💬" },
  { id: "refund-policy", label: "Refund Policy", icon: "💰" },
];

const LegalDocumentsManagement: React.FC = () => {
  const { showToast } = useToast();
  const [selectedFile, setSelectedFile] = useState<{
    [key: string]: File | null;
  }>({});
  const [uploadingDoc, setUploadingDoc] = useState<string | null>(null);

  // API hooks
  const { data: documents, isLoading, refetch } = useGetLegalDocumentsQuery();
  const [uploadDocument] = useUploadLegalDocumentMutation();
  const [deleteDocument, { isLoading: deleting }] =
    useDeleteLegalDocumentMutation();

  const handleFileSelect = (
    documentType: string,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate PDF
      if (file.type !== "application/pdf") {
        showToast("Please select a PDF file", "error");
        return;
      }

      // Validate size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        showToast("File size must be less than 10MB", "error");
        return;
      }

      setSelectedFile({ ...selectedFile, [documentType]: file });
    }
  };

  const handleUpload = async (documentType: string) => {
    const file = selectedFile[documentType];
    if (!file) {
      showToast("Please select a file first", "error");
      return;
    }

    setUploadingDoc(documentType);

    try {
      const formData = new FormData();
      formData.append("pdf", file);
      formData.append("documentType", documentType);

      await uploadDocument(formData).unwrap();
      showToast("PDF uploaded successfully!", "success");

      // Clear selected file
      setSelectedFile({ ...selectedFile, [documentType]: null });

      // Reset file input
      const fileInput = document.getElementById(
        `file-${documentType}`
      ) as HTMLInputElement;
      if (fileInput) fileInput.value = "";

      refetch();
    } catch (error: any) {
      showToast(error?.data?.message || "Failed to upload PDF", "error");
    } finally {
      setUploadingDoc(null);
    }
  };

  const handleDelete = async (documentType: string) => {
    if (!window.confirm("Are you sure you want to delete this document?"))
      return;

    try {
      await deleteDocument(documentType).unwrap();
      showToast("Document deleted successfully!", "success");
      refetch();
    } catch (error: any) {
      showToast(error?.data?.message || "Failed to delete document", "error");
    }
  };

  const handleViewPdf = (pdfUrl: string) => {
    window.open(pdfUrl, "_blank");
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Legal Documents</h1>
        <p className="text-gray-600 mt-2">
          Upload and manage legal documents (PDFs) for your website
        </p>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex">
          <AlertCircle className="text-blue-600 mr-3 flex-shrink-0" size={20} />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Upload Instructions:</p>
            <ul className="list-disc ml-5 space-y-1">
              <li>Only PDF files are accepted</li>
              <li>Maximum file size: 10MB</li>
              <li>
                Documents are immediately available on the website after upload
              </li>
              <li>Previous versions are automatically replaced</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {DOCUMENT_TYPES.map((doc) => {
          const document = documents?.[doc.id];
          const hasDocument = !!document?.pdfUrl;
          const selectedForUpload = selectedFile[doc.id];

          return (
            <Card key={doc.id} className="hover:shadow-lg transition-shadow">
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center">
                    <span className="text-3xl mr-3">{doc.icon}</span>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {doc.label}
                      </h3>
                      {hasDocument ? (
                        <div className="flex items-center text-xs text-green-600 mt-1">
                          <CheckCircle size={12} className="mr-1" />
                          Uploaded
                        </div>
                      ) : (
                        <div className="flex items-center text-xs text-gray-500 mt-1">
                          <XCircle size={12} className="mr-1" />
                          No document
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Document Info */}
                {hasDocument && document && (
                  <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                    <div className="flex items-center text-xs text-gray-600">
                      <Clock size={12} className="mr-1" />
                      Updated:{" "}
                      {new Date(document.updatedAt).toLocaleDateString()}
                    </div>
                    <div className="flex items-center text-xs text-gray-600">
                      <FileText size={12} className="mr-1" />
                      Version: {document.version}
                    </div>
                  </div>
                )}

                {/* File Input */}
                <div>
                  <label
                    htmlFor={`file-${doc.id}`}
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    {hasDocument ? "Replace PDF" : "Upload PDF"}
                  </label>
                  <input
                    id={`file-${doc.id}`}
                    type="file"
                    accept=".pdf"
                    onChange={(e) => handleFileSelect(doc.id, e)}
                    className="block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-lg file:border-0
                      file:text-sm file:font-semibold
                      file:bg-blue-50 file:text-blue-700
                      hover:file:bg-blue-100
                      cursor-pointer"
                  />
                  {selectedForUpload && (
                    <p className="text-xs text-green-600 mt-1">
                      Selected: {selectedForUpload.name}
                    </p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  {selectedForUpload ? (
                    <button
                      onClick={() => handleUpload(doc.id)}
                      disabled={uploadingDoc === doc.id}
                      className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm font-medium"
                    >
                      {uploadingDoc === doc.id ? (
                        <>
                          <LoadingSpinner size="small" color="white" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload size={16} />
                          Upload
                        </>
                      )}
                    </button>
                  ) : hasDocument ? (
                    <>
                      <button
                        onClick={() => handleViewPdf(document.pdfUrl)}
                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2 text-sm font-medium"
                      >
                        <Eye size={16} />
                        View
                      </button>
                      <button
                        onClick={() => handleDelete(doc.id)}
                        disabled={deleting}
                        className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm font-medium"
                      >
                        <Trash2 size={16} />
                      </button>
                    </>
                  ) : (
                    <button
                      disabled
                      className="flex-1 px-4 py-2 bg-gray-100 text-gray-400 rounded-lg cursor-not-allowed text-sm font-medium"
                    >
                      Select file to upload
                    </button>
                  )}
                </div>

                {/* Download Link */}
                {hasDocument && (
                  <a
                    href={document.pdfUrl}
                    download
                    className="block text-center text-sm text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    <Download size={14} className="inline mr-1" />
                    Download PDF
                  </a>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Stats Summary */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-3xl font-bold text-blue-600">
              {Object.values(documents || {}).filter((d) => d.pdfUrl).length}
            </p>
            <p className="text-sm text-gray-600 mt-1">Documents Uploaded</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-gray-400">
              {DOCUMENT_TYPES.length -
                Object.values(documents || {}).filter((d) => d.pdfUrl).length}
            </p>
            <p className="text-sm text-gray-600 mt-1">Missing Documents</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-green-600">
              {Object.values(documents || {}).reduce(
                (sum, d) => sum + (d.version || 0),
                0
              )}
            </p>
            <p className="text-sm text-gray-600 mt-1">Total Updates</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-purple-600">
              {DOCUMENT_TYPES.length}
            </p>
            <p className="text-sm text-gray-600 mt-1">Total Categories</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default LegalDocumentsManagement;
