import { useState, useEffect } from "react";
import { getStaffDashboard } from "../api.js";
import { useAuth } from "../contexts/AuthContext.js";

export interface StaffDashboardProps {
  initialData?: any;
  onDrillDown?: (filter: { status?: string; assignment?: string; unassigned?: boolean }) => void;
  onSelectTicket?: (ticketId: number) => void;
  onCreateTicket?: () => void;
  onSearchTickets?: () => void;
  onMyQueue?: () => void;
}

export function StaffDashboard({
  initialData,
  onDrillDown,
  onSelectTicket,
  onCreateTicket,
  onSearchTickets,
  onMyQueue,
}: StaffDashboardProps) {
  let authContext: ReturnType<typeof useAuth> | null = null;
  try {
    authContext = useAuth();
  } catch (e) {
    // AuthContext may not be provided in test environment
  }
  const user = authContext?.user ?? null;

  const [dashboardData, setDashboardData] = useState<any>(initialData ?? null);
  const [loading, setLoading] = useState<boolean>(!initialData);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getStaffDashboard();
      setDashboardData(res.data);
    } catch (err: any) {
      setError(err.message || "Failed to load staff dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialData) {
      setDashboardData(initialData);
      setLoading(false);
    } else {
      fetchDashboard();
    }
  }, [initialData]);

  const metrics = dashboardData?.metrics ?? {
    newCount: 0,
    openCount: 0,
    inProgressCount: 0,
    waitingRequesterCount: 0,
    myAssignedCount: 0,
    unassignedCount: 0,
  };

  const recentTickets = dashboardData?.recentTickets ?? [];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "NEW":
        return <span className="badge" style={{ backgroundColor: "#0D6EFD", color: "#FFFFFF" }}>New</span>;
      case "OPEN":
        return <span className="badge" style={{ backgroundColor: "#6F42C1", color: "#FFFFFF" }}>Open</span>;
      case "IN_PROGRESS":
        return <span className="badge" style={{ backgroundColor: "#FD7E14", color: "#FFFFFF" }}>In Progress</span>;
      case "WAITING_FOR_REQUESTER":
        return <span className="badge bg-warning text-dark">Waiting for Requester</span>;
      case "RESOLVED":
        return <span className="badge" style={{ backgroundColor: "#006B3C", color: "#FFFFFF" }}>Resolved</span>;
      case "CLOSED":
        return <span className="badge bg-secondary">Closed</span>;
      case "REOPENED":
        return <span className="badge" style={{ backgroundColor: "#20C997", color: "#FFFFFF" }}>Reopened</span>;
      default:
        return <span className="badge bg-secondary">{status}</span>;
    }
  };

  return (
    <div className="container-fluid py-4" style={{ backgroundColor: "#F5F7F6" }}>
      {/* Welcome Banner */}
      <div
        className="card border-0 shadow-sm mb-4"
        style={{
          borderRadius: "8px",
          background: "linear-gradient(135deg, #006B3C 0%, #0B7A46 100%)",
          color: "#FFFFFF",
        }}
      >
        <div className="card-body p-4 d-flex justify-content-between align-items-center flex-wrap gap-3">
          <div>
            <h2 className="h4 fw-bold mb-1">
              Welcome back, {user?.name ?? "IT Staff"}!
            </h2>
            <p className="mb-0 text-white-50">
              Here&apos;s what&apos;s happening with your queue today.
            </p>
          </div>
          <button
            type="button"
            className="btn btn-outline-light btn-sm px-3"
            onClick={fetchDashboard}
            disabled={loading}
          >
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>

      {loading && (
        <div className="text-center py-5 text-muted">
          <div className="spinner-border text-success me-2" role="status" />
          Loading dashboard metrics...
        </div>
      )}

      {error && (
        <div className="alert alert-danger py-2 mb-4" role="alert">
          {error}
        </div>
      )}

      {!loading && (
        <>
          {/* 5 Metric Cards Row */}
          <div className="row g-3 mb-4">
            {/* Card 1: Unassigned */}
            <div className="col-12 col-sm-6 col-lg">
              <div
                className="card h-100 border-0 shadow-sm p-3 text-center"
                style={{
                  borderRadius: "8px",
                  cursor: "pointer",
                  backgroundColor: "#FFFFFF",
                  borderLeft: "4px solid #006B3C",
                  transition: "transform 0.15s ease",
                }}
                onClick={() => onDrillDown?.({ unassigned: true })}
                role="button"
                tabIndex={0}
                aria-label="Filter queue by Unassigned"
                data-testid="metric-unassigned"
              >
                <div className="small text-muted fw-semibold text-uppercase">
                  Unassigned
                </div>
                <div
                  className="display-6 fw-bold my-2"
                  style={{ color: "#006B3C" }}
                >
                  {metrics.unassignedCount}
                </div>
                <div className="extra-small text-muted">Awaiting assignment</div>
              </div>
            </div>

            {/* Card 2: Open */}
            <div className="col-12 col-sm-6 col-lg">
              <div
                className="card h-100 border-0 shadow-sm p-3 text-center"
                style={{
                  borderRadius: "8px",
                  cursor: "pointer",
                  backgroundColor: "#FFFFFF",
                  borderLeft: "4px solid #6F42C1",
                }}
                onClick={() => onDrillDown?.({ status: "OPEN" })}
                role="button"
                tabIndex={0}
                aria-label="Filter queue by Open"
                data-testid="metric-open"
              >
                <div className="small text-muted fw-semibold text-uppercase">
                  Open
                </div>
                <div
                  className="display-6 fw-bold my-2"
                  style={{ color: "#6F42C1" }}
                >
                  {metrics.openCount}
                </div>
                <div className="extra-small text-muted">Triaged requests</div>
              </div>
            </div>

            {/* Card 3: In Progress */}
            <div className="col-12 col-sm-6 col-lg">
              <div
                className="card h-100 border-0 shadow-sm p-3 text-center"
                style={{
                  borderRadius: "8px",
                  cursor: "pointer",
                  backgroundColor: "#FFFFFF",
                  borderLeft: "4px solid #FD7E14",
                }}
                onClick={() => onDrillDown?.({ status: "IN_PROGRESS" })}
                role="button"
                tabIndex={0}
                aria-label="Filter queue by In Progress"
                data-testid="metric-in-progress"
              >
                <div className="small text-muted fw-semibold text-uppercase">
                  In Progress
                </div>
                <div
                  className="display-6 fw-bold my-2"
                  style={{ color: "#FD7E14" }}
                >
                  {metrics.inProgressCount}
                </div>
                <div className="extra-small text-muted">Actively being worked</div>
              </div>
            </div>

            {/* Card 4: Waiting for Requester */}
            <div className="col-12 col-sm-6 col-lg">
              <div
                className="card h-100 border-0 shadow-sm p-3 text-center"
                style={{
                  borderRadius: "8px",
                  cursor: "pointer",
                  backgroundColor: "#FFFFFF",
                  borderLeft: "4px solid #FFC107",
                }}
                onClick={() => onDrillDown?.({ status: "WAITING_FOR_REQUESTER" })}
                role="button"
                tabIndex={0}
                aria-label="Filter queue by Waiting for Requester"
                data-testid="metric-waiting-requester"
              >
                <div className="small text-muted fw-semibold text-uppercase">
                  Waiting for Requester
                </div>
                <div
                  className="display-6 fw-bold my-2"
                  style={{ color: "#B78103" }}
                >
                  {metrics.waitingRequesterCount}
                </div>
                <div className="extra-small text-muted">Awaiting customer reply</div>
              </div>
            </div>

            {/* Card 5: Assigned to Me / My Assigned */}
            <div className="col-12 col-sm-6 col-lg">
              <div
                className="card h-100 border-0 shadow-sm p-3 text-center"
                style={{
                  borderRadius: "8px",
                  cursor: "pointer",
                  backgroundColor: "#EAF6EF",
                  borderLeft: "4px solid #006B3C",
                }}
                onClick={() => onDrillDown?.({ assignment: "ME" })}
                role="button"
                tabIndex={0}
                aria-label="Filter queue by Assigned to Me"
                data-testid="metric-assigned-to-me"
              >
                <div className="small text-muted fw-semibold text-uppercase">
                  Assigned to Me
                </div>
                <div
                  className="display-6 fw-bold my-2"
                  style={{ color: "#006B3C" }}
                >
                  {metrics.myAssignedCount}
                </div>
                <div className="extra-small text-muted">In my personal queue</div>
              </div>
            </div>
          </div>

          {/* Main 2-Column Section: Recent Tickets & Quick Actions */}
          <div className="row g-4">
            {/* Left Column: My Recent Tickets */}
            <div className="col-12 col-lg-8">
              <div className="card border-0 shadow-sm" style={{ borderRadius: "8px" }}>
                <div
                  className="card-header py-3 d-flex justify-content-between align-items-center"
                  style={{ backgroundColor: "#FFFFFF", borderBottom: "1px solid #E0E6E3" }}
                >
                  <h5 className="mb-0 fw-bold" style={{ color: "#1A3326" }}>
                    My Recent Tickets
                  </h5>
                  <button
                    type="button"
                    className="btn btn-sm btn-link text-decoration-none"
                    style={{ color: "#006B3C" }}
                    onClick={onMyQueue}
                  >
                    View all &rarr;
                  </button>
                </div>

                <div className="card-body p-0">
                  {recentTickets.length === 0 ? (
                    <div className="text-center py-5 text-muted">
                      No recent tickets available.
                    </div>
                  ) : (
                    <div className="list-group list-group-flush">
                      {recentTickets.map((t: any) => (
                        <div
                          key={t.id}
                          className="list-group-item list-group-item-action d-flex justify-content-between align-items-center p-3"
                          style={{ cursor: "pointer" }}
                          onClick={() => onSelectTicket?.(t.id)}
                          role="button"
                          tabIndex={0}
                        >
                          <div>
                            <div className="d-flex align-items-center gap-2 mb-1">
                              <span className="fw-bold" style={{ color: "#006B3C" }}>
                                {t.ticketNo ?? t.ticketNumber}
                              </span>
                              {getStatusBadge(t.status)}
                            </div>
                            <div className="text-dark fw-medium">{t.summary}</div>
                          </div>
                          <div className="text-end text-muted small">
                            {t.updatedAt ? new Date(t.updatedAt).toLocaleDateString() : ""}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Quick Actions */}
            <div className="col-12 col-lg-4">
              <div className="card border-0 shadow-sm" style={{ borderRadius: "8px" }}>
                <div
                  className="card-header py-3"
                  style={{ backgroundColor: "#FFFFFF", borderBottom: "1px solid #E0E6E3" }}
                >
                  <h5 className="mb-0 fw-bold" style={{ color: "#1A3326" }}>
                    Quick Actions
                  </h5>
                </div>
                <div className="card-body p-3 vstack gap-2">
                  <button
                    type="button"
                    className="btn text-white w-100 text-start py-2 d-flex align-items-center gap-2 fw-semibold"
                    style={{ backgroundColor: "#006B3C", borderColor: "#006B3C" }}
                    onClick={onCreateTicket}
                  >
                    <span>➕</span>
                    <span>Create Ticket</span>
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-secondary w-100 text-start py-2 d-flex align-items-center gap-2"
                    onClick={onSearchTickets}
                  >
                    <span>🔍</span>
                    <span>Search Tickets</span>
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-secondary w-100 text-start py-2 d-flex align-items-center gap-2"
                    onClick={onMyQueue}
                  >
                    <span>📋</span>
                    <span>My Queue</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
