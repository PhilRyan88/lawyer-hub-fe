import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  page: 1,
  limit: 20,
  filters: {
    search: "",
    courtName: "",
    startDate: null,
    endDate: null,
  },
};

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {
    setPage: (state, action) => {
      state.page = action.payload;
    },
    setLimit: (state, action) => {
      state.limit = action.payload;
      state.page = 1; // Reset to page 1 when limit changes
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
      state.page = 1; // Reset to page 1 when filters change
    },
    resetFilters: (state) => {
      state.filters = initialState.filters;
      state.page = 1;
    },
  },
});

export const { setPage, setLimit, setFilters, resetFilters } = dashboardSlice.actions;
export default dashboardSlice.reducer;
