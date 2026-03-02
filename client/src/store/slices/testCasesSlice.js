import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';

export const fetchTestCases = createAsyncThunk('testCases/fetchAll', async (params, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/testcases', { params });
    return data;
  } catch (e) { return rejectWithValue(e.response?.data?.message); }
});

export const createTestCase = createAsyncThunk('testCases/create', async (body, { rejectWithValue }) => {
  try { const { data } = await api.post('/testcases', body); return data; }
  catch (e) { return rejectWithValue(e.response?.data?.message); }
});

export const updateTestCase = createAsyncThunk('testCases/update', async ({ id, body }, { rejectWithValue }) => {
  try { const { data } = await api.put(`/testcases/${id}`, body); return data; }
  catch (e) { return rejectWithValue(e.response?.data?.message); }
});

export const deleteTestCase = createAsyncThunk('testCases/delete', async (id, { rejectWithValue }) => {
  try { await api.delete(`/testcases/${id}`); return id; }
  catch (e) { return rejectWithValue(e.response?.data?.message); }
});

const testCasesSlice = createSlice({
  name: 'testCases',
  initialState: { list: [], total: 0, loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTestCases.pending, s => { s.loading = true; })
      .addCase(fetchTestCases.fulfilled, (s, a) => { s.loading = false; s.list = a.payload.testCases; s.total = a.payload.total; })
      .addCase(fetchTestCases.rejected, (s, a) => { s.loading = false; s.error = a.payload; })
      .addCase(createTestCase.fulfilled, (s, a) => { s.list.unshift(a.payload); s.total += 1; })
      .addCase(updateTestCase.fulfilled, (s, a) => { const i = s.list.findIndex(t => t._id === a.payload._id); if (i !== -1) s.list[i] = a.payload; })
      .addCase(deleteTestCase.fulfilled, (s, a) => { s.list = s.list.filter(t => t._id !== a.payload); s.total -= 1; });
  }
});

export default testCasesSlice.reducer;
