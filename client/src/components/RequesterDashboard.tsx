import { useState, useEffect } from "react";
import { getRequesterDashboard } from "../api.js";
import { useAuth } from "../contexts/AuthContext.js";

export interface RequesterDashboardProps {
  initialData?: any;
  onSelectTicket?: (ticketId: number) => void;
  onCreateTicket?: () => void;
  onViewMyTickets?: () => void;
}

export function RequesterDashboard({
  initialData,
  onSelectTicket,
  onCreateTicket,
  onViewMyTickets,
}: RequesterDashboardProps) {
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
      const res = await getRequesterDashboard();
      setDashboardData(res.data);
    } catch (err: any) {
      setError(err.message || "Failed to load requester dashboard");
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
    totalOpen: 0,
    inProgressCount: 0,
    waitingOnMeCount: 0,
    resolvedCount: 0,
    closedCount: 0,
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
              Welcome, {user?.name ?? "Requester"}!
            </h2>
            <p className="mb-0 text-white-50">
              Here&apos;s the latest on your requests.
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
          {/* 4 Requester Metric Cards Row */}
          <div className="row g-3 mb-4">
            {/* Card 1: Open / My Open Tickets */}
            <div className="col-12 col-sm-6 col-md-3">
              <div
                className="card h-100 border-0 shadow-sm p-3 text-center"
                style={{
                  borderRadius: "8px",
                  backgroundColor: "#FFFFFF",
                  borderLeft: "4px solid #006B3C",
                }}
                data-testid="metric-open"
              >
                <div className="small text-muted fw-semibold text-uppercase">
                  Open
                </div>
                <div
                  className="display-6 fw-bold my-2"
                  style={{ color: "#006B3C" }}
                >
                  {metrics.totalOpen ?? 0}
                </div>
                <div className="extra-small text-muted">Active requests</div>
              </div>
            </div>

            {/* Card 2: Waiting on Me */}
            <div className="col-12 col-sm-6 col-md-3">
              <div
                className="card h-100 border-0 shadow-sm p-3 text-center"
                style={{
                  borderRadius: "8px",
                  backgroundColor: "#FFFFFF",
                  borderLeft: "4px solid #FFC107",
                }}
                data-testid="metric-waiting-on-me"
              >
                <div className="small text-muted fw-semibold text-uppercase">
                  Waiting on Me
                </div>
                <div
                  className="display-6 fw-bold my-2"
                  style={{ color: "#B78103" }}
                >
                  {metrics.waitingOnMeCount ?? 0}
                </div>
                <div className="extra-small text-muted">Action needed</div>
              </div>
            </div>

            {/* Card 3: Resolved */}
            <div className="col-12 col-sm-6 col-md-3">
              <div
                className="card h-100 border-0 shadow-sm p-3 text-center"
                style={{
                  borderRadius: "8px",
                  backgroundColor: "#FFFFFF",
                  borderLeft: "4px solid #0B7A46",
                }}
                data-testid="metric-resolved"
              >
                <div className="small text-muted fw-semibold text-uppercase">
                  Resolved
                </div>
                <div
                  className="display-6 fw-bold my-2"
                  style={{ color: "#0B7A46" }}
                >
                  {metrics.resolvedCount ?? 0}
                </div>
                <div className="extra-small text-muted">Successfully solved</div>
              </div>
            </div>

            {/* Card 4: Closed */}
            <div className="col-12 col-sm-6 col-md-3">
              <div
                className="card h-100 border-0 shadow-sm p-3 text-center"
                style={{
                  borderRadius: "8px",
                  backgroundColor: "#FFFFFF",
                  borderLeft: "4px solid #6C757D",
                }}
                data-testid="metric-closed"
              >
                <div className="small text-muted fw-semibold text-uppercase">
                  Closed
                </div>
                <div
                  className="display-6 fw-bold my-2"
                  style={{ color: "#6C757D" }}
                >
                  {metrics.closedCount ?? 0}
                </div>
                <div className="extra-small text-muted">Archived requests</div>
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
                    onClick={onViewMyTickets}
                  >
                    View all &rarr;
                  </button>
                </div>

                <div className="card-body p-0">
                  {recentTickets.length === 0 ? (
                    <div className="text-center py-5 text-muted">
                      No recent tickets found.
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-hover align-middle mb-0">
                        <thead className="table-light">
                          <tr style={{ color: "#5C6F64", fontSize: "0.875rem" }}>
                            <th>Ticket #</th>
                            <th>Summary</th>
                            <th>Status</th>
                            <th>Date</th>
                            <th style={{ width: "12%", textAlign: "center" }}>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {recentTickets.map((t: any) => (
                            <tr key={t.id}>
                              <td className="fw-bold" style={{ color: "#006B3C" }}>
                                {t.ticketNo ?? t.ticketNumber}
                              </td>
                              <td className="text-break">{t.summary}</td>
                              <td>{getStatusBadge(t.status)}</td>
                              <td className="small text-muted text-nowrap">
                                {t.createdAt ? new Date(t.createdAt).toLocaleDateString() : ""}
                              </td>
                              <td className="text-center">
                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline-success py-0 px-2"
                                  onClick={() => onSelectTicket?.(t.id)}
                                >
                                  View
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
                    onClick={onViewMyTickets}
                  >
                    <span>📋</span>
                    <span>View My Tickets</span>
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
