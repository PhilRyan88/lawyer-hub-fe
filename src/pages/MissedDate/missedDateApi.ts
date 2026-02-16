import { api } from "@/store/api";

export const missedDateApi = api.injectEndpoints({
    endpoints: (builder) => ({
      getMissedDates: builder.query({
        query: ({ page, limit }: { page: number; limit: number }) => `/cases/missed?page=${page}&limit=${limit}`,
        providesTags: ["Cases"],
      }),
    }),
});

export const { 
    useGetMissedDatesQuery
} = missedDateApi;
