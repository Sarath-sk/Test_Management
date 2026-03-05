import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';

export const fetchProjects = createAsyncThunk('projects/fetchAll', async (_, { rejectWithValue }) => {
  try { const { data } = await api.get('/projects'); return data; }
  catch (e) { return rejectWithValue(e.response?.data?.message); }
});

export const fetchProjectById = createAsyncThunk('projects/:id', async (id, { rejectWithValue}) =>{
  try{ const {data} = await api.get(`/projects/${id}`); return data;}
    catch(e){return rejectWithValue(e.response?.data?.message);}
});

export const createProject = createAsyncThunk('projects/create', async (body, { rejectWithValue }) => {
  try { const { data } = await api.post('/projects', body); return data; }
  catch (e) { return rejectWithValue(e.response?.data?.message); }
});

export const updateProject = createAsyncThunk('projects/update', async ({ id, body }, { rejectWithValue }) => {
  try { const { data } = await api.put(`/projects/${id}`, body); return data; }
  catch (e) { return rejectWithValue(e.response?.data?.message); }
});

export const deleteProject = createAsyncThunk('projects/delete', async (id, { rejectWithValue }) => {
  try { await api.delete(`/projects/${id}`); return id; }
  catch (e) { return rejectWithValue(e.response?.data?.message); }
});

const projectsSlice = createSlice({
  name: 'projects',
  initialState: { list: [], loading: false, error: null, selected: null },
  reducers: {
    setSelectedProject: (state, action) => { state.selected = action.payload; }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProjects.pending, s => { s.loading = true; })
      .addCase(fetchProjects.fulfilled, (s, a) => { s.loading = false; s.list = a.payload; })
      .addCase(fetchProjects.rejected, (s, a) => { s.loading = false; s.error = a.payload; })
      .addCase(fetchProjectById.pending, (s) => { s.loading = true; })
      .addCase(fetchProjectById.fulfilled, (s, a) => { s.loading = false; s.selectedProject = a.payload;})
      .addCase(fetchProjectById.rejected, (s, a) => { s.loading = false; s.error = a.payload;})
      .addCase(createProject.fulfilled, (s, a) => { s.list.unshift(a.payload); })
      .addCase(updateProject.fulfilled, (s, a) => { const i = s.list.findIndex(p => p._id === a.payload._id); if (i !== -1) s.list[i] = a.payload; })
      .addCase(deleteProject.fulfilled, (s, a) => { s.list = s.list.filter(p => p._id !== a.payload); });
  }
});

export const { setSelectedProject } = projectsSlice.actions;
export default projectsSlice.reducer;
