import { api } from "@/store/api";

export const caseDetailsApi = api.injectEndpoints({
    endpoints: (builder) => ({
      getCase: builder.query({
        query: (id) => `/cases/${id}`,
        providesTags: (_result, _error, id) => [{ type: "Cases", id }],
      }),
      addHearing: builder.mutation({
        query: (body) => ({
          url: "/hearings",
          method: "POST",
          body,
        }),
        invalidatesTags: ["Cases"],
      }),
      updateHearing: builder.mutation({
        query: ({ id, ...body }) => ({
          url: `/hearings/${id}`,
          method: "PUT",
          body,
        }),
        invalidatesTags: ["Cases"],
      }),
      deleteHearing: builder.mutation({
        query: (id) => ({
          url: `/hearings/${id}`,
          method: "DELETE",
        }),
        invalidatesTags: ["Cases"], 
      }),
      // Contact Endpoints
      getContacts: builder.query({
        query: (caseId) => `/contacts/${caseId}`,
        providesTags: (_result, _error, caseId) => [{ type: "Contacts", id: caseId }],
      }),
      addContact: builder.mutation({
        query: (body) => ({
          url: "/contacts",
          method: "POST",
          body,
        }),
        invalidatesTags: (_result, _error, { caseId }) => [{ type: "Contacts", id: caseId }],
      }),
      updateContact: builder.mutation({
        query: ({ id, ...body }) => ({
            url: `/contacts/${id}`,
            method: "PUT",
            body,
        }),
        invalidatesTags: ["Contacts"],
      }),
      deleteContact: builder.mutation({
        query: (id) => ({
            url: `/contacts/${id}`,
            method: "DELETE",
        }),
        invalidatesTags: ["Contacts", "Documents"],
      }),
      // Document Endpoints
      getDocuments: builder.query({
        query: (caseId) => `/documents/case/${caseId}`,
        providesTags: (_result, _error, caseId) => [{ type: "Documents", id: caseId }],
      }),
      addDocument: builder.mutation({
        query: (body) => ({
          url: "/documents",
          method: "POST",
          body,
        }),
        invalidatesTags: (_result, _error, { caseId }) => [{ type: "Documents", id: caseId }],
      }),
      updateDocument: builder.mutation({
        query: ({ id, ...body }) => ({
          url: `/documents/${id}`,
          method: "PUT",
          body,
        }),
        invalidatesTags: ["Documents"],
      }),
      deleteDocument: builder.mutation({
        query: (id) => ({
            url: `/documents/${id}`,
            method: "DELETE",
        }),
        invalidatesTags: ["Documents"],
      }),
      // Document Types
      getDocumentTypes: builder.query({
        query: () => `/document-types`,
        providesTags: ["DocumentTypes"],
      }),
      addDocumentType: builder.mutation({
        query: (body) => ({
          url: "/document-types",
          method: "POST",
          body,
        }),
        invalidatesTags: ["DocumentTypes"],
      }),
      // Document Stages
      getDocumentStages: builder.query({
        query: () => `/document-stages`,
        providesTags: ["DocumentStages"],
      }),
      addDocumentStage: builder.mutation({
        query: (body) => ({
          url: "/document-stages",
          method: "POST",
          body,
        }),
        invalidatesTags: ["DocumentStages"],
      }),
      deleteDocumentStage: builder.mutation({
        query: (id) => ({
          url: `/document-stages/${id}`,
          method: "DELETE",
        }),
        invalidatesTags: ["DocumentStages"],
      }),
      // Fee Endpoints
      getFee: builder.query({
        query: (caseId) => `/fees/${caseId}`,
        providesTags: (_result, _error, caseId) => [{ type: "Fees", id: caseId }],
      }),
      addOrUpdateFee: builder.mutation({
        query: (body) => ({
          url: "/fees",
          method: "POST",
          body,
        }),
        invalidatesTags: (_result, _error, { caseId }) => [{ type: "Fees", id: caseId }],
      }),
      deletePayment: builder.mutation({
        query: ({ caseId, paymentId }) => ({
          url: `/fees/${caseId}/${paymentId}`,
          method: "DELETE",
        }),
        invalidatesTags: (_result, _error, { caseId }) => [{ type: "Fees", id: caseId }],
      }),
    }),
});

export const { 
    useGetCaseQuery, 
    useAddHearingMutation, 
    useUpdateHearingMutation, 
    useDeleteHearingMutation,
    useGetContactsQuery,
    useAddContactMutation,
    useUpdateContactMutation,
    useDeleteContactMutation,
    useGetDocumentsQuery,
    useAddDocumentMutation,
    useUpdateDocumentMutation,
    useDeleteDocumentMutation,
    useGetDocumentTypesQuery,
    useAddDocumentTypeMutation,
    useGetDocumentStagesQuery,
    useAddDocumentStageMutation,
    useDeleteDocumentStageMutation,
    useGetFeeQuery,
    useAddOrUpdateFeeMutation,
    useDeletePaymentMutation
} = caseDetailsApi;
