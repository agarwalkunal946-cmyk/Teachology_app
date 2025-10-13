import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { askClassRoomEndpoint, apiUrl } from "../config/config"; // Assuming config file for base URL
import api from "../utils/apiLogger";

export const teachers = ["Nanami", "Naoki"];

export const askQuestionaire = createAsyncThunk(
  "aiTeacher/ask",
  async (question, { dispatch }) => {
    const formDataToSend = new FormData();
    formDataToSend.append("question", question);
    const response = await api.post(
      `${apiUrl}${askClassRoomEndpoint}`,
      formDataToSend,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    const message = { question, id: Date.now(), answer: response.data };
    return message;
  }
);

export const playMessage = createAsyncThunk(
  "aiTeacher/play",
  async (message, { dispatch, getState }) => {
    return message;
  }
);

export const playStudyMaterialPage = createAsyncThunk(
  "aiTeacher/playStudyMaterial",
  async ({ pageContent, cacheKey }, { dispatch, getState }) => {}
);

const initialState = {
  messages: [],
  currentMessage: null,
  teacher: teachers[0],
  classroom: "default",
  loading: false,
  speech: "formal",
  studyMaterials: {},
  currentStudyMaterial: null,
  studyMaterialContext: null,
};

export const aiTeacherSlice = createSlice({
  name: "aiTeacher",
  initialState,
  reducers: {
    setTeacher: (state, action) => {
      state.teacher = action.payload;
    },
    setClassroom: (state, action) => {
      state.classroom = action.payload;
    },
    setSpeech: (state, action) => {
      state.speech = action.payload;
    },
    setCurrentMessage: (state, action) => {
      state.currentMessage = action.payload;
      if (action.payload) {
        state.currentStudyMaterial = null;
        state.studyMaterialContext = null;
      }
    },
    setStudyMaterial: (state, action) => {
      const { topic, material, context } = action.payload;
      state.studyMaterials[topic] = material;
      state.currentStudyMaterial = material;
      state.studyMaterialContext = context;
      state.messages = [];
      state.currentMessage = null;
    },
    setCurrentStudyMaterial: (state, action) => {
      const { material, context } = action.payload;
      state.currentStudyMaterial = material;
      state.studyMaterialContext = context;
      state.messages = [];
      state.currentMessage = null;
    },
    stopPlayback: (state) => {
      state.currentMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(askQuestionaire.pending, (state) => {
        state.loading = true;
      })
      .addCase(askQuestionaire.fulfilled, (state, action) => {
        state.messages.push(action.payload);
        state.loading = false;
        state.currentStudyMaterial = null;
        state.studyMaterialContext = null;
      })
      .addCase(askQuestionaire.rejected, (state) => {
        state.loading = false;
      })
      .addCase(playMessage.fulfilled, (state, action) => {
        state.currentMessage = action.payload;
      });
  },
});

export const {
  setTeacher,
  setClassroom,
  setSpeech,
  setStudyMaterial,
  setCurrentStudyMaterial,
  setCurrentMessage,
  stopPlayback,
} = aiTeacherSlice.actions;

export default aiTeacherSlice.reducer;