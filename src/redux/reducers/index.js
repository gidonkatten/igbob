import { combineReducers } from "redux";
import { issuerReducer } from "./issuer";
import { investorReducer } from "./investor";

export default combineReducers({ issuerReducer, investorReducer });