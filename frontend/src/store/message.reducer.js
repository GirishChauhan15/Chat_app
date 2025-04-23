import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  allUsers: [],
  selectedUser: {
    userId: null,
    connectionId: null,
  },
  allMessages: [],
  onlineUserInfo: [],
  isTyping: false,
  usersMeta: {},
  page: 1,
  messageMeta: {},
  messagePage: 1,
};

export const messageReducer = createSlice({
  name: "message",
  initialState,
  reducers: {
    setAllUsers: (state, action) => {
      state.allUsers = action.payload;
    },
    setSelectedUser: (state, action) => {
      state.selectedUser = action.payload;
    },
    setAllMessages: (state, action) => {
      state.allMessages = action.payload;
    },
    setOnlineUserInfo: (state, action) => {
      state.onlineUserInfo = action.payload;
    },
    setIsTyping: (state, action) => {
      state.isTyping = action.payload;
    },
    setUsersMeta: (state, action) => {
      state.usersMeta = action.payload;
    },
    setPage: (state, action) => {
      state.page = action.payload;
    },
    setMessageMeta: (state, action) => {
      state.messageMeta = action.payload;
    },
    setMessagePage: (state, action) => {
      state.messagePage = action.payload;
    },
    reset: (state, action) => {
      (state.allUsers = []),
        (state.selectedUser = {
            userId: null,
            connectionId: null,
        }),
        (state.allMessages = []),
        (state.onlineUserInfo = []),
        (state.isTyping = false),
        (state.usersMeta = {}),
        (state.page = 1),
        (state.messageMeta = {}),
        (state.messagePage = 1);
    },
  },
});

export const {
  setAllUsers,
  setSelectedUser,
  setAllMessages,
  setOnlineUserInfo,
  setIsTyping,
  setUsersMeta,
  setPage,
  setMessageMeta,
  setMessagePage,
  reset
} = messageReducer.actions;
export default messageReducer.reducer;
