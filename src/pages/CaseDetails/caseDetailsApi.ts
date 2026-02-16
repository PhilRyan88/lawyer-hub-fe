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
      deleteContact: builder.mutation({
        query: (id) => ({
            url: `/contacts/${id}`,
            method: "DELETE",
        }),
        invalidatesTags: ["Contacts"],
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
    useDeleteContactMutation
} = caseDetailsApi;
