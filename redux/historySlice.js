import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  history: [],
};

export const historySlice = createSlice({
  name: "history",
  initialState,
  reducers: {
    updateHistory: (state, action) => {
      state.history = action.payload;
    },
  },
});

export const { updateHistory } = historySlice.actions;

export const selectHistory = (state) => {
  return state.history;
};

export default historySlice.reducer;