import React, { useState, useEffect } from "react";
import { ShieldAlert, ShieldCheck, Activity, Globe, AlertTriangle } from "lucide-react";

const ATTACK_VECTORS = [
  "SQL Injection Attempt",
  "Brute Force SSH Login",
  "C2 Beaconing Detected",
  "Phishing Domain Access",
  "Log4Shell Exploit Attempt",
  "Ransomware Payload Download",
  "DDoS Amplification Flood",
  "Kubernetes API Abuse",
  "XSS Injection Payload",
  "Unauthorized LDAP Query",
  "Port Scan Discovery",
  "Zero-Day exploit payload"
];

const COUNTRIES = [
  { code: "US", flag: "🇺🇸", name: "United States" },
  { code: "RU", flag: "🇷🇺", name: "Russia" },
  { code: "CN", flag: "🇨🇳", name: "China" },
  { code: "DE", flag: "🇩🇪", name: "Germany" },
  { code: "NL", flag: "🇳🇱", name: "Netherlands" },
  { code: "KP", flag: "🇰🇵", name: "North Korea" },
  { code: "IR", flag: "🇮🇷", name: "Iran" },
  { code: "GB", flag: "🇬🇧", name: "United Kingdom" },
  { code: "UA", flag: "🇺🇦", name: "Ukraine" },
  { code: "BR", flag: "🇧🇷", name: "Brazil" }
];

const SEVERITIES = ["Critical", "High", "Medium", "Low"];
const STATUSES = ["Blocked", "Mitigated", "Monitoring"];

export function LiveThreatFeed() {
  const [events, setEvents] = useState([]);
  const [advisories, setAdvisories] = useState([
    { id: "CVE-2026-0912", title: "Linux Kernel Local Privilege Escalation", severity: "High", date: "Just Now" },
    { id: "CVE-2026-1044", title: "OpenSSL Remote Code Execution Vulnerability", severity: "Critical", date: "10 mins ago" },
    { id: "CVE-2025-4921", title: "Kubernetes Ingress Controller Bypass", severity: "Medium", date: "1 hour ago" },
    { id: "CVE-2025-3882", title: "Apache Tomcat Session Hijacking bug", severity: "High", date: "3 hours ago" }
  ]);

  // Generate initial events
  useEffect(() => {
    const initialEvents = [];
    for (let i = 0; i < 6; i++) {
      initialEvents.push(generateRandomEvent(i));
    }
    setEvents(initialEvents);
  }, []);

  // Set up auto-update interval
  useEffect(() => {
    const interval = setInterval(() => {
      // Add new event at the top and slide down
      setEvents(prev => {
        const newEvent = generateRandomEvent(Date.now());
        return [newEvent, ...prev.slice(0, 5)];
      });

      // Randomly update an advisory or shift times
      if (Math.random() > 0.7) {
        setAdvisories(prev => {
          const ids = ["CVE-2026-1188", "CVE-2026-2004", "CVE-2026-3001"];
          const titles = [
            "Ivanti VPN Server Directory Traversal",
            "VMware vCenter Server Heap Overflow",
            "Windows Kernel Elevation of Privilege"
          ];
          const idx = Math.floor(Math.random() * ids.length);
          const newAdvisory = {
            id: ids[idx],
            title: titles[idx],
            severity: SEVERITIES[Math.floor(Math.random() * 2)],
            date: "Just Now"
          };
          return [newAdvisory, ...prev.filter(a => a.id !== newAdvisory.id).slice(0, 3)];
        });
      }
    }, 3500);

    return () => clearInterval(interval);
  }, []);

  const generateRandomEvent = (key) => {
    const country = COUNTRIES[Math.floor(Math.random() * COUNTRIES.length)];
    const vector = ATTACK_VECTORS[Math.floor(Math.random() * ATTACK_VECTORS.length)];
    const severity = SEVERITIES[Math.floor(Math.random() * SEVERITIES.length)];
    const status = STATUSES[Math.floor(Math.random() * STATUSES.length)];
    
    // Generate a random IP address
    const ip = `${Math.floor(Math.random() * 223) + 1}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 254) + 1}`;
    
    // Format timestamp
    const now = new Date();
    const timeStr = now.toTimeString().split(" ")[0];

    return {
      id: key,
      time: timeStr,
      ip,
      country,
      vector,
      severity,
      status
    };
  };

  const getSeverityStyle = (sev) => {
    switch (sev.toLowerCase()) {
      case "critical":
        return { color: "#ef4444", bg: "rgba(239, 68, 68, 0.15)", border: "1px solid rgba(239, 68, 68, 0.3)" };
      case "high":
        return { color: "#f97316", bg: "rgba(249, 115, 22, 0.15)", border: "1px solid rgba(249, 115, 22, 0.3)" };
      case "medium":
        return { color: "#eab308", bg: "rgba(234, 179, 8, 0.15)", border: "1px solid rgba(234, 179, 8, 0.3)" };
      default:
        return { color: "#3b82f6", bg: "rgba(59, 130, 246, 0.15)", border: "1px solid rgba(59, 130, 246, 0.3)" };
    }
  };

  const getStatusIcon = (status) => {
    if (status === "Blocked") {
      return <ShieldCheck size={13} style={{ color: "#10b981", marginRight: "4px" }} />;
    } else if (status === "Mitigated") {
      return <Activity size={13} style={{ color: "#3b82f6", marginRight: "4px" }} />;
    } else {
      return <AlertTriangle size={13} style={{ color: "#eab308", marginRight: "4px" }} />;
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", height: "100%" }}>
      {/* Real-time Attack Stream */}
      <div style={{ flex: 1.2, display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span className="pulse-indicator-dot"></span>
            <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-primary)", letterSpacing: "0.5px" }}>LIVE THREAT STREAM</span>
          </div>
          <span className="mono" style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>SIEM INGESTION ACTIVE</span>
        </div>

        <div className="table-container" style={{ overflowX: "auto", flex: 1 }}>
          <table className="custom-table" style={{ fontSize: "0.82rem" }}>
            <thead>
              <tr>
                <th style={{ padding: "8px 12px", fontSize: "0.75rem" }}>Time</th>
                <th style={{ padding: "8px 12px", fontSize: "0.75rem" }}>Attacking IP</th>
                <th style={{ padding: "8px 12px", fontSize: "0.75rem" }}>Target Vector</th>
                <th style={{ padding: "8px 12px", fontSize: "0.75rem" }}>Source</th>
                <th style={{ padding: "8px 12px", fontSize: "0.75rem" }}>Severity</th>
                <th style={{ padding: "8px 12px", fontSize: "0.75rem" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {events.map((e) => {
                const sevStyle = getSeverityStyle(e.severity);
                return (
                  <tr key={e.id} style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.04)" }}>
                    <td className="mono" style={{ padding: "10px 12px", color: "var(--text-muted)" }}>{e.time}</td>
                    <td className="mono" style={{ padding: "10px 12px", fontWeight: "600", color: "#e2e8f0" }}>{e.ip}</td>
                    <td style={{ padding: "10px 12px", color: "var(--text-secondary)" }}>{e.vector}</td>
                    <td style={{ padding: "10px 12px", color: "#cbd5e1" }}>
                      <span style={{ marginRight: "4px" }}>{e.country.flag}</span>
                      <span className="mono" style={{ fontSize: "0.75rem" }}>{e.country.code}</span>
                    </td>
                    <td style={{ padding: "10px 12px" }}>
                      <span style={{
                        padding: "2px 6px",
                        borderRadius: "4px",
                        fontSize: "0.7rem",
                        fontWeight: "700",
                        textTransform: "uppercase",
                        backgroundColor: sevStyle.bg,
                        color: sevStyle.color,
                        border: sevStyle.border
                      }}>
                        {e.severity}
                      </span>
                    </td>
                    <td style={{ padding: "10px 12px", display: "flex", alignItems: "center" }}>
                      {getStatusIcon(e.status)}
                      <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>{e.status}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Latest Advisories */}
      <div style={{ flex: 0.8, borderTop: "1px solid rgba(255, 255, 255, 0.06)", paddingTop: "14px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
          <ShieldAlert size={14} style={{ color: "var(--color-primary)" }} />
          <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-primary)", letterSpacing: "0.5px" }}>VULNERABILITY INTEL FEED</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {advisories.map((a) => {
            const sevStyle = getSeverityStyle(a.severity);
            return (
              <div key={a.id} style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "8px 12px",
                background: "rgba(255, 255, 255, 0.01)",
                border: "1px solid rgba(255, 255, 255, 0.04)",
                borderRadius: "8px"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span className="mono" style={{ fontSize: "0.78rem", fontWeight: "700", color: "var(--color-primary)" }}>{a.id}</span>
                  <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "250px" }}>
                    {a.title}
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{
                    padding: "1px 5px",
                    borderRadius: "4px",
                    fontSize: "0.65rem",
                    fontWeight: "700",
                    textTransform: "uppercase",
                    backgroundColor: sevStyle.bg,
                    color: sevStyle.color,
                    border: sevStyle.border
                  }}>
                    {a.severity}
                  </span>
                  <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>{a.date}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
