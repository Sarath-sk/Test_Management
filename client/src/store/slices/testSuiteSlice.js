import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';

// 🔹 Fetch Suites
export const fetchSuites = createAsyncThunk(
  'testSuites/fetchAll',
  async (projectId, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/suites', { params: { projectId } });
      return data;   // assuming backend returns array
    } catch (e) {
      return rejectWithValue(e.response?.data?.message);
    }
  }
);

// 🔹 Create Suite
export const createSuite = createAsyncThunk(
  'testSuites/create',
  async (body, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/suites', body);
      return data;
    } catch (e) {
      return rejectWithValue(e.response?.data?.message);
    }
  }
);

// 🔹 Update Suite
export const updateSuite = createAsyncThunk(
  'testSuites/update',
  async ({ id, body }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/suites/${id}`, body);
      return data;
    } catch (e) {
      return rejectWithValue(e.response?.data?.message);
    }
  }
);

// 🔹 Delete Suite
export const deleteSuite = createAsyncThunk(
  'testSuites/delete',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/suites/${id}`);
      return id;
    } catch (e) {
      return rejectWithValue(e.response?.data?.message);
    }
  }
);

const testSuitesSlice = createSlice({
  name: 'testSuites',
  initialState: {
    list: [],
    total: 0,
    loading: false,
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // 🔹 Fetch
      .addCase(fetchSuites.pending, (s) => {
        s.loading = true;
      })
      .addCase(fetchSuites.fulfilled, (s, a) => {
        s.loading = false;
        s.list = a.payload;
        s.total = a.payload.length;
      })
      .addCase(fetchSuites.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload;
      })

      // 🔹 Create
      .addCase(createSuite.fulfilled, (s, a) => {
        s.list.push(a.payload);
        s.total += 1;
      })

      // 🔹 Update
      .addCase(updateSuite.fulfilled, (s, a) => {
        const index = s.list.findIndex(su => su._id === a.payload._id);
        if (index !== -1) {
          s.list[index] = a.payload;
        }
      })

      // 🔹 Delete
      .addCase(deleteSuite.fulfilled, (s, a) => {
        s.list = s.list.filter(su => su._id !== a.payload);
        s.total -= 1;
      });
  }
});

export default testSuitesSlice.reducer;