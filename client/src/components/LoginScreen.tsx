import { useState, FormEvent } from "react";
import { useAuth } from "../contexts/AuthContext.js";
import { changePassword } from "../api.js";

export function LoginScreen() {
  const { login, refreshUser } = useAuth();
  const [email, setEmail] = useState("jennifer.anderson@example.com");
  const [password, setPassword] = useState("Password123!");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mandatory Change Password state
  const [mustChangePassword, setMustChangePassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwError, setPwError] = useState<string | null>(null);
  const [pwSuccess, setPwSuccess] = useState<string | null>(null);

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const user = await login(email, password);
      if (user.requiresPasswordChange) {
        setMustChangePassword(true);
        setCurrentPassword(password);
      }
    } catch (err: any) {
      setError(err.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  }

  async function handleChangePassword(e: FormEvent) {
    e.preventDefault();
    setPwError(null);
    setPwSuccess(null);

    if (newPassword.length < 8) {
      setPwError("New password must be at least 8 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPwError("New password and confirmation do not match.");
      return;
    }

    setLoading(true);
    try {
      await changePassword(currentPassword, newPassword);
      setPwSuccess("Password updated successfully!");
      setTimeout(async () => {
        setMustChangePassword(false);
        await refreshUser();
      }, 1000);
    } catch (err: any) {
      setPwError(err.message || "Failed to update password");
    } finally {
      setLoading(false);
    }
  }

  if (mustChangePassword) {
    return (
      <div className="container py-5" style={{ maxWidth: 480 }}>
        <div className="card shadow-sm border-0">
          <div className="card-header bg-warning text-dark py-3">
            <h5 className="mb-0 fw-bold">Mandatory Password Change</h5>
          </div>
          <div className="card-body p-4">
            <p className="text-muted small mb-3">
              This is your first login or your initial password was reset. You must change your password before accessing TokTickIT.
            </p>

            {pwError && <div className="alert alert-danger py-2 mb-3">{pwError}</div>}
            {pwSuccess && <div className="alert alert-success py-2 mb-3">{pwSuccess}</div>}

            <form onSubmit={handleChangePassword}>
              <div className="mb-3">
                <label className="form-label small fw-bold">Current (Temporary) Password</label>
                <input
                  type="password"
                  className="form-control"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label small fw-bold">New Password</label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="At least 8 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label small fw-bold">Confirm New Password</label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn-success w-100 fw-bold"
                style={{ backgroundColor: "#006B3C", borderColor: "#006B3C" }}
                disabled={loading}
              >
                {loading ? "Updating Password..." : "Update Password & Continue"}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5" style={{ maxWidth: 460 }}>
      <div className="card shadow-sm border-0">
        <div className="card-header py-3 text-white text-center" style={{ backgroundColor: "#006B3C" }}>
          <h4 className="mb-0 fw-bold">Sign in to TokTickIT</h4>
          <span className="small text-white-50">IT Service Desk & Management System</span>
        </div>
        <div className="card-body p-4">
          {error && <div className="alert alert-danger py-2 mb-3">{error}</div>}

          <form onSubmit={handleLogin}>
            <div className="mb-3">
              <label className="form-label small fw-bold">Email Address</label>
              <input
                type="email"
                className="form-control"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="mb-3">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <label className="form-label small fw-bold mb-0">Password</label>
                <button
                  type="button"
                  className="btn btn-link btn-sm p-0 text-decoration-none text-muted small"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              <input
                type={showPassword ? "text" : "password"}
                className="form-control"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-success w-100 py-2 fw-bold"
              style={{ backgroundColor: "#006B3C", borderColor: "#006B3C" }}
              disabled={loading}
            >
              {loading ? "Authenticating..." : "Sign In"}
            </button>
          </form>

          <hr className="my-4" />

          <div className="small text-muted">
            <strong>Quick Test Logins:</strong>
            <ul className="mb-0 ps-3 mt-1">
              <li>Requester: <code>jennifer.anderson@example.com</code> / <code>Password123!</code></li>
              <li>Requester (Password Change): <code>david.lee@example.com</code> / <code>Password123!</code></li>
              <li>IT Staff: <code>kevin.patel@toktickit.com</code> / <code>Password123!</code></li>
              <li>Administrator: <code>john.smith@toktickit.com</code> / <code>Password123!</code></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
