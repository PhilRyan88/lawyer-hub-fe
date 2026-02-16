import { api } from "@/store/api";

export const calendarApi = api.injectEndpoints({
    endpoints: (builder) => ({
      getCalendarEvents: builder.query({
        query: ({ startDate, endDate }) => `/cases/calendar?startDate=${startDate}&endDate=${endDate}`,
        providesTags: ["Cases"],
      }),
    }),
});

export const { 
    useGetCalendarEventsQuery
} = calendarApi;
