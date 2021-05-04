import { combineReducers } from "redux";
import { userReducer } from "./user";
import { bondReducer } from "./bond";

export default combineReducers({ userReducer, bondReducer });
