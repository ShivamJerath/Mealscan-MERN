import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import API from "../utils/axios.js";

const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

export default function BillPage() {
  const { user } = useSelector((s) => s.user);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const type = searchParams.get("type");
  const month = searchParams.get("month");
  const year = searchParams.get("year");

  const [records, setRecords] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!type || !month || !year) {
      setError("Missing parameters");
      setLoading(false);
      return;
    }
    fetchBill();
  }, [type, month, year]);

  const fetchBill = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/record/bill?type=${type}&month=${month}&year=${year}`);
      setRecords(res.data.records);
      setTotal(res.data.total);
    } catch (err) {
      setError("Failed to load bill");
    } finally {
      setLoading(false);
    }
  };

  const monthName = MONTH_NAMES[(parseInt(month) || 1) - 1];

  return (
    <>
      <nav className="navbar navbar-dark no-print" style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}>
        <div className="container-fluid">
          <span className="navbar-brand mb-0 h1">
            <i className="bi bi-upc-scan"></i> MealScan - Monthly Bill
          </span>
          <div className="d-flex align-items-center">
            <span className="text-white me-3">
              <i className="bi bi-person-circle"></i> {user?.name}
            </span>
            <button className="btn btn-outline-light me-2" onClick={() => navigate("/student-dashboard")}>
              <i className="bi bi-arrow-left"></i> Back
            </button>
          </div>
        </div>
      </nav>

      <div className="container-fluid mt-4">
        <div className="row justify-content-center">
          <div className="col-lg-10">
            <div className="card">
              {/* Bill header */}
              <div
                style={{
                  background: "linear-gradient(135deg, #28a745 0%, #20c997 100%)",
                  color: "white",
                  padding: "2rem",
                  borderRadius: "15px 15px 0 0",
                }}
              >
                <div className="row align-items-center">
                  <div className="col-md-8">
                    <h2 className="mb-1">
                      <i className="bi bi-file-earmark-text"></i> {type?.toUpperCase()} BILL
                    </h2>
                    <h4 className="mb-0">{monthName} {year}</h4>
                    <p className="mb-0">Generated for: {user?.name}</p>
                  </div>
                  <div className="col-md-4 text-end">
                    <p className="mb-1">Generated on: {new Date().toLocaleDateString()}</p>
                    <p className="mb-0">Total Records: {records.length}</p>
                  </div>
                </div>
              </div>

              <div className="card-body">
                {loading ? (
                  <div className="text-center py-5"><div className="spinner-border text-success" /></div>
                ) : error ? (
                  <div className="alert alert-danger">{error}</div>
                ) : records.length === 0 ? (
                  <div className="text-center py-5 text-muted">
                    <i className="bi bi-inbox" style={{ fontSize: "3rem" }}></i>
                    <h4 className="mt-3">No Records Found</h4>
                    <p>No {type?.toLowerCase()} records found for {monthName} {year}</p>
                    <button className="btn btn-primary no-print" onClick={() => navigate("/student-dashboard")}>
                      Back to Dashboard
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="table-responsive">
                      <table className="table table-hover table-bordered">
                        <thead className="table-dark">
                          <tr>
                            <th>#</th>
                            <th>Date</th>
                            <th>Meal Type</th>
                            <th>Items</th>
                            <th>Cost (₹)</th>
                            <th>Contractor</th>
                          </tr>
                        </thead>
                        <tbody>
                          {records.map((r, i) => (
                            <tr key={r._id}>
                              <td className="fw-bold">{i + 1}</td>
                              <td>{new Date(r.recordDate).toLocaleDateString()}</td>
                              <td><span className="badge bg-info">{r.mealType}</span></td>
                              <td>{r.items}</td>
                              <td className="fw-bold text-end">₹{r.cost.toFixed(2)}</td>
                              <td>{r.contractor?.name}</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot className="table-success">
                          <tr>
                            <td colSpan="4" className="text-end fw-bold fs-5">GRAND TOTAL:</td>
                            <td className="fw-bold fs-5 text-end">₹{total.toFixed(2)}</td>
                            <td></td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>

                    <div className="row mt-4 no-print">
                      <div className="col-md-6">
                        <div className="alert alert-info">
                          <h6><i className="bi bi-info-circle"></i> Bill Summary</h6>
                          <ul className="mb-0">
                            <li>Total Meals: {records.length}</li>
                            <li>Total Amount: ₹{total.toFixed(2)}</li>
                            <li>Average per meal: ₹{records.length > 0 ? (total / records.length).toFixed(2) : "0.00"}</li>
                          </ul>
                        </div>
                      </div>
                      <div className="col-md-6 text-end">
                        <button className="btn btn-primary me-2" onClick={() => window.print()}>
                          <i className="bi bi-printer"></i> Print Bill
                        </button>
                        <button className="btn btn-secondary" onClick={() => navigate("/student-dashboard")}>
                          <i className="bi bi-arrow-left"></i> Back to Dashboard
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
