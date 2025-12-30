import { baseUserApi } from "./baseUserApi";

// Types
export interface LegalDocument {
  documentType: string;
  pdfUrl: string;
  fileName: string;
  fileSize: number;
  version: number;
  updatedAt: string;
  updatedBy?: string;
}

export interface LegalDocumentsResponse {
  [key: string]: LegalDocument;
}

export const legalApi = baseUserApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all legal documents
    getLegalDocuments: builder.query<LegalDocumentsResponse, void>({
      query: () => "/legal/documents",
      transformResponse: (response: { data: LegalDocumentsResponse }) =>
        response.data,
      providesTags: ["LegalDocuments"],
    }),

    // Upload document (PDF)
    uploadLegalDocument: builder.mutation<{ message: string }, FormData>({
      query: (formData) => ({
        url: "/legal/upload",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["LegalDocuments"],
    }),

    // Delete document
    deleteLegalDocument: builder.mutation<{ message: string }, string>({
      query: (documentType) => ({
        url: `/legal/documents/${documentType}`,
        method: "DELETE",
      }),
      invalidatesTags: ["LegalDocuments"],
    }),

    // Get public document (for website)
    getPublicDocument: builder.query<LegalDocument, string>({
      query: (documentType) => `/legal/public/${documentType}`,
      transformResponse: (response: { data: LegalDocument }) => response.data,
    }),
  }),
});

export const {
  useGetLegalDocumentsQuery,
  useUploadLegalDocumentMutation,
  useDeleteLegalDocumentMutation,
  useGetPublicDocumentQuery,
} = legalApi;
