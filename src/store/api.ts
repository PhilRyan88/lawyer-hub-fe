import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const api = createApi({
  reducerPath: 'api',
  tagTypes: ["Users", "Cases", "Courts", "Stages", "Contacts", "CaseTypes", "PartyRoles", "Documents", "DocumentTypes", "DocumentStages", "Fees"],
  baseQuery: fetchBaseQuery({
    baseUrl: '/api',
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("token");
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: (() => ({})),
});
