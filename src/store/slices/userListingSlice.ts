import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  page: 1,
  limit: 20,
};

const userListingSlice = createSlice({
  name: "userListing",
  initialState,
  reducers: {
    setPage: (state, action) => {
      state.page = action.payload;
    },
    setLimit: (state, action) => {
      state.limit = action.payload;
      state.page = 1;
    },
  },
});

export const { setPage, setLimit } = userListingSlice.actions;
export default userListingSlice.reducer;
