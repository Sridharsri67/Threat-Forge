exports.exportToCSV = (iocs) => {
    const list = Array.isArray(iocs) ? iocs : [iocs];
    
    const headers = [
        "Type",
        "Value",
        "Severity",
        "Status",
        "VirusTotal Malicious Count",
        "OTX Pulse Count",
        "AbuseIPDB Confidence Score",
        "Tags",
        "Created At"
    ];

    const rows = list.map(ioc => {
        const vtMalicious = ioc.virustotal?.maliciousCount ?? "N/A";
        const otxPulses = ioc.otx?.pulseCount ?? "N/A";
        const abuseScore = ioc.abuseipdb?.abuseConfidenceScore ?? "N/A";
        const tags = (ioc.tags || []).join("; ");
        
        return [
            ioc.type,
            `"${ioc.value.replace(/"/g, '""')}"`,
            ioc.severity,
            ioc.status,
            vtMalicious,
            otxPulses,
            abuseScore,
            `"${tags.replace(/"/g, '""')}"`,
            ioc.createdAt ? new Date(ioc.createdAt).toISOString() : ""
        ];
    });

    return [headers.join(","), ...rows.map(row => row.join(","))].join("\n");
};
