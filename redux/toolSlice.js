import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  formData: {
    "Rubric Generator": {},
    "Writing Feedback": {},
    "Text Dependent Questions": {},
    "Summarize Text": {},
    "Song Generator": {},
    "YouTube Video Summarizer": {},
    "Text Translator": {},
  },
  currentTool: null,
};

export const toolSlice = createSlice({
  name: "tool",
  initialState,
  reducers: {
    setCurrentTool: (state, action) => {
      state.currentTool = action.payload;
    },
    updateFormData: (state, action) => {
      const tool = state.currentTool;
      if (tool) {
        state.formData[tool] = {
          ...state.formData[tool],
          [action.payload.name]: action.payload.value,
        };
      }
    },
    clearFormData: (state, action) => {
      const tool = action.payload;
      if (tool && state.formData[tool]) {
        state.formData[tool] = {};
      }
    },
    clearAllFormData: (state) => {
      Object.keys(state.formData).forEach((tool) => {
        state.formData[tool] = {};
      });
    },
  },
});

export const {
  updateFormData,
  clearFormData,
  setCurrentTool,
  clearAllFormData,
} = toolSlice.actions;

export const selectCurrentToolFormData = (state) => {
  const tool = state.tool.currentTool;
  return tool ? state.tool.formData[tool] : {};
};

export default toolSlice.reducer;