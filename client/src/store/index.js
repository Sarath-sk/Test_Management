import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import projectsReducer from './slices/projectsSlice';
import testCasesReducer from './slices/testCasesSlice';
import uiReducer from './slices/uiSlice';
import testSuitesReducer from './slices/testSuiteSlice';
import userReducer from './slices/userSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    projects: projectsReducer,
    testCases: testCasesReducer,
    ui: uiReducer,
    testSuite: testSuitesReducer,
    users: userReducer
  }
});
