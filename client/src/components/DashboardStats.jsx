import React from "react";
import { 
  ShieldAlert, 
  Globe, 
  Terminal, 
  Activity, 
  Clock, 
  ChevronRight,
  TrendingUp,
  AlertOctagon,
  ShieldCheck,
  AlertTriangle
} from "lucide-react";

function DashboardStats({ stats, recent, loading, onSelectIOC, onRefresh }) {
  if (loading || !stats) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "300px" }}>
        <div className="loading-spinner"></div>
      </div>
    );
  }

  const { total, severity, type, status } = stats;

  const severityColors = {
    Critical: "var(--sev-critical)",
    High: "var(--sev-high)",
    Medium: "var(--sev-medium)",
    Low: "var(--sev-low)",
    Informational: "var(--sev-info)"
  };

  const getPercentage = (value) => {
    if (total === 0) return 0;
    return Math.round((value / total) * 100);
  };

  return (
    <div>
      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="glass-card stat-card">
          <div>
            <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: 600, textTransform: "uppercase" }}>Total Indicators</span>
            <div className="stat-val">{total}</div>
          </div>
          <div className="stat-icon" style={{ color: "var(--color-primary)" }}>
            <Activity size={24} />
          </div>
        </div>

        <div className="glass-card stat-card" style={{ borderLeft: "3px solid var(--sev-critical)" }}>
          <div>
            <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: 600, textTransform: "uppercase" }}>Critical Threats</span>
            <div className="stat-val" style={{ color: "var(--sev-critical)" }}>{severity.Critical}</div>
          </div>
          <div className="stat-icon" style={{ color: "var(--sev-critical)" }}>
            <AlertOctagon size={24} />
          </div>
        </div>

        <div className="glass-card stat-card" style={{ borderLeft: "3px solid var(--sev-high)" }}>
          <div>
            <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: 600, textTransform: "uppercase" }}>High Risk</span>
            <div className="stat-val" style={{ color: "var(--sev-high)" }}>{severity.High}</div>
          </div>
          <div className="stat-icon" style={{ color: "var(--sev-high)" }}>
            <AlertTriangle size={24} />
          </div>
        </div>

        <div className="glass-card stat-card" style={{ borderLeft: "3px solid #10b981" }}>
          <div>
            <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: 600, textTransform: "uppercase" }}>Active Watchlist</span>
            <div className="stat-val" style={{ color: "#10b981" }}>{status.active}</div>
          </div>
          <div className="stat-icon" style={{ color: "#10b981" }}>
            <ShieldCheck size={24} />
          </div>
        </div>
      </div>

      {/* Visual Analytics */}
      <div className="dashboard-grid" style={{ marginBottom: "32px" }}>
        {/* Severity Breakdown progress bars */}
        <div className="glass-card">
          <h3 className="section-title">
            <TrendingUp size={18} style={{ color: "var(--color-primary)" }} />
            Threat Level Analysis
          </h3>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {Object.entries(severity).map(([key, val]) => {
              const pct = getPercentage(val);
              return (
                <div key={key}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginBottom: "8px" }}>
                    <span style={{ fontWeight: 600, color: severityColors[key] }}>{key}</span>
                    <span style={{ color: "var(--text-secondary)" }}>{val} ({pct}%)</span>
                  </div>
                  <div style={{ height: "8px", width: "100%", backgroundColor: "rgba(255,255,255,0.03)", borderRadius: "4px", overflow: "hidden" }}>
                    <div style={{ 
                      height: "100%", 
                      width: `${pct}%`, 
                      backgroundColor: severityColors[key], 
                      borderRadius: "4px",
                      boxShadow: `0 0 10px ${severityColors[key]}40`
                    }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* IOC Type Breakdown circular/segment preview */}
        <div className="glass-card">
          <h3 className="section-title">
            <Globe size={18} style={{ color: "var(--color-primary)" }} />
            Infrastructure Type
          </h3>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "16px", justifyContent: "center", height: "calc(100% - 40px)" }}>
            {Object.entries(type).map(([key, val]) => {
              const pct = getPercentage(val);
              return (
                <div key={key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <span className="badge-type">{key}</span>
                    <span style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>{val} Indicators</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", width: "120px" }}>
                    <div style={{ height: "4px", width: "80px", backgroundColor: "rgba(255,255,255,0.03)", borderRadius: "2px", overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${pct}%`, backgroundColor: "var(--color-primary)" }}></div>
                    </div>
                    <span style={{ fontSize: "0.8rem", width: "30px", textAlign: "right" }}>{pct}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Intelligence Lookups */}
      <div className="glass-card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h3 className="section-title" style={{ marginBottom: 0, borderBottom: "none", paddingBottom: 0 }}>
            <Clock size={18} style={{ color: "var(--color-primary)" }} />
            Recent Enriched Indicators
          </h3>
          <button onClick={onRefresh} className="btn-primary" style={{ padding: "8px 14px", fontSize: "0.8rem", height: "32px", borderRadius: "8px" }}>
            Refresh
          </button>
        </div>

        {recent.length === 0 ? (
          <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)", fontSize: "0.95rem" }}>
            No threat indicators enriched yet. Start by submitting one in the quick lookup.
          </div>
        ) : (
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Indicator</th>
                  <th>Type</th>
                  <th>Severity</th>
                  <th>Status</th>
                  <th>Date Enriched</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {recent.map((ioc) => (
                  <tr key={ioc._id} onClick={() => onSelectIOC(ioc._id)}>
                    <td className="mono" style={{ fontWeight: 600, color: "#e2e8f0", wordBreak: "break-all" }}>
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
                    <td style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>
                      {new Date(ioc.createdAt).toLocaleString()}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <ChevronRight size={16} style={{ color: "var(--text-muted)" }} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default DashboardStats;
