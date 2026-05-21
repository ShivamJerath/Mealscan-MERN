import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { clearUser } from "../redux/slices/userSlice.js";
import API from "../utils/axios.js";

export default function ContractorDashboard() {
  const { user } = useSelector((s) => s.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [students, setStudents] = useState([]);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // Upload record form
  const [form, setForm] = useState({
    studentId: "",
    mealType: "",
    items: "",
    cost: "",
    recordDate: new Date().toISOString().split("T")[0],
  });

  // Edit student modal
  const [editStudent, setEditStudent] = useState(null);

  // Add student modal
  const [addForm, setAddForm] = useState({ name: "", email: "", password: "" });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [studentsRes, recordsRes] = await Promise.all([
        API.get("/user/students"),
        API.get("/record/contractor"),
      ]);
      setStudents(studentsRes.data.students);
      setRecords(recordsRes.data.records);
    } catch (err) {
      setError("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    dispatch(clearUser());
    navigate("/");
  };

  const handleUploadRecord = async (e) => {
    e.preventDefault();
    setError(""); setSuccess("");
    try {
      await API.post("/record", form);
      setSuccess("Record uploaded successfully!");
      setForm({ studentId: "", mealType: "", items: "", cost: "", recordDate: new Date().toISOString().split("T")[0] });
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to upload record");
    }
  };

  const handleDeleteRecord = async (id) => {
    if (!window.confirm("Are you sure you want to delete this record?")) return;
    try {
      await API.delete(`/record/${id}`);
      setSuccess("Record deleted successfully!");
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete record");
    }
  };

  const handleDeleteStudent = async (id, name) => {
    if (!window.confirm(`Delete student ${name}? This will also delete all their records!`)) return;
    try {
      await API.delete(`/user/${id}`);
      setSuccess("Student deleted successfully!");
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete student");
    }
  };

  const handleUpdateStudent = async (e) => {
    e.preventDefault();
    try {
      await API.put(`/user/${editStudent._id}`, { name: editStudent.name, email: editStudent.email });
      setSuccess("Student updated successfully!");
      setEditStudent(null);
      fetchData();
      window.bootstrap?.Modal.getInstance(document.getElementById("editStudentModal"))?.hide();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update student");
    }
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    try {
      await API.post("/auth/register", { ...addForm, role: "STUDENT" });
      setSuccess("Student added successfully!");
      setAddForm({ name: "", email: "", password: "" });
      fetchData();
      window.bootstrap?.Modal.getInstance(document.getElementById("addStudentModal"))?.hide();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add student");
    }
  };

  const todayRecords = records.filter(
    (r) => new Date(r.recordDate).toDateString() === new Date().toDateString()
  ).length;
  const totalEarnings = records.reduce((s, r) => s + r.cost, 0);
  const monthlyEarnings = records
    .filter((r) => {
      const d = new Date(r.recordDate);
      const now = new Date();
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    })
    .reduce((s, r) => s + r.cost, 0);
  const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7);
  const weeklyEarnings = records
    .filter((r) => new Date(r.recordDate) >= weekAgo)
    .reduce((s, r) => s + r.cost, 0);

  return (
    <>
      <nav className="navbar navbar-dark navbar-contractor">
        <div className="container-fluid">
          <span className="navbar-brand mb-0 h1">
            <i className="bi bi-upc-scan"></i> MealScan - Contractor Dashboard
          </span>
          <div className="d-flex align-items-center">
            <span className="text-white me-3">
              <i className="bi bi-person-circle"></i> {user?.name}
              <span className="badge bg-light text-dark ms-2">{user?.role}</span>
            </span>
            <button className="btn btn-outline-light" onClick={handleLogout}>
              <i className="bi bi-box-arrow-right"></i> Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="container-fluid mt-4">
        {error && <div className="alert alert-danger alert-dismissible"><i className="bi bi-exclamation-circle me-2"></i>{error}<button className="btn-close" onClick={() => setError("")}></button></div>}
        {success && <div className="alert alert-success alert-dismissible"><i className="bi bi-check-circle me-2"></i>{success}<button className="btn-close" onClick={() => setSuccess("")}></button></div>}

        {loading ? (
          <div className="text-center py-5"><div className="spinner-border text-success" /></div>
        ) : (
          <>
            {/* Revenue highlights */}
            <div className="row mb-4">
              {[
                { label: "This Month", value: `₹${monthlyEarnings.toFixed(2)}`, icon: "bi-currency-rupee", bg: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" },
                { label: "Total Earnings", value: `₹${totalEarnings.toFixed(2)}`, icon: "bi-graph-up", bg: "linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)" },
                { label: "Active Students", value: students.length, icon: "bi-people", bg: "linear-gradient(135deg, #a8e6cf 0%, #3fada8 100%)" },
                { label: "Today's Records", value: todayRecords, icon: "bi-clock", bg: "linear-gradient(135deg, #ffd93d 0%, #ff6b6b 100%)" },
              ].map((item, i) => (
                <div key={i} className="col-md-3">
                  <div className="revenue-highlight" style={{ background: item.bg }}>
                    <i className={`bi ${item.icon}`}></i>
                    <div className="revenue-value">{item.value}</div>
                    <div className="revenue-label">{item.label}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Stats row */}
            <div className="row mb-4">
              {[
                { label: "Total Students", value: students.length },
                { label: "My Records", value: records.length },
                { label: "Today's Records", value: todayRecords },
                { label: "This Week", value: `₹${weeklyEarnings.toFixed(2)}` },
              ].map((item, i) => (
                <div key={i} className="col-md-3">
                  <div className="stat-card" style={{ borderLeft: "4px solid #28a745", padding: "1.5rem" }}>
                    <div className="stat-value-green">{item.value}</div>
                    <div className="text-muted" style={{ fontSize: "1rem", marginTop: "0.25rem" }}>{item.label}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="row">
              {/* Left: Upload form + Quick Actions */}
              <div className="col-lg-4">
                <div className="card">
                  <div className="card-header-green">
                    <h5 className="mb-0"><i className="bi bi-plus-circle"></i> Upload Record</h5>
                  </div>
                  <div className="card-body">
                    <form onSubmit={handleUploadRecord}>
                      <div className="mb-3">
                        <label className="form-label">Student</label>
                        <select className="form-select" name="studentId" value={form.studentId} onChange={(e) => setForm({ ...form, studentId: e.target.value })} required>
                          <option value="">Select student</option>
                          {students.map((s) => (
                            <option key={s._id} value={s._id}>{s.name} ({s.email})</option>
                          ))}
                        </select>
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Meal Type</label>
                        <input type="text" className="form-control" placeholder="e.g., Breakfast, Lunch" value={form.mealType} onChange={(e) => setForm({ ...form, mealType: e.target.value })} required />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Items</label>
                        <textarea className="form-control" rows="3" placeholder="e.g., Rice, Dal, Roti" value={form.items} onChange={(e) => setForm({ ...form, items: e.target.value })} required />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Cost (₹)</label>
                        <input type="number" className="form-control" step="0.01" min="0.01" value={form.cost} onChange={(e) => setForm({ ...form, cost: e.target.value })} required />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Date</label>
                        <input type="date" className="form-control" value={form.recordDate} onChange={(e) => setForm({ ...form, recordDate: e.target.value })} required />
                      </div>
                      <button type="submit" className="btn btn-success w-100">
                        <i className="bi bi-cloud-upload"></i> Upload Record
                      </button>
                    </form>
                  </div>
                </div>

                <div className="card mt-2">
                  <div className="card-header-green">
                    <h5 className="mb-0"><i className="bi bi-lightning"></i> Quick Actions</h5>
                  </div>
                  <div className="card-body d-grid gap-2">
                    <button className="btn btn-primary" onClick={() => navigate("/contractor-stats")}>
                      <i className="bi bi-graph-up"></i> View Performance Stats
                    </button>
                    <button className="btn btn-info text-white" onClick={fetchData}>
                      <i className="bi bi-arrow-clockwise"></i> Refresh Dashboard
                    </button>
                  </div>
                </div>
              </div>

              {/* Right: Tabs */}
              <div className="col-lg-8">
                <ul className="nav nav-tabs nav-tabs-green mb-4">
                  <li className="nav-item">
                    <button className="nav-link active" data-bs-toggle="tab" data-bs-target="#records">
                      <i className="bi bi-list-ul"></i> My Records
                    </button>
                  </li>
                  <li className="nav-item">
                    <button className="nav-link" data-bs-toggle="tab" data-bs-target="#students">
                      <i className="bi bi-people"></i> Manage Students
                    </button>
                  </li>
                  <li className="nav-item">
                    <button className="nav-link" onClick={() => navigate("/contractor-stats")}>
                      <i className="bi bi-graph-up"></i> Performance Stats
                    </button>
                  </li>
                </ul>

                <div className="tab-content">
                  {/* Records tab */}
                  <div className="tab-pane fade show active" id="records">
                    <div className="card">
                      <div className="card-header-green d-flex justify-content-between align-items-center">
                        <h5 className="mb-0"><i className="bi bi-list-ul"></i> My Records</h5>
                        <span className="badge bg-success">Total: {records.length}</span>
                      </div>
                      <div className="card-body">
                        {records.length === 0 ? (
                          <div className="empty-state">
                            <i className="bi bi-inbox"></i>
                            <h5>No Records Yet</h5>
                            <p className="text-muted">Upload your first record using the form.</p>
                          </div>
                        ) : (
                          <>
                            <div className="table-responsive">
                              <table className="table table-hover">
                                <thead className="table-light">
                                  <tr><th>Date</th><th>Student</th><th>Meal Type</th><th>Items</th><th>Cost</th><th>Actions</th></tr>
                                </thead>
                                <tbody>
                                  {records.map((r) => (
                                    <tr key={r._id}>
                                      <td>{new Date(r.recordDate).toLocaleDateString()}</td>
                                      <td><strong>{r.student?.name}</strong></td>
                                      <td><span className="badge bg-info">{r.mealType}</span></td>
                                      <td><small>{r.items}</small></td>
                                      <td className="fw-bold text-success">₹{r.cost.toFixed(2)}</td>
                                      <td>
                                        <button className="btn btn-danger btn-sm" onClick={() => handleDeleteRecord(r._id)}>
                                          <i className="bi bi-trash"></i>
                                        </button>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                            <div className="mt-3 p-3 bg-light rounded">
                              <div className="row text-center">
                                <div className="col-md-4"><h6 className="text-primary">Total Records</h6><h4 className="fw-bold">{records.length}</h4></div>
                                <div className="col-md-4"><h6 className="text-success">Total Revenue</h6><h4 className="fw-bold text-success">₹{totalEarnings.toFixed(2)}</h4></div>
                                <div className="col-md-4"><h6 className="text-info">Avg/Record</h6><h4 className="fw-bold text-info">₹{records.length > 0 ? (totalEarnings / records.length).toFixed(2) : "0.00"}</h4></div>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Students tab */}
                  <div className="tab-pane fade" id="students">
                    <div className="card">
                      <div className="card-header-green d-flex justify-content-between align-items-center">
                        <h5 className="mb-0"><i className="bi bi-people"></i> Manage Students</h5>
                        <button className="btn btn-info btn-sm text-white" data-bs-toggle="modal" data-bs-target="#addStudentModal">
                          <i className="bi bi-person-plus"></i> Add Student
                        </button>
                      </div>
                      <div className="card-body">
                        {students.length === 0 ? (
                          <div className="empty-state">
                            <i className="bi bi-people"></i>
                            <h5>No Students Found</h5>
                          </div>
                        ) : (
                          <div className="table-responsive">
                            <table className="table table-hover">
                              <thead className="table-light">
                                <tr><th>ID</th><th>Name</th><th>Email</th><th>Joined</th><th>Actions</th></tr>
                              </thead>
                              <tbody>
                                {students.map((s) => (
                                  <tr key={s._id}>
                                    <td><small className="text-muted">{s._id.slice(-6)}</small></td>
                                    <td><strong>{s.name}</strong></td>
                                    <td>{s.email}</td>
                                    <td>{new Date(s.createdAt).toLocaleDateString()}</td>
                                    <td>
                                      <button
                                        className="btn btn-warning btn-sm me-1"
                                        data-bs-toggle="modal"
                                        data-bs-target="#editStudentModal"
                                        onClick={() => setEditStudent({ ...s })}
                                      >
                                        <i className="bi bi-pencil"></i>
                                      </button>
                                      <button className="btn btn-danger btn-sm" onClick={() => handleDeleteStudent(s._id, s.name)}>
                                        <i className="bi bi-trash"></i>
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Add Student Modal */}
      <div className="modal fade" id="addStudentModal" tabIndex="-1">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header" style={{ background: "linear-gradient(135deg, #28a745 0%, #20c997 100%)", color: "white" }}>
              <h5 className="modal-title">Add New Student</h5>
              <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal"></button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleAddStudent}>
                <div className="mb-3">
                  <label className="form-label">Full Name</label>
                  <input type="text" className="form-control" value={addForm.name} onChange={(e) => setAddForm({ ...addForm, name: e.target.value })} required />
                </div>
                <div className="mb-3">
                  <label className="form-label">Email</label>
                  <input type="email" className="form-control" value={addForm.email} onChange={(e) => setAddForm({ ...addForm, email: e.target.value })} required />
                </div>
                <div className="mb-3">
                  <label className="form-label">Password</label>
                  <input type="password" className="form-control" value={addForm.password} onChange={(e) => setAddForm({ ...addForm, password: e.target.value })} required minLength={6} />
                </div>
                <button type="submit" className="btn btn-success w-100">
                  <i className="bi bi-person-plus"></i> Add Student
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Student Modal */}
      <div className="modal fade" id="editStudentModal" tabIndex="-1">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header" style={{ background: "linear-gradient(135deg, #28a745 0%, #20c997 100%)", color: "white" }}>
              <h5 className="modal-title">Edit Student</h5>
              <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal"></button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleUpdateStudent}>
                <div className="mb-3">
                  <label className="form-label">Full Name</label>
                  <input type="text" className="form-control" value={editStudent?.name || ""} onChange={(e) => setEditStudent({ ...editStudent, name: e.target.value })} required />
                </div>
                <div className="mb-3">
                  <label className="form-label">Email</label>
                  <input type="email" className="form-control" value={editStudent?.email || ""} onChange={(e) => setEditStudent({ ...editStudent, email: e.target.value })} required />
                </div>
                <button type="submit" className="btn btn-success w-100">
                  <i className="bi bi-check-circle"></i> Update Student
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
