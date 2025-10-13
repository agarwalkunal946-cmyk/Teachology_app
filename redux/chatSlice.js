import { createSlice, nanoid } from "@reduxjs/toolkit";

const initialState = {
  chats: [],
  currentChatId: null,
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    initializeChat: (state) => {
      if (state.chats.length === 0) {
        const initialChatId = nanoid();
        state.chats = [{ id: initialChatId, name: "Chat 1", messages: [] }];
        state.currentChatId = initialChatId;
      }
    },
    addChat: (state) => {
      const newChatId = nanoid();
      const newChatNumber = state.chats.length + 1;
      state.chats.push({
        id: newChatId,
        name: `Chat ${newChatNumber}`,
        messages: [],
      });
      state.currentChatId = newChatId;
    },
    setCurrentChat: (state, action) => {
      state.currentChatId = action.payload;
    },
    addMessage: (state, action) => {
      const { chatId, message, type, isLoading = false } = action.payload;
      const chat = state.chats.find((chat) => chat.id === chatId);
      if (chat) {
        chat.messages.push({
          text: message,
          type: type,
          isLoading: isLoading,
        });
      }
    },
    updateLastBotMessage: (state, action) => {
      const { chatId, newMessage, isLoading } = action.payload;
      const chat = state.chats.find((chat) => chat.id === chatId);
      if (chat && chat.messages.length > 0) {
        const lastMessage = chat.messages[chat.messages.length - 1];
        lastMessage.text = newMessage;
        if (isLoading !== undefined) {
          lastMessage.isLoading = isLoading;
        }
      }
    },
    deleteChat: (state, action) => {
      const chatIdToDelete = action.payload;
      state.chats = state.chats.filter((chat) => chat.id !== chatIdToDelete);
      if (state.currentChatId === chatIdToDelete) {
        if (state.chats.length > 0) {
          state.currentChatId = state.chats[0].id;
        } else {
          const newChatId = nanoid();
          state.chats.push({ id: newChatId, name: "Chat 1", messages: [] });
          state.currentChatId = newChatId;
        }
      }
    },
    clearChat: (state, action) => {
      const chatIdToClear = action.payload;
      const chat = state.chats.find((chat) => chat.id === chatIdToClear);
      if (chat) {
        chat.messages = [];
      }
    },
    reorderChatNumbers: (state) => {
      state.chats.forEach((chat, index) => {
        chat.name = `Chat ${index + 1}`;
      });
    },
  },
});

export const {
  initializeChat,
  addChat,
  setCurrentChat,
  addMessage,
  updateLastBotMessage,
  deleteChat,
  clearChat,
  reorderChatNumbers,
} = chatSlice.actions;

export const selectChats = (state) => state.chat.chats;
export const selectCurrentChatId = (state) => state.chat.currentChatId;
export const selectCurrentChat = (state) => {
  if (!state.chat.currentChatId) return null;
  return state.chat.chats.find((chat) => chat.id === state.chat.currentChatId);
};

export default chatSlice.reducer;