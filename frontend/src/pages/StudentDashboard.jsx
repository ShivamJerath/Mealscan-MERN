import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { clearUser } from "../redux/slices/userSlice.js";
import API from "../utils/axios.js";

export default function StudentDashboard() {
  const { user } = useSelector((s) => s.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [messRecords, setMessRecords] = useState([]);
  const [canteenRecords, setCanteenRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Bill modal state
  const [billType, setBillType] = useState("");
  const [billMonth, setBillMonth] = useState(new Date().getMonth() + 1);
  const [billYear, setBillYear] = useState(new Date().getFullYear());

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const [messRes, canteenRes] = await Promise.all([
        API.get("/record/student?type=MESS"),
        API.get("/record/student?type=CANTEEN"),
      ]);
      setMessRecords(messRes.data.records);
      setCanteenRecords(canteenRes.data.records);
    } catch (err) {
      setError("Failed to load records");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    dispatch(clearUser());
    navigate("/");
  };

  const handleGenerateBill = () => {
    navigate(`/bill?type=${billType}&month=${billMonth}&year=${billYear}`);
    // close modal
    const modal = window.bootstrap?.Modal.getInstance(
      document.getElementById("billModal")
    );
    modal?.hide();
  };

  const messTotal = messRecords.reduce((s, r) => s + r.cost, 0);
  const canteenTotal = canteenRecords.reduce((s, r) => s + r.cost, 0);

  const months = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December",
  ];

  const years = [];
  const curYear = new Date().getFullYear();
  for (let y = curYear; y >= curYear - 5; y--) years.push(y);

  const RecordsTable = ({ records }) =>
    records.length === 0 ? (
      <div className="empty-state">
        <i className="bi bi-inbox"></i>
        <p className="mt-3">No records found</p>
      </div>
    ) : (
      <div className="table-responsive">
        <table className="table table-hover">
          <thead className="table-light">
            <tr>
              <th>Date</th>
              <th>Meal Type</th>
              <th>Items</th>
              <th>Cost</th>
              <th>Contractor</th>
            </tr>
          </thead>
          <tbody>
            {records.map((r) => (
              <tr key={r._id}>
                <td>{new Date(r.recordDate).toLocaleDateString()}</td>
                <td><span className="badge bg-info">{r.mealType}</span></td>
                <td>{r.items}</td>
                <td className="fw-bold">₹{r.cost.toFixed(2)}</td>
                <td>{r.contractor?.name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );

  return (
    <>
      <nav
        className="navbar navbar-dark"
        style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}
      >
        <div className="container-fluid">
          <span className="navbar-brand mb-0 h1">
            <i className="bi bi-upc-scan"></i> MealScan - Student Dashboard
          </span>
          <div className="d-flex align-items-center">
            <span className="text-white me-3">
              <i className="bi bi-person-circle"></i> {user?.name}
            </span>
            <button className="btn btn-outline-light" onClick={handleLogout}>
              <i className="bi bi-box-arrow-right"></i> Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="container-fluid mt-4">
        {error && <div className="alert alert-danger">{error}</div>}

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" />
          </div>
        ) : (
          <>
            {/* Stat cards */}
            <div className="row mb-4">
              <div className="col-md-6">
                <div className="stat-card">
                  <div className="stat-value-purple">₹{messTotal.toFixed(2)}</div>
                  <div className="text-muted">Total Mess Bill</div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="stat-card">
                  <div className="stat-value-purple">₹{canteenTotal.toFixed(2)}</div>
                  <div className="text-muted">Total Canteen Bill</div>
                </div>
              </div>
            </div>

            {/* Records card */}
            <div className="card">
              <div className="card-header-purple">
                <h5 className="mb-0"><i className="bi bi-receipt"></i> My Records</h5>
              </div>
              <div className="card-body">
                <ul className="nav nav-tabs mb-4" id="recordTabs">
                  <li className="nav-item">
                    <button
                      className="nav-link active"
                      data-bs-toggle="tab"
                      data-bs-target="#mess"
                    >
                      <i className="bi bi-egg-fried"></i> Mess Records
                    </button>
                  </li>
                  <li className="nav-item">
                    <button
                      className="nav-link"
                      data-bs-toggle="tab"
                      data-bs-target="#canteen"
                    >
                      <i className="bi bi-cup-hot"></i> Canteen Records
                    </button>
                  </li>
                </ul>

                <div className="tab-content">
                  <div className="tab-pane fade show active" id="mess">
                    <div className="mb-3">
                      <button
                        className="btn btn-success"
                        data-bs-toggle="modal"
                        data-bs-target="#billModal"
                        onClick={() => setBillType("MESS")}
                      >
                        <i className="bi bi-file-earmark-text"></i> Generate Monthly Bill
                      </button>
                    </div>
                    <RecordsTable records={messRecords} />
                  </div>
                  <div className="tab-pane fade" id="canteen">
                    <div className="mb-3">
                      <button
                        className="btn btn-success"
                        data-bs-toggle="modal"
                        data-bs-target="#billModal"
                        onClick={() => setBillType("CANTEEN")}
                      >
                        <i className="bi bi-file-earmark-text"></i> Generate Monthly Bill
                      </button>
                    </div>
                    <RecordsTable records={canteenRecords} />
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Bill Modal */}
      <div className="modal fade" id="billModal" tabIndex="-1">
        <div className="modal-dialog">
          <div className="modal-content">
            <div
              className="modal-header"
              style={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "white",
              }}
            >
              <h5 className="modal-title">Generate Monthly Bill</h5>
              <button
                type="button"
                className="btn-close btn-close-white"
                data-bs-dismiss="modal"
              ></button>
            </div>
            <div className="modal-body">
              <div className="mb-3">
                <label className="form-label">Select Month and Year</label>
                <div className="row">
                  <div className="col-md-6">
                    <select
                      className="form-select"
                      value={billMonth}
                      onChange={(e) => setBillMonth(e.target.value)}
                    >
                      {months.map((m, i) => (
                        <option key={i} value={i + 1}>{m}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-6">
                    <select
                      className="form-select"
                      value={billYear}
                      onChange={(e) => setBillYear(e.target.value)}
                    >
                      {years.map((y) => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              <div className="alert alert-info">
                <small>
                  <i className="bi bi-info-circle"></i> This will generate a
                  detailed bill for the selected month and year.
                </small>
              </div>
              <button
                className="btn btn-primary w-100"
                onClick={handleGenerateBill}
              >
                <i className="bi bi-calculator"></i> Generate Bill
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
