import React, { useState } from "react";
import { bulkLookup } from "../api/iocApi";
import { Play, Clipboard, FileSpreadsheet, ShieldAlert, CheckCircle2, XCircle } from "lucide-react";

function BulkLookup({ onComplete }) {
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);

  const detectIOCType = (value) => {
    // Basic detection logic
    const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    const hashRegex = /^[a-f0-9]{32}$|^[a-f0-9]{40}$|^[a-f0-9]{64}$/i;
    
    if (ipv4Regex.test(value)) return "ip";
    if (hashRegex.test(value)) return "hash";
    if (value.startsWith("http://") || value.startsWith("https://")) return "url";
    return "domain";
  };

  const handleBulkSubmit = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    // Split by newlines, trim, filter out empty lines
    const lines = inputText.split("\n").map(l => l.trim()).filter(Boolean);
    const iocs = lines.map(val => ({
      value: val,
      type: detectIOCType(val)
    }));

    try {
      setLoading(true);
      const data = await bulkLookup(iocs);
      if (data.success) {
        setResults(data.results);
      } else {
        alert(data.message || "Bulk lookup failed.");
      }
    } catch (err) {
      console.error(err);
      alert("Error submitting bulk lookup.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card no-hover">
      <h3 className="section-title">
        <FileSpreadsheet size={18} style={{ color: "var(--color-primary)" }} />
        Instant Lookup
      </h3>

      {!results ? (
        <form onSubmit={handleBulkSubmit}>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: "16px" }}>
            Paste one indicator (IP address, Domain, URL, or Malware Hash) per line. The system will automatically detect the indicator type and query all active enrichment engines.
          </p>

          <textarea
            className="bulk-textarea"
            placeholder="Enter one threat indicator per line. Example:&#10;185.220.101.5&#10;malicious-c2.ru&#10;44d88612fea8a8f36de82e1278abb02f"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={loading}
          ></textarea>

          <div style={{ display: "flex", gap: "12px" }}>
            <button type="submit" className="capsule-btn" disabled={loading || !inputText.trim()}>
              {loading ? (
                <>
                  <div className="loading-spinner" style={{ width: "16px", height: "16px", borderWidth: "2px", borderLeftColor: "#ffffff", marginRight: "6px" }}></div>
                  Enriching Indicators...
                </>
              ) : (
                <>
                  <Play size={16} />
                  Initiate Bulk Enrichment
                </>
              )}
            </button>

            <button 
              type="button" 
              className="capsule-btn-secondary" 
              onClick={() => {
                setInputText("185.220.101.5\nbad-domain.com\n44d88612fe58c9b23b78c97f22341d2d\nhttps://evil-payload-site.ru/trojan.exe");
              }}
              disabled={loading}
            >
              <Clipboard size={16} />
              Load Sample Data
            </button>
          </div>
        </form>
      ) : (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <h4 style={{ fontSize: "1.1rem" }}>Enrichment Results ({results.length} Indicators)</h4>
            <div style={{ display: "flex", gap: "10px" }}>
               <button 
                onClick={() => setResults(null)} 
                className="capsule-btn-secondary"
              >
                Reset Form
              </button>
              <button onClick={onComplete} className="capsule-btn">
                Return to History
              </button>
            </div>
          </div>

          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Indicator</th>
                  <th>Detected Type</th>
                  <th>Status</th>
                  <th>Enrichment Outcome</th>
                </tr>
              </thead>
              <tbody>
                {results.map((res, index) => (
                  <tr key={index}>
                    <td className="mono" style={{ fontWeight: 600, color: "#cbd5e1", wordBreak: "break-all" }}>
                      {res.value}
                    </td>
                    <td>
                      <span className="badge-type">{res.type}</span>
                    </td>
                    <td>
                      {res.success ? (
                        <span className={`badge-sev ${res.severity.toLowerCase()}`}>
                          {res.severity}
                        </span>
                      ) : (
                        <span style={{ color: "var(--sev-critical)", display: "flex", alignItems: "center", gap: "4px", fontSize: "0.85rem" }}>
                          <XCircle size={14} /> Error
                        </span>
                      )}
                    </td>
                    <td>
                      {res.success ? (
                        <span style={{ color: "#10b981", display: "flex", alignItems: "center", gap: "6px", fontSize: "0.9rem" }}>
                          <CheckCircle2 size={16} /> Enriched (Score: {res.score}/100)
                        </span>
                      ) : (
                        <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
                          {res.error}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default BulkLookup;
