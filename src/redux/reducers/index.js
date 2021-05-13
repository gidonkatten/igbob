import { combineReducers } from "redux";
import { userReducer } from "./userReducer";
import { bondReducer } from "./bondReducer";

export default combineReducers({ userReducer, bondReducer });
