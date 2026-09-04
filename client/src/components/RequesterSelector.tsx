import { useEffect, useState } from "react";
import { getRequesters, Requester } from "../api.js";
import { useRequester } from "../contexts/RequesterContext.js";

export default function RequesterSelector() {
  const [requesters, setRequesters] = useState<Requester[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { setRequester } = useRequester();

  useEffect(() => {
    getRequesters()
      .then((data) => {
        setRequesters(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border text-success" />
      </div>
    );
  }

  if (error) {
    return <div className="alert alert-danger mt-5">Error: {error}</div>;
  }

  return (
    <div className="container py-5" style={{ maxWidth: 640 }}>
      <div className="card shadow-sm border-0">
        <div className="card-header bg-success text-white text-center py-3">
          <h2 className="h4 mb-0">Select Development Requester</h2>
        </div>
        <div className="card-body p-4 text-center">
          <p className="text-muted mb-4">
            Select an active requester identity to mock login and start managing tickets.
          </p>
          <div className="d-grid gap-3">
            {requesters.map((req) => (
              <button
                key={req.id}
                className="btn btn-outline-success btn-lg"
                onClick={() => setRequester(req)}
              >
                {req.name} <br />
                <small style={{ fontSize: "0.65em" }}>{req.email}</small>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
