import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axios";

/* =========================
   FETCH USERS
========================= */
export const fetchUsers = createAsyncThunk(
  "users/fetchUsers",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/users");
      return data;
    } catch (e) {
      return rejectWithValue(e.response?.data?.message);
    }
  }
);

/* =========================
   UPDATE USER
========================= */
export const updateUser = createAsyncThunk(
  "users/updateUser",
  async ({ id, body }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/users/${id}`, body);
      return data;
    } catch (e) {
      return rejectWithValue(e.response?.data?.message);
    }
  }
);

/* =========================
   DELETE USER
========================= */
export const deleteUser = createAsyncThunk(
  "users/deleteUser",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/users/${id}`);
      return id;
    } catch (e) {
      return rejectWithValue(e.response?.data?.message);
    }
  }
);

/* =========================
   SLICE
========================= */

const usersSlice = createSlice({
  name: "users",
  initialState: {
    list: [],
    loading: false,
    error: null,
  },
  reducers: {},

  extraReducers: (builder) => {
    builder

      /* FETCH USERS */
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
      })

      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })

      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* UPDATE USER */
      .addCase(updateUser.fulfilled, (state, action) => {
        const index = state.list.findIndex(
          (u) => u._id === action.payload._id
        );

        if (index !== -1) {
          state.list[index] = action.payload;
        }
      })

      /* DELETE USER */
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.list = state.list.filter((u) => u._id !== action.payload);
      });
  },
});

export default usersSlice.reducer;