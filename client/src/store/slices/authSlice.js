import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';

export const login = createAsyncThunk('auth/login', async (creds, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/auth/login', creds);
    localStorage.setItem('tf_token', data.token);
    return data;
  } catch (e) { return rejectWithValue(e.response?.data?.message || 'Login failed'); }
});

export const register = createAsyncThunk('auth/register', async (creds, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/auth/register', creds);
    localStorage.setItem('tf_token', data.token);
    return data;
  } catch (e) { return rejectWithValue(e.response?.data?.message || 'Registration failed'); }
});

export const fetchMe = createAsyncThunk('auth/fetchMe', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/auth/me');
    return data;
  } catch (e) { return rejectWithValue(e.response?.data?.message); }
});

const authSlice = createSlice({
  name: 'auth',
  initialState: { user: null, token: localStorage.getItem('tf_token'), loading: false, error: null },
  reducers: {
    logout: (state) => {
      state.user = null; state.token = null;
      localStorage.removeItem('tf_token');
    },
    clearError: (state) => { state.error = null; }
  },
  extraReducers: (builder) => {
    const handle = (thunk) => {
      builder.addCase(thunk.pending, s => { s.loading = true; s.error = null; });
      builder.addCase(thunk.fulfilled, (s, a) => { s.loading = false; s.user = a.payload.user || a.payload; s.token = a.payload.token || s.token; });
      builder.addCase(thunk.rejected, (s, a) => { s.loading = false; s.error = a.payload; });
    };
    handle(login); handle(register); handle(fetchMe);
  }
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
