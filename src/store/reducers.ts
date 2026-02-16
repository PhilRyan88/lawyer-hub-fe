import { combineReducers } from '@reduxjs/toolkit';
import { api } from './api';
import dashboardReducer from './slices/dashboardSlice';
import userListingReducer from './slices/userListingSlice';
import missedDateReducer from './slices/missedDateSlice';

const rootReducer = combineReducers({
  [api.reducerPath]: api.reducer,
  dashboard: dashboardReducer,
  userListing: userListingReducer,
  missedDate: missedDateReducer,
});

export default rootReducer;
