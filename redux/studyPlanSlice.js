import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  currentPlan: null,
  quizQuestionsByDay: {},
  studyMaterialsByTopic: {},
  doubtHistoryByTopic: {},
};

export const studyPlanSlice = createSlice({
  name: "studyPlan",
  initialState,
  reducers: {
    setStudyPlan: (state, action) => {
      if (state.currentPlan?._id !== action.payload?._id) {
        state.currentPlan = action.payload;

        state.quizQuestionsByDay = {};
        state.studyMaterialsByTopic = {};
      } else {
        state.currentPlan = action.payload;
      }
    },
    completeDay: (state, action) => {
      if (!state.currentPlan) return;
      const { day_number } = action.payload;
      const topicIndex = state.currentPlan.daily_topics.findIndex(
        (topic) => topic.day_number === day_number
      );

      if (topicIndex !== -1) {
        state.currentPlan.daily_topics[topicIndex].status = "completed";
      }
    },

    setStudyMaterial: (state, action) => {
      const { topicDescription, content } = action.payload;
      state.studyMaterialsByTopic[topicDescription] = content;
    },
    setDoubtMessages: (state, action) => {
      const { topic, messages } = action.payload;
      state.doubtHistoryByTopic[topic] = messages;
    },
  },
});

export const { setStudyPlan, completeDay, setStudyMaterial, setDoubtMessages } =
  studyPlanSlice.actions;
export const selectDoubtHistoryByTopic = (state) =>
  state.studyPlan.doubtHistoryByTopic;
export default studyPlanSlice.reducer;