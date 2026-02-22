import { api } from "@/store/api";

export const dashboardApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getCases: builder.query({
      query: (params) => ({
        url: "/cases",
        params,
      }),
      providesTags: ["Cases"],
    }),
    getAllCasesList: builder.query({
        query: () => "/cases/list",
        providesTags: ["Cases"],
    }),
    getCase: builder.query({
        query: (id) => `/cases/${id}`,
        providesTags: (_result, _error, id) => [{ type: "Cases", id }],
    }),
    addCase: builder.mutation({
      query: (data) => ({
        url: "/cases",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Cases"],
    }),
    updateCase: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/cases/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Cases"],
    }),
    deleteCase: builder.mutation({
      query: (id) => ({
        url: `/cases/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Cases"],
    }),
    toggleStarCase: builder.mutation({
      query: (id) => ({
        url: `/cases/${id}/star`,
        method: "PATCH",
      }),
      invalidatesTags: ["Cases"],
    }),
    
    // --- Courts ---
    getCourts: builder.query({
      query: () => "/courts",
      providesTags: ["Courts"],
    }),
    addCourt: builder.mutation({
      query: (data) => ({ url: "/courts", method: "POST", body: data }),
      invalidatesTags: ["Courts"],
    }),
    updateCourt: builder.mutation({
        query: ({ id, ...data }) => ({ url: `/courts/${id}`, method: "PUT", body: data }),
        invalidatesTags: ["Courts"],
    }),
    deleteCourt: builder.mutation({
        query: (id) => ({ url: `/courts/${id}`, method: "DELETE" }),
        invalidatesTags: ["Courts"],
    }),

    // --- Stages ---
    getStages: builder.query({
      query: () => "/stages",
      providesTags: ["Stages"],
    }),
    addStage: builder.mutation({
      query: (data) => ({ url: "/stages", method: "POST", body: data }),
      invalidatesTags: ["Stages"],
    }),
    updateStage: builder.mutation({
        query: ({ id, ...data }) => ({ url: `/stages/${id}`, method: "PUT", body: data }),
        invalidatesTags: ["Stages"],
    }),
    deleteStage: builder.mutation({
        query: (id) => ({ url: `/stages/${id}`, method: "DELETE" }),
        invalidatesTags: ["Stages"],
    }),

    // --- Case Types ---
    getCaseTypes: builder.query({
        query: () => "/caseTypes",
        providesTags: ["CaseTypes"],
    }),
    addCaseType: builder.mutation({
        query: (data) => ({ url: "/caseTypes", method: "POST", body: data }),
        invalidatesTags: ["CaseTypes"],
    }),
    updateCaseType: builder.mutation({
        query: ({ id, ...data }) => ({ url: `/caseTypes/${id}`, method: "PUT", body: data }),
        invalidatesTags: ["CaseTypes"],
    }),
    deleteCaseType: builder.mutation({
        query: (id) => ({ url: `/caseTypes/${id}`, method: "DELETE" }),
        invalidatesTags: ["CaseTypes"],
    }),

    // --- Party Roles ---
    getPartyRoles: builder.query({
        query: () => "/partyRoles",
        providesTags: ["PartyRoles"],
    }),
    addPartyRole: builder.mutation({
        query: (data) => ({ url: "/partyRoles", method: "POST", body: data }),
        invalidatesTags: ["PartyRoles"],
    }),
    updatePartyRole: builder.mutation({
        query: ({ id, ...data }) => ({ url: `/partyRoles/${id}`, method: "PUT", body: data }),
        invalidatesTags: ["PartyRoles"],
    }),
    deletePartyRole: builder.mutation({
        query: (id) => ({ url: `/partyRoles/${id}`, method: "DELETE" }),
        invalidatesTags: ["PartyRoles"],
    }),
  }),
});

export const {
  useGetCasesQuery,
  useGetAllCasesListQuery,
  useAddCaseMutation,
  useUpdateCaseMutation,
  useDeleteCaseMutation,
  useToggleStarCaseMutation,
  useGetCourtsQuery,
  useAddCourtMutation,
  useUpdateCourtMutation,
  useDeleteCourtMutation,
  useGetStagesQuery,
  useAddStageMutation,
  useUpdateStageMutation,
  useDeleteStageMutation,
  useGetCaseTypesQuery,
  useAddCaseTypeMutation,
  useUpdateCaseTypeMutation,
  useDeleteCaseTypeMutation,
  useGetPartyRolesQuery,
  useAddPartyRoleMutation,
  useUpdatePartyRoleMutation,
  useDeletePartyRoleMutation,
} = dashboardApi;
