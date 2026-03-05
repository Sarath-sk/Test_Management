import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchTestCases, deleteTestCase, deleteAllTestcase } from "../store/slices/testCasesSlice";
import { fetchProjectById } from "../store/slices/projectsSlice";
import api from "../api/axios";
import {
  Plus,
  Upload,
  Play,
  ChevronRight,
  Folder,
  FolderOpen,
  Filter,
  Download,
  Trash2,
  Edit,
  Search,
} from "lucide-react";
import toast from "react-hot-toast";
import clsx from "clsx";
import { createSuite, deleteSuite, fetchSuites, updateSuite } from "../store/slices/testSuiteSlice";
import { createAsyncThunk } from "@reduxjs/toolkit";

function SuiteTree({ suites, selected, onSelect, projectId, user, handleDeleteSuite, level = 0}) {
  const dispatch = useDispatch();
  const [expanded, setExpanded] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState("");
  const roots = suites.filter((s) => !s.parentSuite);
  const children = (parentId) =>
    suites.filter((s) => s.parentSuite === parentId);

  const renderSuite = (suite) => {
    const kids = children(suite._id);
    const isExp = expanded[suite._id];
    const isSelected = selected === suite._id;

    return (
      <div key={suite._id}>
        <div
          onClick={() => {
            onSelect(suite._id);
            if (kids.length)
              setExpanded((e) => ({ ...e, [suite._id]: !e[suite._id] }));
          }}
          className={clsx(
            "flex items-center justify-between gap-2 px-3 py-2 rounded-lg cursor-pointer text-sm transition-colors",
            isSelected
              ? "bg-brand-50 text-brand-700 font-medium"
              : "text-slate-600 hover:bg-slate-50",
          )}
        >
          <div className="flex items-center gap-3 text-center">
            <span style={{ marginLeft: level * 12 }} />
            {kids.length ? (
              isExp ? (
                <FolderOpen className="w-4 h-4 shrink-0" />
              ) : (
                <Folder className="w-4 h-4 shrink-0" />
              )
            ) : (
              <Folder className="w-4 h-4 shrink-0 opacity-40" />
            )}
            {editingId === suite._id ?(
              <input type="text"
                value={editValue}
                autoFocus
                onChange={(e)=>setEditValue(e.target.value)}
                onClick={(e)=>e.stopPropagation()}
                onKeyDown={async (e)=>{
                  if(e.key === "Enter"){
                    await dispatch(updateSuite({
                      id: suite._id,
                      body: {name: editValue}
                    })
                  );
                  setEditingId(null);
                  }
                }}
                className="truncate"
              />
            ):(
              <span className="truncate">{suite.name}</span>
            )}
          </div>
          <div className="flex items-center">
            <button className="w-7 h-7 flex items-center justify-center rounded hover:bg-blue-50 text-slate-400 hover:text-blue-500" onClick={(e)=>{
              e.stopPropagation();
              setEditingId(suite._id);
              setEditValue(suite.name);
            }}>
              <Edit className="w-3.5 h-3.5" />
            </button>
            {["admin", "manager"].includes(user?.role) && (
              <button
                onClick={() =>{handleDeleteSuite(suite._id)}}
                className="w-7 h-7 flex items-center justify-center rounded hover:bg-red-50 text-slate-400 hover:text-red-500"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
        {isExp && kids.map((kid) => renderSuite(kid))}
      </div>
    );
  };

  return <div className="space-y-0.5">{roots.map(renderSuite)}</div>;
}

export default function ProjectDetail() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((s) => s.auth.user);
  const { list: testCases, loading, total } = useSelector((s) => s.testCases);

  // const [project, setProject] = useState(null);
  const { selectedProject: project } = useSelector(s => s.projects);
  const { list: suites } = useSelector((s) => s.testSuite);
  const [selectedSuite, setSelectedSuite] = useState(null);
  const [showNewSuite, setShowNewSuite] = useState(false);
  const [newSuiteName, setNewSuiteName] = useState("");
  const [filters, setFilters] = useState({
    priority: "",
    status: "",
    search: "",
  });
  const [selected, setSelected] = useState([]);
  const [isSelected, setIsSelected] = useState(false);


  useEffect(() => {
    dispatch(fetchSuites(projectId));
    dispatch(fetchProjectById(projectId));

  }, [projectId]);

  useEffect(() => {
    dispatch(
      fetchTestCases({
        projectId,
        suiteId: selectedSuite || undefined,
        ...filters,
      }),
    );
  }, [projectId, selectedSuite, filters]);


  const handleCreateSuite = async (e) =>{
    e.preventDefault();

    const result = await dispatch(
      createSuite({
        name: newSuiteName,
        project:projectId,
      })
    );
    setNewSuiteName("");
    setShowNewSuite(false);
    toast.success("Suite Created");
 
  };

  const handleDeleteSuite = async (id) => {
    if (!confirm("Delete this Suite")) return;
    await dispatch(deleteSuite(id));
    toast.success("Deleted");
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this test case?")) return;
    await dispatch(deleteTestCase(id));
    toast.success("Deleted");
  };

  const handleExport = async () => {
    const params = new URLSearchParams({
      projectId,
      ...(selectedSuite && { suiteId: selectedSuite }),
    });
    const res = await api.get(`/testcases/export/xlsx?${params}`, {
      responseType: "blob",
    });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const a = document.createElement("a");
    a.href = url;
    a.download = "testcases.xlsx";
    a.click();
    toast.success("Exported!");
  };

  const priorityBadge = (p) => <span className={`badge-${p}`}>{p}</span>;
  const statusBadge = (s) => (
    <span
      className={`badge ${s === "active" ? "bg-brand-100 text-brand-700" : s === "deprecated" ? "bg-red-100 text-red-700" : "bg-slate-100 text-slate-600"}`}
    >
      {s}
    </span>
  );

  const handleDeleteAll = async () =>{
    try{
      if(!selected.length) return;
      if(!confirm(`Delete ${selected.length} testcase? This cannot be undone!`)) return;
      const res = await dispatch(deleteAllTestcase(selected));
      toast.success(res.payload.message);
      setSelected([])
      dispatch(fetchTestCases({ projectId }));
      setIsSelected(false);
    }catch(error){
      toast.error(res.payload);
      return;
    }
  }

  return (
    <div className="flex h-full gap-0 -m-6 h-[calc(100vh-4rem)]">
      {/* Left: Suite Tree */}
      <div className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0">
        <div className="border-b border-slate-100">
          <div className="space-y-1">
            <div className="text-center p-2 border-b-2">
              <h1 className="font-bold">{project?.name}</h1>
            </div>
            <div className="flex justify-evenly items-center ">
              <h2 className="font-semibold text-slate-900 text-sm p-2">
                Test Suites
              </h2>
              {["admin", "manager"].includes(user?.role) && (
                <button
                  onClick={() => setShowNewSuite(!showNewSuite)}
                  className="w-6 h-6 flex items-center border-2 justify-center rounded-md hover:bg-brand-50 text-brand-600"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
          {showNewSuite && (
            <form onSubmit={handleCreateSuite} className="m-2 flex gap-1">
              <input
                className="input text-xs py-1"
                placeholder="Suite name..."
                value={newSuiteName}
                onChange={(e) => setNewSuiteName(e.target.value)}
                autoFocus
                required
              />
              <button type="submit" className="btn-primary py-1 px-2 text-xs">
                +
              </button>
            </form>
          )}
        </div>
        <div className="flex-1 overflow-y-auto p-3">
          <div
            onClick={() => setSelectedSuite(null)}
            className={clsx(
              "flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer text-sm mb-1 transition-colors",
              !selectedSuite
                ? "bg-brand-50 text-brand-700 font-medium"
                : "text-slate-600 hover:bg-slate-50",
            )}
          >
            <Folder className="w-4 h-4" /> All Test Cases
          </div>
          <SuiteTree
            suites={suites}
            selected={selectedSuite}
            onSelect={setSelectedSuite}
            projectId={projectId}
            user={user}
            handleDeleteSuite={handleDeleteSuite}
          />
        </div>
      </div>

      {/* Right: Test Cases */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-200 bg-white flex items-center gap-3 flex-wrap">
          <div className="flex-2x">
            <p className="text-xs text-slate-400">
              {total} test case{total !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              className="input pl-8 py-1.5 text-sm w-48"
              placeholder="Search..."
              value={filters.search}
              onChange={(e) =>
                setFilters((f) => ({ ...f, search: e.target.value }))
              }
            />
          </div>
          <select
            className="input py-1.5 text-sm w-32"
            value={filters.priority}
            onChange={(e) =>
              setFilters((f) => ({ ...f, priority: e.target.value }))
            }
          >
            <option value="">All Priority</option>
            {["low", "medium", "high", "critical"].map((p) => (
              <option key={p} value={p} className="capitalize">
                {p}
              </option>
            ))}
          </select>
          <select
            className="input py-1.5 text-sm w-32"
            value={filters.status}
            onChange={(e) =>
              setFilters((f) => ({ ...f, status: e.target.value }))
            }
          >
            <option value="">All Status</option>
            {["draft", "active", "deprecated"].map((s) => (
              <option key={s} value={s} className="capitalize">
                {s}
              </option>
            ))}
          </select>
          <button onClick={handleExport} className="btn-ghost py-1.5 text-sm">
            <Download className="w-3.5 h-3.5" /> Export
          </button>
          <Link
            to={`/projects/${projectId}/import`}
            className="btn-ghost py-1.5 text-sm"
          >
            <Upload className="w-3.5 h-3.5" /> Import
          </Link>
          <Link
            to={`/projects/${projectId}/runs`}
            className="btn-ghost py-1.5 text-sm"
          >
            <Play className="w-3.5 h-3.5" /> Runs
          </Link>
          {selectedSuite && (
            <Link
              to={`/projects/${projectId}/testcases/new?suiteId=${selectedSuite}`}
              className="btn-primary py-1.5 text-sm"
            >
              <Plus className="w-3.5 h-3.5" /> Add Test
            </Link>
          )}
          {isSelected && (<button className=" bg-red-500 text-white hover:bg-red-500 btn-ghost py-1.5 text-sm" onClick={handleDeleteAll}>
            <Trash2 className="w-3.5 h-3.5" />
            Delete All
            </button>)}
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto">
          {loading ? (
            <div className="flex items-center justify-center h-40 text-slate-400">
              Loading...
            </div>
          ) : testCases.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 gap-2">
              <p className="text-slate-500 font-medium">No test cases yet</p>
              {selectedSuite && (
                <Link
                  to={`/projects/${projectId}/testcases/new?suiteId=${selectedSuite}`}
                  className="btn-primary text-sm"
                >
                  Add your first test case
                </Link>
              )}
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide w-8">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) =>{
                        setIsSelected(prev => !prev);
                        setSelected(
                          e.target.checked ? testCases.map((t) => t._id) : [],
                        );
                      }}
                    />
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Title
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide w-24">
                    Priority
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide w-24">
                    Status
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide w-28">
                    Last Run
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide w-24">
                    Suite
                  </th>
                  <th className="w-20"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {testCases.map((tc) => (
                  <tr key={tc._id} className="hover:bg-slate-50 group">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selected.includes(tc._id)}
                        onChange={(e) =>
                          setSelected((prev) =>
                            e.target.checked
                              ? [...prev, tc._id]
                              : prev.filter((id) => id !== tc._id),
                          )
                        }
                      />
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-900">{tc.title}</p>
                      {tc.tags?.length > 0 && (
                        <div className="flex gap-1 mt-1">
                          {tc.tags.slice(0, 3).map((t) => (
                            <span
                              key={t}
                              className="bg-slate-100 text-slate-500 text-xs px-1.5 py-0.5 rounded"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">{priorityBadge(tc.priority)}</td>
                    <td className="px-4 py-3">{statusBadge(tc.status)}</td>
                    <td className="px-4 py-3">
                      {tc.lastExecutionStatus ? (
                        <span className={`badge-${tc.lastExecutionStatus}`}>
                          {tc.lastExecutionStatus}
                        </span>
                      ) : (
                        <span className="text-slate-300 text-xs">–</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-400">
                      {tc.suite?.name}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link
                          to={`/projects/${projectId}/testcases/${tc._id}/edit`}
                          className="w-7 h-7 flex items-center justify-center rounded hover:bg-brand-50 text-slate-400 hover:text-brand-600"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </Link>
                        {["admin", "manager"].includes(user?.role) && (
                          <button
                            onClick={() => handleDelete(tc._id)}
                            className="w-7 h-7 flex items-center justify-center rounded hover:bg-red-50 text-slate-400 hover:text-red-500"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
