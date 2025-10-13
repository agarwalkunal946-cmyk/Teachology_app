import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    token: null,
    profile_image: null,
    username: null,
    user_id: null,
    email: null,
    name: null,
    phoneno: null,
  },
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.profile_image = action.payload.profile_image || null;
      state.username = action.payload.username || null;
      state.user_id = action.payload.user_id || null;
      state.email = action.payload.email || null;
      state.name = action.payload.name || null;
      state.phoneno = action.payload.phoneno || null;
    },
    clearUser: (state) => {
      state.user = null;
      state.token = null;
      state.profile_image = null;
      state.username = null;
      state.user_id = null;
      state.email = null;
      state.name = null;
      state.phoneno = null;
    },
    updateUser: (state, action) => {
      state.name =
        action.payload.name !== undefined ? action.payload.name : state.name;
      state.phoneno =
        action.payload.phoneno !== undefined
          ? action.payload.phoneno
          : state.phoneno;
      state.profile_image =
        action.payload.profile_image !== undefined
          ? action.payload.profile_image
          : state.profile_image;
    },
  },
});

export const { setUser, clearUser, updateUser } = authSlice.actions;

export default authSlice.reducer;

export const selectUserId = (state) => state.auth.user_id;
export const selectUser = (state) => state.auth;
export const selectUserEmail = (state) => state.auth.email;