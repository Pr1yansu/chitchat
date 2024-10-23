import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { userApi } from "./api/users/user";
import contactModalReducer from "./slices/add-contact-modal";
import groupModalReducer from "./slices/add-group-modal";
import chatReducer from "./slices/chat";
import onlineStatusReducer from "./slices/status";
import typingStatusReducer from "./slices/typing";
import detailsModalReducer from "./slices/open-contact-modal";
import confirmReducer from "./slices/confirm-slice";
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import storage from "redux-persist/lib/storage";
import { chatApi } from "./api/chat/chat";
import { dashboardApi } from "./api/dashboard/dashboard";

const rootReducer = combineReducers({
  [userApi.reducerPath]: userApi.reducer,
  [chatApi.reducerPath]: chatApi.reducer,
  [dashboardApi.reducerPath]: dashboardApi.reducer,
  contactModal: contactModalReducer,
  groupModal: groupModalReducer,
  detailsModal: detailsModalReducer,
  onlineStatus: onlineStatusReducer,
  typingStatus: typingStatusReducer,
  confirm: confirmReducer,
  chat: chatReducer,
});

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["user"],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    })
      .concat(userApi.middleware)
      .concat(chatApi.middleware)
      .concat(dashboardApi.middleware),
});

export const persistor = persistStore(store);

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
