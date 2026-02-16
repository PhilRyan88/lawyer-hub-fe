import { api } from "@/store/api";

export const usersApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query({
      query: () => "/users",
      providesTags: ["Users"],
    }),
    addUser: builder.mutation({
      query: (userData) => ({
        url: "/users",
        method: "POST",
        body: userData,
      }),
      invalidatesTags: ["Users"],
    }),
    updateUser: builder.mutation({
      query: ({ id, ...userData }) => ({
        url: `/users/${id}`,
        method: "PUT",
        body: userData,
      }),
      invalidatesTags: ["Users"],
    }),
    deleteUser: builder.mutation({
      query: (id) => ({
        url: `/users/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Users"],
    }),
    toggleUserAccess: builder.mutation({
        query: (id) => ({
            url: `/users/${id}/toggle`, // We verified this route exists in user.routes.js
            method: "PATCH"
        }),
        invalidatesTags: ["Users"]
    })
  }),
});

export const {
  useGetUsersQuery,
  useAddUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useToggleUserAccessMutation
} = usersApi;
