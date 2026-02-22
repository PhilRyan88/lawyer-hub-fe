import { api } from "@/store/api";

export const missedDateApi = api.injectEndpoints({
    endpoints: (builder) => ({
      getMissedDates: builder.query({
        query: ({ page, limit }: { page: number; limit: number }) => `/cases/missed?page=${page}&limit=${limit}`,
        providesTags: ["Cases"],
      }),
      markMissedAsDone: builder.mutation({
        query: (id: string) => ({
            url: `/cases/${id}/missed-done`,
            method: 'PATCH'
        }),
        invalidatesTags: ["Cases"]
      })
    }),
});

export const { 
    useGetMissedDatesQuery,
    useMarkMissedAsDoneMutation
} = missedDateApi;
