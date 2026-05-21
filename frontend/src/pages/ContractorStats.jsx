import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { clearUser } from "../redux/slices/userSlice.js";
import API from "../utils/axios.js";

export default function ContractorStats() {
  const { user } = useSelector((s) => s.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await API.get("/record/stats");
      setData(res.data);
    } catch (err) {
      setError("Failed to load statistics");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    dispatch(clearUser());
    navigate("/");
  };

  if (loading)
    return (
      <div className="text-center py-5 mt-5">
        <div className="spinner-border text-success" />
      </div>
    );

  if (error)
    return <div className="alert alert-danger m-4">{error}</div>;

  const { stats, recentActivity, monthlyBreakdown } = data;

  const topStudents = Object.entries(stats.studentSpending || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <>
      <nav className="navbar navbar-dark navbar-contractor">
        <div className="container-fluid">
          <span className="navbar-brand mb-0 h1">
            <i className="bi bi-upc-scan"></i> MealScan - Performance Statistics
          </span>
          <div className="d-flex align-items-center">
            <span className="text-white me-3">
              <i className="bi bi-person-circle"></i> {user?.name}
              <span className="badge bg-light text-dark ms-2">{user?.role}</span>
            </span>
            <button className="btn btn-outline-light me-2" onClick={() => navigate("/contractor-dashboard")}>
              <i className="bi bi-speedometer2"></i> Dashboard
            </button>
            <button className="btn btn-outline-light" onClick={handleLogout}>
              <i className="bi bi-box-arrow-right"></i> Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="container-fluid mt-4">
        {/* Revenue overview */}
        <div className="row mb-4">
          {[
            { label: "This Month", value: `₹${stats.monthlyEarnings.toFixed(2)}`, bg: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", icon: "bi-currency-rupee" },
            { label: "Total Earnings", value: `₹${stats.totalEarnings.toFixed(2)}`, bg: "linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)", icon: "bi-graph-up" },
            { label: "Active Students", value: stats.totalStudents, bg: "linear-gradient(135deg, #a8e6cf 0%, #3fada8 100%)", icon: "bi-people" },
          ].map((item, i) => (
            <div key={i} className="col-md-4">
              <div className="revenue-highlight text-center" style={{ background: item.bg }}>
                <i className={`bi ${item.icon}`}></i>
                <div className="revenue-value">{item.value}</div>
                <div className="revenue-label">{item.label}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="row">
          {/* Left: Metrics + Tables */}
          <div className="col-lg-8">
            <div className="card">
              <div className="card-header-green">
                <h5 className="mb-0"><i className="bi bi-speedometer2"></i> Performance Metrics</h5>
              </div>
              <div className="card-body">
                <div className="row">
                  {[
                    { label: "Total Records", value: stats.totalRecords, color: "bg-success" },
                    { label: "Today's Records", value: stats.todayRecords, color: "bg-info" },
                    { label: "This Week", value: stats.weeklyRecords, color: "bg-warning" },
                    { label: "Avg Meal Cost", value: `₹${stats.avgMealCost.toFixed(2)}`, color: "bg-danger" },
                  ].map((item, i) => (
                    <div key={i} className="col-md-6">
                      <div className="stat-card" style={{ borderLeft: "4px solid #28a745" }}>
                        <div className="stat-value-green">{item.value}</div>
                        <div className="text-muted" style={{ textTransform: "uppercase", letterSpacing: 1, fontSize: "0.85rem" }}>{item.label}</div>
                        <div className="progress mt-2" style={{ height: 8 }}>
                          <div className={`progress-bar ${item.color}`} style={{ width: "100%" }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Meal type breakdown */}
                <div className="mt-4">
                  <h6><i className="bi bi-pie-chart"></i> Meal Type Distribution</h6>
                  {Object.keys(stats.mealTypeCounts || {}).length === 0 ? (
                    <div className="empty-state"><i className="bi bi-inbox"></i><p>No meal type data</p></div>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-sm table-hover">
                        <thead className="table-light">
                          <tr><th>Meal Type</th><th>Count</th><th>Earnings</th><th>Percentage</th></tr>
                        </thead>
                        <tbody>
                          {Object.entries(stats.mealTypeCounts).map(([mealType, count]) => {
                            const pct = stats.totalRecords > 0 ? (count * 100) / stats.totalRecords : 0;
                            return (
                              <tr key={mealType}>
                                <td><span className="badge bg-primary">{mealType}</span></td>
                                <td>{count}</td>
                                <td className="fw-bold">₹{(stats.mealTypeEarnings[mealType] || 0).toFixed(2)}</td>
                                <td>
                                  <div className="progress" style={{ height: 6 }}>
                                    <div className="progress-bar bg-success" style={{ width: `${pct}%` }} />
                                  </div>
                                  <small className="text-muted">{pct.toFixed(1)}%</small>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Monthly breakdown */}
                <div className="mt-4">
                  <h6><i className="bi bi-calendar-month"></i> Monthly Performance</h6>
                  {Object.keys(monthlyBreakdown || {}).length === 0 ? (
                    <div className="empty-state"><i className="bi bi-inbox"></i><p>No monthly data</p></div>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-sm table-hover">
                        <thead className="table-light">
                          <tr><th>Month</th><th>Records</th><th>Earnings</th><th>Avg/Record</th></tr>
                        </thead>
                        <tbody>
                          {Object.entries(monthlyBreakdown).map(([month, d]) => (
                            <tr key={month}>
                              <td className="fw-bold">{month}</td>
                              <td>{d.records}</td>
                              <td className="text-success fw-bold">₹{d.earnings.toFixed(2)}</td>
                              <td>₹{d.records > 0 ? (d.earnings / d.records).toFixed(2) : "0.00"}</td>
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

          {/* Right: Recent activity + Top students */}
          <div className="col-lg-4">
            <div className="card mb-4">
              <div className="card-header-green">
                <h6 className="mb-0"><i className="bi bi-clock-history"></i> Recent Activity</h6>
              </div>
              <div className="card-body" style={{ maxHeight: 400, overflowY: "auto" }}>
                {recentActivity.length === 0 ? (
                  <div className="empty-state"><i className="bi bi-inbox"></i><p>No recent activity</p></div>
                ) : (
                  recentActivity.map((a, i) => (
                    <div key={i} className="activity-item">
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <strong>{a.studentName}</strong><br />
                          <span className="badge bg-info">{a.mealType}</span>
                          <small className="text-muted d-block">{a.items}</small>
                        </div>
                        <div className="text-end">
                          <strong className="text-success">₹{a.cost.toFixed(2)}</strong><br />
                          <small className="text-muted">{new Date(a.date).toLocaleDateString()}</small>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="card">
              <div className="card-header-green">
                <h6 className="mb-0"><i className="bi bi-trophy"></i> Top Students</h6>
              </div>
              <div className="card-body">
                {topStudents.length === 0 ? (
                  <div className="empty-state"><i className="bi bi-people"></i><p>No student data</p></div>
                ) : (
                  topStudents.map(([name, spent], i) => (
                    <div key={i} className="d-flex justify-content-between align-items-center mb-2 p-2 border rounded">
                      <div className="d-flex align-items-center">
                        <span className="badge bg-primary me-2">{i + 1}</span>
                        <div>
                          <div className="fw-bold" style={{ fontSize: "0.9rem" }}>{name}</div>
                          <small className="text-muted">Total Spent</small>
                        </div>
                      </div>
                      <div className="text-success fw-bold">₹{spent.toFixed(2)}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="row mt-4">
          <div className="col-12 text-center">
            <button className="btn btn-primary me-2" onClick={() => navigate("/contractor-dashboard")}>
              <i className="bi bi-speedometer2"></i> Back to Dashboard
            </button>
            <button className="btn btn-outline-secondary" onClick={() => window.print()}>
              <i className="bi bi-printer"></i> Print Report
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
