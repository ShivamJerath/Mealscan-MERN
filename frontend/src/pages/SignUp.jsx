import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setUser } from "../redux/slices/userSlice.js";
import API from "../utils/axios.js";

export default function SignUp() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await API.post("/auth/register", form);
      dispatch(setUser({ user: data.user, token: data.token }));
      if (data.user.role === "STUDENT") navigate("/student-dashboard");
      else navigate("/contractor-dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
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
        padding: "2rem 0",
        fontFamily: "'Segoe UI', sans-serif",
      }}
    >
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-5">
            <div
              className="card p-5"
              style={{ borderRadius: 15, border: "none" }}
            >
              <div className="text-center mb-4">
                <h1 style={{ color: "#667eea" }}>
                  <i className="bi bi-upc-scan"></i> MealScan
                </h1>
                <h4 className="mt-3">Create Account</h4>
              </div>
              {error && <div className="alert alert-danger">{error}</div>}
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    className="form-control"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                  />
                </div>
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
                    minLength={6}
                  />
                  <div className="form-text">Minimum 6 characters</div>
                </div>
                <div className="mb-3">
                  <label className="form-label">Role</label>
                  <select
                    className="form-select"
                    name="role"
                    value={form.role}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select your role</option>
                    <option value="STUDENT">Student</option>
                    <option value="MESS_CONTRACTOR">Mess Contractor</option>
                    <option value="CANTEEN_CONTRACTOR">Canteen Contractor</option>
                  </select>
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
                    <i className="bi bi-person-plus me-2"></i>
                  )}
                  Register
                </button>
              </form>
              <div className="text-center">
                <p className="mb-0">
                  Already have an account?{" "}
                  <Link to="/" className="text-decoration-none">
                    Login here
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
