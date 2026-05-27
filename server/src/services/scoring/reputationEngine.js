exports.calculateReputation = (type, vtData, otxData, abuseipdbData = null, shodanData = null) => {
    let score = 0;
    const weights = {
        ip: { vt: 0.3, otx: 0.2, abuse: 0.4, shodan: 0.1 },
        domain: { vt: 0.6, otx: 0.4 },
        url: { vt: 0.6, otx: 0.4 },
        hash: { vt: 0.7, otx: 0.3 }
    };

    const typeWeights = weights[type] || weights.ip;

    // 1. VirusTotal Score (0 to 100)
    let vtScore = 0;
    if (vtData) {
        const malicious = vtData.maliciousCount || 0;
        const suspicious = vtData.suspiciousCount || 0;
        
        if (malicious > 0) {
            // 5 or more malicious detections is considered 100% malicious
            vtScore = Math.min((malicious / 5) * 100, 100);
        } else if (suspicious > 0) {
            vtScore = Math.min((suspicious / 5) * 50, 50);
        }
    }

    // 2. OTX Score (0 to 100)
    let otxScore = 0;
    if (otxData) {
        const pulses = otxData.pulseCount || 0;
        if (pulses > 0) {
            // 10 or more pulses is considered 100% match
            otxScore = Math.min((pulses / 10) * 100, 100);
        }
    }

    // 3. AbuseIPDB Score (0 to 100) - Only for IP
    let abuseScore = 0;
    if (type === "ip" && abuseipdbData) {
        abuseScore = abuseipdbData.abuseConfidenceScore || 0;
    }

    // 4. Shodan Score (0 to 100) - Only for IP
    let shodanScore = 0;
    if (type === "ip" && shodanData) {
        const vulns = shodanData.vulns || [];
        const ports = shodanData.ports || [];
        
        // Vulns add high threat, open ports add minor threat indicator if high-risk ports
        if (vulns.length > 0) {
            shodanScore = Math.min(vulns.length * 30, 100);
        } else if (ports.includes(23) || ports.includes(3389) || ports.includes(445)) {
            // telnet, rdp, smb exposed
            shodanScore = 30;
        } else if (ports.length > 0) {
            shodanScore = 10;
        }
    }

    // Calculate weighted score
    if (type === "ip") {
        score = (vtScore * typeWeights.vt) + 
                (otxScore * typeWeights.otx) + 
                (abuseScore * typeWeights.abuse) + 
                (shodanScore * typeWeights.shodan);
    } else {
        score = (vtScore * typeWeights.vt) + 
                (otxScore * typeWeights.otx);
    }

    score = Math.round(score);

    // Determine severity based on score
    let severity = "Informational";
    if (score >= 75) {
        severity = "Critical";
    } else if (score >= 50) {
        severity = "High";
    } else if (score >= 25) {
        severity = "Medium";
    } else if (score >= 5) {
        severity = "Low";
    }

    return {
        score,
        severity,
        breakdown: {
            vtScore,
            otxScore,
            abuseScore: type === "ip" ? abuseScore : undefined,
            shodanScore: type === "ip" ? shodanScore : undefined
        }
    };
};
