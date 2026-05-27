exports.generateHTML = (ioc, mitreMappings = [], correlationList = []) => {
    const formattedDate = new Date(ioc.createdAt || Date.now()).toLocaleString();
    const statusClass = ioc.status === "active" ? "status-active" : ioc.status === "whitelisted" ? "status-white" : "status-fp";
    const severityClass = `sev-${ioc.severity.toLowerCase()}`;

    const tagsHtml = (ioc.tags || []).map(tag => `<span class="tag">${tag}</span>`).join(" ");
    
    // VT Details
    const vtDetections = ioc.virustotal ? `${ioc.virustotal.maliciousCount} / ${ioc.virustotal.maliciousCount + (ioc.virustotal.suspiciousCount || 0)}` : "No Detections";
    
    // OTX Details
    const otxPulsesHtml = (ioc.otx?.pulses || []).slice(0, 5).map(pulse => `
        <div class="card pulse-item">
            <strong>${pulse.name}</strong>
            <p style="margin: 4px 0 0 0; font-size: 0.85em; color: #a0aec0;">Created: ${new Date(pulse.created).toLocaleDateString()}</p>
        </div>
    `).join("") || "<p>No pulse intelligence associated.</p>";

    // AbuseIPDB Details
    const abuseHtml = ioc.abuseipdb ? `
        <div class="card">
            <h3>AbuseIPDB Reputation</h3>
            <p><strong>Confidence Score:</strong> ${ioc.abuseipdb.abuseConfidenceScore}%</p>
            <p><strong>Total Reports:</strong> ${ioc.abuseipdb.totalReports}</p>
            <p><strong>Country:</strong> ${ioc.abuseipdb.countryName || "N/A"} (${ioc.abuseipdb.countryCode || "N/A"})</p>
            <p><strong>ISP:</strong> ${ioc.abuseipdb.isp || "N/A"}</p>
        </div>
    ` : "";

    // Shodan Details
    const shodanHtml = ioc.shodan ? `
        <div class="card">
            <h3>Shodan Recon</h3>
            <p><strong>ISP:</strong> ${ioc.shodan.isp || "N/A"}</p>
            <p><strong>OS:</strong> ${ioc.shodan.os || "N/A"}</p>
            <p><strong>Open Ports:</strong> ${ioc.shodan.ports?.join(", ") || "None found"}</p>
            ${ioc.shodan.vulns?.length > 0 ? `<p><strong>Vulnerabilities:</strong> <span style="color: #f56565;">${ioc.shodan.vulns.join(", ")}</span></p>` : ""}
        </div>
    ` : "";

    // MITRE HTML
    const mitreHtml = mitreMappings.map(m => `
        <div class="mitre-item">
            <span class="mitre-badge">${m.id}</span>
            <strong>${m.name}</strong> (${m.tactic})
            <p style="margin: 4px 0 0 0; font-size: 0.9em; color: #cbd5e0;">${m.description}</p>
        </div>
    `).join("") || "<p>No specific MITRE ATT&CK techniques mapped.</p>";

    // Correlation HTML
    const correlationHtml = correlationList.map(c => `
        <div class="correlation-item">
            <span class="sev-badge sev-${c.ioc.severity.toLowerCase()}">${c.ioc.type.toUpperCase()}: ${c.ioc.value}</span>
            <p style="margin: 4px 0 0 0; font-size: 0.9em;">${c.description}</p>
        </div>
    `).join("") || "<p>No correlation with other indicators found in local DB.</p>";

    // Notes HTML
    const notesHtml = (ioc.notes || []).map(note => `
        <div class="note-item">
            <div style="display: flex; justify-content: space-between; font-size: 0.85em; color: #a0aec0; margin-bottom: 4px;">
                <span>Analyst: <strong>${note.analyst}</strong></span>
                <span>${new Date(note.createdAt).toLocaleString()}</span>
            </div>
            <p style="margin: 0; font-size: 0.95em;">${note.text}</p>
        </div>
    `).join("") || "<p>No analyst notes recorded.</p>";

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Threat Forge Intel Report - ${ioc.value}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            background-color: #0f172a;
            color: #f1f5f9;
            margin: 0;
            padding: 24px;
            line-height: 1.5;
        }
        .container {
            max-width: 1000px;
            margin: 0 auto;
        }
        header {
            border-bottom: 2px solid #1e293b;
            padding-bottom: 20px;
            margin-bottom: 30px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .logo {
            font-size: 1.8em;
            font-weight: 800;
            letter-spacing: -0.5px;
            color: #38bdf8;
        }
        .report-meta {
            text-align: right;
            font-size: 0.9em;
            color: #94a3b8;
        }
        .main-info {
            display: grid;
            grid-template-columns: 2fr 1fr;
            gap: 24px;
            margin-bottom: 30px;
        }
        .card {
            background-color: #1e293b;
            border-radius: 12px;
            padding: 24px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
            border: 1px solid #334155;
            margin-bottom: 24px;
        }
        h1, h2, h3 {
            margin-top: 0;
            color: #f8fafc;
        }
        h2 {
            border-bottom: 1px solid #334155;
            padding-bottom: 10px;
            margin-bottom: 20px;
            font-size: 1.4em;
        }
        .ioc-header {
            display: flex;
            align-items: center;
            gap: 12px;
            flex-wrap: wrap;
            margin-bottom: 16px;
        }
        .ioc-value {
            font-size: 1.6em;
            font-weight: 700;
            font-family: monospace;
            word-break: break-all;
        }
        .badge {
            padding: 4px 10px;
            border-radius: 9999px;
            font-size: 0.85em;
            font-weight: 600;
            text-transform: uppercase;
        }
        .status-active { background-color: #ef4444; color: white; }
        .status-white { background-color: #10b981; color: white; }
        .status-fp { background-color: #f59e0b; color: white; }
        
        .sev-critical { background-color: #7f1d1d; color: #fecaca; border: 1px solid #b91c1c; }
        .sev-high { background-color: #9a3412; color: #ffedd5; border: 1px solid #ea580c; }
        .sev-medium { background-color: #854d0e; color: #fef9c3; border: 1px solid #ca8a04; }
        .sev-low { background-color: #1e3a8a; color: #dbeafe; border: 1px solid #2563eb; }
        .sev-informational { background-color: #334155; color: #f1f5f9; border: 1px solid #475569; }

        .grid-2 {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
        }
        .tag {
            background-color: #334155;
            color: #cbd5e0;
            padding: 3px 8px;
            border-radius: 4px;
            font-size: 0.85em;
        }
        .pulse-item {
            border-left: 4px solid #ea580c;
            padding: 12px;
            margin-bottom: 12px;
            background-color: #0f172a;
        }
        .mitre-item, .correlation-item, .note-item {
            background-color: #0f172a;
            border: 1px solid #334155;
            padding: 16px;
            border-radius: 8px;
            margin-bottom: 12px;
        }
        .mitre-badge {
            background-color: #38bdf8;
            color: #0f172a;
            font-family: monospace;
            padding: 2px 6px;
            border-radius: 4px;
            font-weight: 700;
            font-size: 0.9em;
            margin-right: 8px;
        }
        .sev-badge {
            display: inline-block;
            padding: 2px 8px;
            border-radius: 4px;
            font-size: 0.8em;
            font-weight: 600;
            font-family: monospace;
            margin-bottom: 6px;
        }
        footer {
            margin-top: 50px;
            border-top: 1px solid #334155;
            padding-top: 20px;
            text-align: center;
            color: #64748b;
            font-size: 0.85em;
        }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <div class="logo">Threat Forge</div>
            <div class="report-meta">
                <div>Threat Intelligence Report</div>
                <div>Generated: ${formattedDate}</div>
            </div>
        </header>

        <div class="main-info">
            <div>
                <div class="card">
                    <div class="ioc-header">
                        <span class="badge ${statusClass}">${ioc.status}</span>
                        <span class="badge sev-${ioc.severity.toLowerCase()}">${ioc.severity} Severity</span>
                        <span style="color: #94a3b8; font-family: monospace; text-transform: uppercase;">${ioc.type}</span>
                    </div>
                    <div class="ioc-value">${ioc.value}</div>
                    <div style="margin-top: 16px;">
                        <strong>Tags:</strong> ${tagsHtml || "None"}
                    </div>
                </div>

                <div class="card">
                    <h2>Enrichment Details</h2>
                    <div class="grid-2">
                        <div>
                            <h3>VirusTotal</h3>
                            <p><strong>Detections:</strong> <span style="font-size: 1.1em; font-weight: 700; color: ${ioc.virustotal?.maliciousCount > 0 ? '#ef4444' : '#10b981'};">${vtDetections}</span></p>
                            <p><strong>Reputation Score:</strong> ${ioc.virustotal?.reputation ?? "N/A"}</p>
                            <p><strong>Last Scan:</strong> ${ioc.virustotal?.lastAnalysis ? new Date(ioc.virustotal.lastAnalysis * 1000).toLocaleDateString() : "N/A"}</p>
                        </div>
                        <div>
                            <h3>AlienVault OTX</h3>
                            <p><strong>Associated Pulses:</strong> ${ioc.otx?.pulseCount || 0}</p>
                        </div>
                    </div>
                </div>

                ${abuseHtml || shodanHtml ? `
                <div class="card">
                    <h2>Infrastructure Recon</h2>
                    <div class="grid-2">
                        ${abuseHtml}
                        ${shodanHtml}
                    </div>
                </div>
                ` : ""}

                <div class="card">
                    <h2>MITRE ATT&CK Mappings</h2>
                    ${mitreHtml}
                </div>
            </div>

            <div>
                <div class="card">
                    <h2>Threat Correlation</h2>
                    ${correlationHtml}
                </div>

                <div class="card">
                    <h2>Analyst Notes</h2>
                    ${notesHtml}
                </div>
            </div>
        </div>

        <footer>
            Threat Forge Platform &bull; Transforming raw IOCs into actionable intelligence &bull; &copy; 2026
        </footer>
    </div>
</body>
</html>
    `;
};
