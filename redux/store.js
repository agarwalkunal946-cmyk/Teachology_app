import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import AsyncStorage from '@react-native-async-storage/async-storage'; // Import AsyncStorage
import authReducer from "./authSlice";
import chatReducer from "./chatSlice";
import toolReducer from "./toolSlice";
import historyReducer from "./historySlice";
import studyPlanReducer from "./studyPlanSlice";
import aiTeacherReducer from "./aiTeacherSlice";

const authPersistConfig = { key: "auth", storage: AsyncStorage };
const chatPersistConfig = { key: "chat", storage: AsyncStorage };
const aiTeacherPersistConfig = { key: "aiTeacher", storage: AsyncStorage };
const studyPlanPersistConfig = { key: "studyPlan", storage: AsyncStorage };

const persistedAuthReducer = persistReducer(authPersistConfig, authReducer);
const persistedChatReducer = persistReducer(chatPersistConfig, chatReducer);
const persistedAiTeacherReducer = persistReducer(
  aiTeacherPersistConfig,
  aiTeacherReducer
);
const persistedStudyPlanReducer = persistReducer(
  studyPlanPersistConfig,
  studyPlanReducer
);

const rootReducer = combineReducers({
  auth: persistedAuthReducer,
  chat: persistedChatReducer,
  tool: toolReducer,
  history: historyReducer,
  studyPlan: persistedStudyPlanReducer,
  aiTeacher: persistedAiTeacherReducer,
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }),
});

export const persistor = persistStore(store);