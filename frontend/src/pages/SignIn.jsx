import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setUser } from "../redux/slices/userSlice.js";
import API from "../utils/axios.js";

export default function SignIn() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await API.post("/auth/login", form);
      dispatch(setUser({ user: data.user, token: data.token }));
      if (data.user.role === "STUDENT") navigate("/student-dashboard");
      else navigate("/contractor-dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        fontFamily: "'Segoe UI', sans-serif",
      }}
    >
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-10 col-lg-8">
            <div
              className="card"
              style={{ borderRadius: 15, overflow: "hidden", border: "none" }}
            >
              <div className="row g-0">
                <div
                  className="col-md-5 d-flex flex-column justify-content-center p-5"
                  style={{
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    color: "white",
                  }}
                >
                  <h1 className="mb-3">
                    <i className="bi bi-upc-scan"></i> MealScan
                  </h1>
                  <h5 className="mb-4">Transparent Mess & Canteen Billing</h5>
                  <p>
                    Track your meals, verify costs, and maintain complete
                    transparency in hostel billing.
                  </p>
                </div>
                <div className="col-md-7 p-5 bg-white">
                  <h3 className="mb-4">Welcome Back</h3>
                  {error && <div className="alert alert-danger">{error}</div>}
                  <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                      <label className="form-label">Email</label>
                      <input
                        type="email"
                        className="form-control"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Password</label>
                      <input
                        type="password"
                        className="form-control"
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      className="btn w-100 mb-3"
                      style={{
                        background: "#667eea",
                        color: "white",
                        border: "none",
                        padding: 12,
                        fontWeight: 600,
                      }}
                      disabled={loading}
                    >
                      {loading ? (
                        <span className="spinner-border spinner-border-sm me-2" />
                      ) : (
                        <i className="bi bi-box-arrow-in-right me-2"></i>
                      )}
                      Login
                    </button>
                  </form>
                  <div className="text-center">
                    <p className="mb-0">
                      Don't have an account?{" "}
                      <Link to="/register" className="text-decoration-none">
                        Register here
                      </Link>
                    </p>
                  </div>
                  <hr className="my-4" />
                  <small className="text-muted">
                    <strong>Demo Credentials:</strong>
                    <br />
                    Student: student@mealscan.com / password123
                    <br />
                    Mess: mess@mealscan.com / password123
                    <br />
                    Canteen: canteen@mealscan.com / password123
                  </small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
