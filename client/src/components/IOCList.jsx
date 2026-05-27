import React, { useState, useEffect } from "react";
import { getAllIOCs } from "../api/iocApi";
import { Search, ChevronLeft, ChevronRight, SlidersHorizontal } from "lucide-react";

function IOCList({ onSelectIOC }) {
  const [iocs, setIocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [severity, setSeverity] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [count, setCount] = useState(0);

  const fetchIOCs = async () => {
    try {
      setLoading(true);
      const data = await getAllIOCs({
        search,
        type,
        severity,
        status,
        page,
        limit: 10
      });
      if (data.success) {
        setIocs(data.iocs);
        setTotalPages(data.pages);
        setCount(data.count);
      }
    } catch (error) {
      console.error("Failed to fetch indicators list:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIOCs();
  }, [type, severity, status, page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchIOCs();
  };

  return (
    <div className="glass-card no-hover">
      {/* Filtering Section */}
      {/* Filtering Section: Redesigned as a glass capsule */}
      <form onSubmit={handleSearchSubmit} className="history-filter-capsule">
        <div className="filter-input-wrapper">
          <Search size={18} className="filter-search-icon" />
          <input 
            type="text" 
            placeholder="Search indicator value..." 
            className="filter-search-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="filter-capsule-divider"></div>
        
        <select className="filter-select" value={type} onChange={(e) => { setType(e.target.value); setPage(1); }}>
          <option value="">All Types</option>
          <option value="ip">IP</option>
          <option value="domain">Domain</option>
          <option value="url">URL</option>
          <option value="hash">Hash</option>
        </select>
        <div className="filter-capsule-divider"></div>

        <select className="filter-select" value={severity} onChange={(e) => { setSeverity(e.target.value); setPage(1); }}>
          <option value="">All Severities</option>
          <option value="Critical">Critical</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
          <option value="Informational">Informational</option>
        </select>
        <div className="filter-capsule-divider"></div>

        <select className="filter-select" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="false_positive">False Positive</option>
          <option value="whitelisted">Whitelisted</option>
        </select>

        <button type="submit" className="filter-btn">
          Filter
        </button>
      </form>

      {/* Main Table */}
      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "300px" }}>
          <div className="loading-spinner"></div>
        </div>
      ) : iocs.length === 0 ? (
        <div style={{ padding: "80px", textAlign: "center", color: "var(--text-muted)" }}>
          No indicators matched your search filters. Try resetting.
        </div>
      ) : (
        <>
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Indicator Value</th>
                  <th>Type</th>
                  <th>Severity</th>
                  <th>Status</th>
                  <th>Detections (VT)</th>
                  <th>Pulses (OTX)</th>
                  <th>Date Enriched</th>
                </tr>
              </thead>
              <tbody>
                {iocs.map((ioc) => (
                  <tr key={ioc._id} onClick={() => onSelectIOC(ioc._id)}>
                    <td className="mono" style={{ fontWeight: 600, color: "#cbd5e1", wordBreak: "break-all" }}>
                      {ioc.value}
                    </td>
                    <td>
                      <span className="badge-type">{ioc.type}</span>
                    </td>
                    <td>
                      <span className={`badge-sev ${ioc.severity.toLowerCase()}`}>
                        {ioc.severity}
                      </span>
                    </td>
                    <td>
                      <span className={`badge-status ${ioc.status}`}>
                        {ioc.status}
                      </span>
                    </td>
                    <td>
                      {ioc.virustotal ? (
                        <span style={{ color: ioc.virustotal.maliciousCount > 0 ? "var(--sev-critical)" : "#10b981", fontWeight: 600 }}>
                          {ioc.virustotal.maliciousCount}
                        </span>
                      ) : "—"}
                    </td>
                    <td>
                      <span style={{ fontWeight: 600 }}>
                        {ioc.otx?.pulseCount ?? "—"}
                      </span>
                    </td>
                    <td style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>
                      {new Date(ioc.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "24px" }}>
            <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
              Showing {iocs.length} of {count} indicators
            </div>

            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <button 
                disabled={page === 1}
                onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                className="capsule-btn-secondary" 
                style={{ padding: "8px 14px", borderRadius: "9999px" }}
              >
                <ChevronLeft size={16} />
              </button>
              <span style={{ fontSize: "0.9rem", fontWeight: 600, padding: "0 8px" }}>
                Page {page} of {totalPages}
              </span>
              <button 
                disabled={page === totalPages}
                onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                className="capsule-btn-secondary" 
                style={{ padding: "8px 14px", borderRadius: "9999px" }}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default IOCList;
