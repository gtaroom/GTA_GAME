import { createSlice } from "@reduxjs/toolkit";
import { User } from "../../types/admin/UserTypes";

interface AuthSliceTypes {
  isLoggedIn: boolean;
  userDetails: User | null;
}
const initialState: AuthSliceTypes = {
  isLoggedIn: false,
  userDetails: null,
};

const AuthSlice = createSlice({
  name: "authSlice",
  initialState,
  reducers: {
    userData(state, { payload }) {
      state.isLoggedIn = true;
      state.userDetails = payload;
    },
    logOut() {
      return {...initialState};
    },
  },
});

export const { userData, logOut} = AuthSlice.actions;
export default AuthSlice.reducer  ;
