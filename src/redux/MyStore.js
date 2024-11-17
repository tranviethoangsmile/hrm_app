import {configureStore} from '@reduxjs/toolkit';
import AuthReducer from './AuthSlice';
const MyStore = configureStore({
  reducer: {
    auth: AuthReducer,
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      immutableCheck: false, // Tắt immutable check
    }),
});
export default MyStore;
