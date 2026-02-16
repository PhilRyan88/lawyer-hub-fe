import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  page: 1,
  limit: 20,
};

const missedDateSlice = createSlice({
  name: "missedDate",
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

export const { setPage, setLimit } = missedDateSlice.actions;
export default missedDateSlice.reducer;
