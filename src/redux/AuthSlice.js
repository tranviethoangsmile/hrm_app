import {createSlice} from '@reduxjs/toolkit';

const AuthSlice = createSlice({
  name: 'userInfo',
  initialState: {
    data: null,
  },
  reducers: {
    setAuthData(state, action) {
      state.data = action.payload;
    },
  },
});

export const {setAuthData} = AuthSlice.actions;
export default AuthSlice.reducer;
