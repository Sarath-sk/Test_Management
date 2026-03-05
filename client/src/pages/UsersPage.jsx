import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Shield,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import { fetchUsers,updateUser, deleteUser } from "../store/slices/userSlice";

const ROLE_COLORS = {
  admin: "bg-purple-100 text-purple-700",
  manager: "bg-blue-100 text-blue-700",
  tester: "bg-green-100 text-green-700",
};

export default function UsersPage() {
  const user = useSelector((s) => s.auth.user);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  // const [users, setUsers] = useState([]);
  const { list: users, loading } = useSelector((s) => s.users);
  // const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);

  // useEffect(() => {
  //   if (user?.role !== 'admin') { navigate('/dashboard'); return; }
  //   api.get('/users').then(r => setUsers(r.data)).finally(() => setLoading(false));
  // }, [user]);

  useEffect(() => {
    if (user?.role !== "admin") {
      navigate("/dashboard");
      return;
    }

    dispatch(fetchUsers());
  }, [user, dispatch, navigate]);

  const handleUpdate = async (id, updates) => {
  const result = await dispatch(updateUser({ id, body: updates }));

  if (result.meta.requestStatus === "fulfilled") {
    setEditing(null);
    toast.success("User updated");
  } else {
    toast.error(result.payload || "Failed");
  }
};

  const handleDelete = async (id, name) => {
  if (id === user._id) return toast.error("Can't delete yourself");

  if (!confirm(`Delete user "${name}"?`)) return;

  const result = await dispatch(deleteUser(id));

  if (result.meta.requestStatus === "fulfilled") {
    toast.success("User deleted");
  } else {
    toast.error(result.payload || "Delete failed");
  }
};

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
          <Shield className="w-5 h-5 text-purple-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">User Management</h1>
          <p className="text-slate-500 text-sm">
            {users.length} registered users
          </p>
        </div>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              {["User", "Role", "Status", "Last Login", "Actions"].map((h) => (
                <th
                  key={h}
                  className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-5 py-8 text-center text-slate-400"
                >
                  Loading users...
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u._id} className="hover:bg-slate-50 group">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-semibold text-sm">
                        {u.name?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{u.name}</p>
                        <p className="text-xs text-slate-400">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    {editing === u._id ? (
                      <select
                        defaultValue={u.role}
                        className="input text-xs py-1 w-28"
                        onChange={(e) =>
                          handleUpdate(u._id, { role: e.target.value })
                        }
                      >
                        {["admin", "manager", "tester"].map((r) => (
                          <option key={r} value={r} className="capitalize">
                            {r}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span
                        className={`badge capitalize ${ROLE_COLORS[u.role]}`}
                      >
                        {u.role}
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <button
                      onClick={() =>
                        handleUpdate(u._id, { isActive: !u.isActive })
                      }
                      className={`flex items-center gap-1.5 text-xs font-semibold ${u.isActive ? "text-emerald-600" : "text-red-500"}`}
                    >
                      {u.isActive ? (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5" />
                      )}
                      {u.isActive ? "Active" : "Inactive"}
                    </button>
                  </td>
                  <td className="px-5 py-4 text-xs text-slate-400">
                    {u.lastLogin
                      ? new Date(u.lastLogin).toLocaleDateString()
                      : "Never"}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() =>
                          setEditing(editing === u._id ? null : u._id)
                        }
                        className="w-7 h-7 flex items-center justify-center rounded hover:bg-brand-50 text-slate-400 hover:text-brand-600"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(u._id, u.name)}
                        className="w-7 h-7 flex items-center justify-center rounded hover:bg-red-50 text-slate-400 hover:text-red-500"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
