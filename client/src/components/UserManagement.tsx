import { useState, useEffect, FormEvent } from "react";
import { User, getAdminUsers, createAdminUser, updateAdminUser, resetAdminUserPassword } from "../api.js";
import { useAuth } from "../contexts/AuthContext.js";

export function UserManagement() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, totalItems: 0, limit: 20 });
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Modal / Form state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [resetPwUser, setResetPwUser] = useState<User | null>(null);

  // Create Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"REQUESTER" | "IT_STAFF" | "ADMIN">("IT_STAFF");
  const [isActive, setIsActive] = useState(true);
  const [initialPassword, setInitialPassword] = useState("Password123!");

  // Reset Password State
  const [newInitialPassword, setNewInitialPassword] = useState("Password123!");

  async function loadUsers(page: number = 1) {
    setLoading(true);
    setError(null);
    try {
      const res = await getAdminUsers(search, roleFilter, page);
      setUsers(res.data);
      setMeta(res.meta);
    } catch (err: any) {
      setError(err.message || "Failed to load user list");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers(1);
  }, [roleFilter]);

  function handleSearchSubmit(e: FormEvent) {
    e.preventDefault();
    loadUsers(1);
  }

  async function handleCreateUser(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    try {
      await createAdminUser({ name, email, role, isActive, initialPassword });
      setSuccessMsg(`User '${name}' created successfully with initial password.`);
      setShowCreateModal(false);
      resetForm();
      loadUsers(1);
    } catch (err: any) {
      setError(err.message || "Failed to create user");
    }
  }

  async function handleUpdateUser(e: FormEvent) {
    e.preventDefault();
    if (!editingUser) return;
    setError(null);
    setSuccessMsg(null);
    try {
      await updateAdminUser(editingUser.id, {
        name: editingUser.name,
        email: editingUser.email,
        role: editingUser.role,
        isActive: editingUser.isActive,
      });
      setSuccessMsg(`User '${editingUser.name}' updated successfully.`);
      setEditingUser(null);
      loadUsers(meta.page);
    } catch (err: any) {
      setError(err.message || "Failed to update user");
    }
  }

  async function handleResetPassword(e: FormEvent) {
    e.preventDefault();
    if (!resetPwUser) return;
    setError(null);
    setSuccessMsg(null);
    try {
      await resetAdminUserPassword(resetPwUser.id, newInitialPassword);
      setSuccessMsg(`Initial password reset for '${resetPwUser.name}'. Mandatory password change set for next login.`);
      setResetPwUser(null);
    } catch (err: any) {
      setError(err.message || "Failed to reset password");
    }
  }

  function resetForm() {
    setName("");
    setEmail("");
    setRole("IT_STAFF");
    setIsActive(true);
    setInitialPassword("Password123!");
  }

  function getRoleBadge(r: string) {
    switch (r) {
      case "ADMIN": return <span className="badge bg-danger">Administrator</span>;
      case "IT_STAFF": return <span className="badge bg-primary">IT Staff</span>;
      case "REQUESTER": return <span className="badge bg-secondary">Requester</span>;
      default: return <span className="badge bg-light text-dark">{r}</span>;
    }
  }

  return (
    <div className="card shadow-sm border-0">
      <div className="card-header bg-white py-3">
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-2">
          <h5 className="mb-0 fw-bold text-success" style={{ color: "#006B3C" }}>
            Administrator User Management
          </h5>
          <button
            className="btn btn-success btn-sm fw-bold"
            style={{ backgroundColor: "#006B3C", borderColor: "#006B3C" }}
            onClick={() => { resetForm(); setShowCreateModal(true); }}
          >
            + Create New User
          </button>
        </div>
      </div>

      <div className="card-body p-3">
        {error && <div className="alert alert-danger py-2 mb-3">{error}</div>}
        {successMsg && <div className="alert alert-success py-2 mb-3">{successMsg}</div>}

        {/* Toolbar Search & Filter */}
        <form onSubmit={handleSearchSubmit} className="row g-2 mb-3">
          <div className="col-md-6">
            <input
              type="text"
              className="form-control"
              placeholder="Search user by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="col-md-4 col-8">
            <select className="form-select" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
              <option value="ALL">All Roles</option>
              <option value="REQUESTER">Requesters</option>
              <option value="IT_STAFF">IT Staff</option>
              <option value="ADMIN">Administrators</option>
            </select>
          </div>
          <div className="col-md-2 col-4 d-grid">
            <button type="submit" className="btn btn-outline-success fw-bold">
              Filter
            </button>
          </div>
        </form>

        {loading ? (
          <div className="text-center py-5 text-muted">Loading users...</div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>#{u.id}</td>
                    <td className="fw-semibold">
                      {u.name}
                      {u.id === currentUser?.id && <span className="badge bg-warning text-dark ms-2">You</span>}
                    </td>
                    <td>{u.email}</td>
                    <td>{getRoleBadge(u.role)}</td>
                    <td>
                      {u.isActive ? (
                        <span className="badge bg-success-subtle text-success border border-success px-2 py-1">Active</span>
                      ) : (
                        <span className="badge bg-danger-subtle text-danger border border-danger px-2 py-1">Inactive</span>
                      )}
                    </td>
                    <td className="text-end">
                      <button
                        className="btn btn-sm btn-outline-secondary me-2 fw-semibold"
                        onClick={() => setEditingUser({ ...u })}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-sm btn-outline-warning text-dark fw-semibold"
                        onClick={() => { setResetPwUser(u); setNewInitialPassword("Password123!"); }}
                      >
                        Reset Password
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Create User Modal */}
        {showCreateModal && (
          <div className="modal d-block bg-dark bg-opacity-50" tabIndex={-1}>
            <div className="modal-dialog">
              <div className="modal-content shadow">
                <div className="modal-header bg-success text-white">
                  <h5 className="modal-header-title mb-0 fw-bold">Create New User Account</h5>
                  <button className="btn-close btn-close-white" onClick={() => setShowCreateModal(false)}></button>
                </div>
                <form onSubmit={handleCreateUser}>
                  <div className="modal-body">
                    <div className="mb-3">
                      <label className="form-label small fw-bold">Full Name *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label small fw-bold">Email Address *</label>
                      <input
                        type="email"
                        className="form-control"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label small fw-bold">Permitted Role *</label>
                      <select className="form-select" value={role} onChange={(e) => setRole(e.target.value as any)}>
                        <option value="REQUESTER">Requester</option>
                        <option value="IT_STAFF">IT Staff</option>
                        <option value="ADMIN">Administrator</option>
                      </select>
                    </div>
                    <div className="mb-3">
                      <label className="form-label small fw-bold">Initial Password *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={initialPassword}
                        onChange={(e) => setInitialPassword(e.target.value)}
                        required
                      />
                      <small className="text-muted extra-small">User will be prompted to change password at next login.</small>
                    </div>
                    <div className="form-check form-switch mb-3">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        id="createActiveToggle"
                        checked={isActive}
                        onChange={(e) => setIsActive(e.target.checked)}
                      />
                      <label className="form-check-label small fw-bold" htmlFor="createActiveToggle">
                        Active Account
                      </label>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowCreateModal(false)}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-success btn-sm fw-bold">
                      Save User
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Edit User Modal */}
        {editingUser && (
          <div className="modal d-block bg-dark bg-opacity-50" tabIndex={-1}>
            <div className="modal-dialog">
              <div className="modal-content shadow">
                <div className="modal-header bg-primary text-white">
                  <h5 className="modal-header-title mb-0 fw-bold">Edit User #{editingUser.id}</h5>
                  <button className="btn-close btn-close-white" onClick={() => setEditingUser(null)}></button>
                </div>
                <form onSubmit={handleUpdateUser}>
                  <div className="modal-body">
                    <div className="mb-3">
                      <label className="form-label small fw-bold">Full Name</label>
                      <input
                        type="text"
                        className="form-control"
                        value={editingUser.name}
                        onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label small fw-bold">Email Address</label>
                      <input
                        type="email"
                        className="form-control"
                        value={editingUser.email}
                        onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label small fw-bold">Permitted Role</label>
                      <select
                        className="form-select"
                        value={editingUser.role}
                        onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value as any })}
                      >
                        <option value="REQUESTER">Requester</option>
                        <option value="IT_STAFF">IT Staff</option>
                        <option value="ADMIN">Administrator</option>
                      </select>
                    </div>
                    <div className="form-check form-switch mb-3">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        id="editActiveToggle"
                        checked={editingUser.isActive}
                        onChange={(e) => setEditingUser({ ...editingUser, isActive: e.target.checked })}
                      />
                      <label className="form-check-label small fw-bold" htmlFor="editActiveToggle">
                        Active Account
                      </label>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary btn-sm" onClick={() => setEditingUser(null)}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary btn-sm fw-bold">
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Reset Password Modal */}
        {resetPwUser && (
          <div className="modal d-block bg-dark bg-opacity-50" tabIndex={-1}>
            <div className="modal-dialog">
              <div className="modal-content shadow">
                <div className="modal-header bg-warning text-dark">
                  <h5 className="modal-header-title mb-0 fw-bold">Reset Password for {resetPwUser.name}</h5>
                  <button className="btn-close" onClick={() => setResetPwUser(null)}></button>
                </div>
                <form onSubmit={handleResetPassword}>
                  <div className="modal-body">
                    <p className="small text-muted mb-3">
                      Issue a new initial password. The user will be required to change this password on their next login.
                    </p>
                    <div className="mb-3">
                      <label className="form-label small fw-bold">New Initial Password</label>
                      <input
                        type="text"
                        className="form-control"
                        value={newInitialPassword}
                        onChange={(e) => setNewInitialPassword(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary btn-sm" onClick={() => setResetPwUser(null)}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-warning btn-sm fw-bold">
                      Set New Password
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
