import { useState, useEffect, FormEvent } from "react";
import {
  ActionTaken,
  getActionsTaken,
  createActionTaken,
  updateActionTaken,
} from "../api.js";
import { useAuth } from "../contexts/AuthContext.js";

export interface ActionsTakenProps {
  ticketId: number;
  initialActions?: ActionTaken[];
  canEdit?: boolean;
  onActionAdded?: (action: ActionTaken) => void;
  onActionUpdated?: (action: ActionTaken) => void;
}

export function ActionsTaken({
  ticketId,
  initialActions,
  canEdit: canEditProp,
  onActionAdded,
  onActionUpdated,
}: ActionsTakenProps) {
  let authContext: ReturnType<typeof useAuth> | null = null;
  try {
    authContext = useAuth();
  } catch (e) {
    // AuthContext may not be provided in unit tests
  }
  const user = authContext?.user ?? null;

  // IT_STAFF and ADMIN can edit; REQUESTER cannot
  const isStaffOrAdmin =
    user?.role === "IT_STAFF" || user?.role === "ADMIN";
  const canEdit =
    canEditProp !== undefined ? canEditProp : isStaffOrAdmin;

  const [actions, setActions] = useState<ActionTaken[]>(initialActions ?? []);
  const [loading, setLoading] = useState<boolean>(!initialActions);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingAction, setEditingAction] = useState<ActionTaken | null>(null);

  // Form Fields
  const [actionDateTime, setActionDateTime] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [result, setResult] = useState<string>("");
  const [followUpRequired, setFollowUpRequired] = useState<boolean>(false);
  const [followUpNote, setFollowUpNote] = useState<string>("");
  const [attachmentNotes, setAttachmentNotes] = useState<string>("");
  const [formError, setFormError] = useState<string | null>(null);

  // Load actions if not supplied via props
  const fetchActions = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getActionsTaken(ticketId);
      setActions(data);
    } catch (err: any) {
      setError(err.message || "Failed to load actions taken");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialActions) {
      setActions(initialActions);
      setLoading(false);
    } else {
      fetchActions();
    }
  }, [ticketId, initialActions]);

  const openAddModal = () => {
    setEditingAction(null);
    const now = new Date();
    // format as YYYY-MM-DDTHH:mm for datetime-local
    const localIso = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
    setActionDateTime(localIso);
    setDescription("");
    setResult("");
    setFollowUpRequired(false);
    setFollowUpNote("");
    setAttachmentNotes("");
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (action: ActionTaken) => {
    setEditingAction(action);
    const dt = new Date(action.actionDateTime);
    const localIso = new Date(dt.getTime() - dt.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
    setActionDateTime(localIso);
    setDescription(action.description);
    setResult(action.result);
    setFollowUpRequired(action.followUpRequired);
    setFollowUpNote(action.followUpNote ?? "");
    setAttachmentNotes(action.attachmentNotes ?? "");
    setFormError(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingAction(null);
    setFormError(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Validation per AC-02, BR-04
    if (!description.trim()) {
      setFormError("Description is required.");
      return;
    }
    if (!result.trim()) {
      setFormError("Result is required.");
      return;
    }
    if (followUpRequired && !followUpNote.trim()) {
      setFormError("Follow-up note is required when follow-up is requested.");
      return;
    }

    try {
      setSubmitting(true);
      if (editingAction) {
        // Edit mode (optimistic concurrency with lastUpdatedAt)
        const updated = await updateActionTaken(ticketId, editingAction.id, {
          actionDateTime: actionDateTime ? new Date(actionDateTime).toISOString() : undefined,
          description: description.trim(),
          result: result.trim(),
          followUpRequired,
          followUpNote: followUpRequired ? followUpNote.trim() : null,
          attachmentNotes: attachmentNotes.trim() || null,
          lastUpdatedAt: editingAction.updatedAt,
        });
        setActions((prev) =>
          prev.map((a) => (a.id === updated.id ? updated : a))
        );
        onActionUpdated?.(updated);
      } else {
        // Create mode
        const created = await createActionTaken(ticketId, {
          actionDateTime: actionDateTime ? new Date(actionDateTime).toISOString() : undefined,
          description: description.trim(),
          result: result.trim(),
          followUpRequired,
          followUpNote: followUpRequired ? followUpNote.trim() : null,
          attachmentNotes: attachmentNotes.trim() || null,
        });
        setActions((prev) => [created, ...prev]);
        onActionAdded?.(created);
      }
      closeModal();
    } catch (err: any) {
      setFormError(err.message || "Failed to save action taken.");
    } finally {
      setSubmitting(false);
    }
  };

  const formatDateTime = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="card shadow-sm border-0 mb-4" style={{ borderRadius: "8px" }}>
      {/* Header */}
      <div
        className="card-header d-flex justify-content-between align-items-center py-3"
        style={{ backgroundColor: "#EAF6EF", borderBottom: "1px solid #E0E6E3" }}
      >
        <div className="d-flex align-items-center gap-2">
          <h5 className="mb-0 fw-bold" style={{ color: "#1A3326" }}>
            Actions Taken
          </h5>
          <span
            className="badge rounded-pill"
            style={{ backgroundColor: "#006B3C", color: "#FFFFFF" }}
          >
            {actions.length}
          </span>
        </div>

        {canEdit && (
          <button
            type="button"
            className="btn btn-sm text-white fw-semibold px-3"
            style={{ backgroundColor: "#006B3C", borderColor: "#006B3C" }}
            onClick={openAddModal}
          >
            + Add Action Taken
          </button>
        )}
      </div>

      {/* Body */}
      <div className="card-body p-3">
        {loading && (
          <div className="text-center py-4 text-muted">
            <div className="spinner-border spinner-border-sm text-success me-2" role="status" />
            Loading actions taken...
          </div>
        )}

        {error && (
          <div className="alert alert-danger py-2 mb-3" role="alert">
            {error}
          </div>
        )}

        {!loading && !error && actions.length === 0 && (
          <div
            className="text-center py-4 px-3 rounded border border-dashed"
            style={{ borderColor: "#E0E6E3", backgroundColor: "#F9FAF9" }}
            data-testid="actions-taken-empty"
          >
            <p className="text-muted mb-0">
              No actions taken recorded yet.
            </p>
          </div>
        )}

        {!loading && actions.length > 0 && (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr style={{ color: "#5C6F64", fontSize: "0.875rem" }}>
                  <th style={{ width: "16%" }}>Date &amp; Time</th>
                  <th style={{ width: "16%" }}>Performed By</th>
                  <th>Description</th>
                  <th>Result</th>
                  <th style={{ width: "18%" }}>Follow-Up</th>
                  {canEdit && <th style={{ width: "8%", textAlign: "center" }}>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {actions.map((act) => (
                  <tr key={act.id}>
                    {/* Date & Time */}
                    <td className="small text-muted text-nowrap">
                      {formatDateTime(act.actionDateTime)}
                    </td>

                    {/* Performer */}
                    <td>
                      <span
                        className="badge"
                        style={{
                          backgroundColor: "#EAF6EF",
                          color: "#006B3C",
                          border: "1px solid #A3D9C9",
                        }}
                      >
                        {act.performer?.name ?? `User #${act.performedById}`}
                      </span>
                    </td>

                    {/* Description */}
                    <td>
                      <div className="fw-medium text-break">{act.description}</div>
                      {act.attachmentNotes && (
                        <div className="small text-muted mt-1">
                          <i className="bi bi-paperclip me-1" />
                          <em>Attachment: {act.attachmentNotes}</em>
                        </div>
                      )}
                    </td>

                    {/* Result */}
                    <td className="text-break">{act.result}</td>

                    {/* Follow-Up */}
                    <td>
                      {act.followUpRequired ? (
                        <div>
                          <span className="badge bg-warning text-dark mb-1">
                            Follow-Up Required
                          </span>
                          {act.followUpNote && (
                            <div className="small text-muted text-break">
                              {act.followUpNote}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="badge bg-light text-muted border">
                          None
                        </span>
                      )}
                    </td>

                    {/* Edit button */}
                    {canEdit && (
                      <td className="text-center">
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-secondary py-0 px-2"
                          onClick={() => openEditModal(act)}
                          aria-label={`Edit action ${act.id}`}
                        >
                          Edit
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Modal Dialog */}
      {isModalOpen && (
        <div
          className="modal fade show d-block"
          tabIndex={-1}
          role="dialog"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          aria-labelledby="actionTakenModalTitle"
        >
          <div className="modal-dialog modal-dialog-centered modal-lg" role="document">
            <div className="modal-content shadow border-0" style={{ borderRadius: "8px" }}>
              <div
                className="modal-header py-3"
                style={{ backgroundColor: "#006B3C", color: "#FFFFFF" }}
              >
                <h5 className="modal-title fw-bold" id="actionTakenModalTitle">
                  {editingAction ? "Edit Action Taken" : "Add Action Taken"}
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  aria-label="Close"
                  onClick={closeModal}
                />
              </div>

              <form onSubmit={handleSubmit}>
                <div className="modal-body p-4">
                  {formError && (
                    <div className="alert alert-danger py-2 mb-3" role="alert">
                      {formError}
                    </div>
                  )}

                  {/* Performed By (Read-only badge) */}
                  <div className="mb-3">
                    <label className="form-label text-muted small mb-1">
                      Performed By
                    </label>
                    <div>
                      <span
                        className="badge px-3 py-2 fs-6"
                        style={{
                          backgroundColor: "#EAF6EF",
                          color: "#006B3C",
                          border: "1px solid #A3D9C9",
                        }}
                      >
                        {editingAction
                          ? editingAction.performer?.name ?? `User #${editingAction.performedById}`
                          : user?.name ?? "Authenticated IT Staff"}
                      </span>
                    </div>
                  </div>

                  {/* Action Date / Time */}
                  <div className="mb-3">
                    <label
                      htmlFor="actionDateTime"
                      className="form-label fw-semibold"
                    >
                      Action Date &amp; Time
                    </label>
                    <input
                      type="datetime-local"
                      id="actionDateTime"
                      className="form-control"
                      value={actionDateTime}
                      onChange={(e) => setActionDateTime(e.target.value)}
                    />
                  </div>

                  {/* Description */}
                  <div className="mb-3">
                    <label
                      htmlFor="description"
                      className="form-label fw-semibold"
                    >
                      Description <span className="text-danger">*</span>
                    </label>
                    <textarea
                      id="description"
                      aria-label="Description"
                      className="form-control"
                      rows={3}
                      placeholder="Detail the technical diagnosis, steps performed, or actions taken..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      required
                    />
                  </div>

                  {/* Result */}
                  <div className="mb-3">
                    <label htmlFor="result" className="form-label fw-semibold">
                      Result <span className="text-danger">*</span>
                    </label>
                    <textarea
                      id="result"
                      aria-label="Result"
                      className="form-control"
                      rows={3}
                      placeholder="Document the outcome or test verification result..."
                      value={result}
                      onChange={(e) => setResult(e.target.value)}
                      required
                    />
                  </div>

                  {/* Follow-Up Required Checkbox */}
                  <div className="form-check form-switch mb-3">
                    <input
                      type="checkbox"
                      id="followUpRequired"
                      className="form-check-input"
                      checked={followUpRequired}
                      onChange={(e) => setFollowUpRequired(e.target.checked)}
                    />
                    <label
                      htmlFor="followUpRequired"
                      className="form-check-label fw-semibold"
                    >
                      Follow-up Required
                    </label>
                  </div>

                  {/* Conditional Follow-up Note */}
                  {followUpRequired && (
                    <div className="mb-3 ps-3 border-start border-3 border-warning">
                      <label
                        htmlFor="followUpNote"
                        className="form-label fw-semibold text-warning-emphasis"
                      >
                        Follow-up Note <span className="text-danger">*</span>
                      </label>
                      <textarea
                        id="followUpNote"
                        aria-label="Follow-up Note"
                        className="form-control"
                        rows={2}
                        placeholder="Specify next steps, scheduled return, or pending replacement parts..."
                        value={followUpNote}
                        onChange={(e) => setFollowUpNote(e.target.value)}
                        required
                      />
                      {followUpRequired && !followUpNote.trim() && (
                        <div className="text-danger small mt-1">
                          Follow-up note is required when follow-up is requested.
                        </div>
                      )}
                    </div>
                  )}

                  {/* Attachment Notes */}
                  <div className="mb-3">
                    <label
                      htmlFor="attachmentNotes"
                      className="form-label fw-semibold text-muted small"
                    >
                      Attachment Notes (Optional)
                    </label>
                    <input
                      type="text"
                      id="attachmentNotes"
                      aria-label="Attachment Notes"
                      className="form-control form-control-sm"
                      placeholder="e.g. Refer to test-result-log.png"
                      value={attachmentNotes}
                      onChange={(e) => setAttachmentNotes(e.target.value)}
                    />
                  </div>
                </div>

                <div
                  className="modal-footer py-2"
                  style={{ backgroundColor: "#F9FAF9" }}
                >
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={closeModal}
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-sm text-white fw-semibold"
                    style={{ backgroundColor: "#006B3C", borderColor: "#006B3C" }}
                    disabled={submitting || (followUpRequired && !followUpNote.trim())}
                  >
                    {submitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-1" />
                        Saving...
                      </>
                    ) : editingAction ? (
                      "Update Action"
                    ) : (
                      "Save Action"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
