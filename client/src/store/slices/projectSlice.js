import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getProjects } from '../../api/projects';

export const fetchProjects = createAsyncThunk('projects/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const res = await getProjects();
    return res.data;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

const projectSlice = createSlice({
  name: 'projects',
  initialState: { list: [], loading: false, selected: null },
  reducers: {
    setSelectedProject: (state, action) => { state.selected = action.payload; }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProjects.pending, (state) => { state.loading = true; })
      .addCase(fetchProjects.fulfilled, (state, action) => { state.loading = false; state.list = action.payload; })
      .addCase(fetchProjects.rejected, (state) => { state.loading = false; });
  }
});

export const { setSelectedProject } = projectSlice.actions;
export default projectSlice.reducer;
