const inMemoryDB = require("../../models/iocStore");

exports.correlate = async (currentIOC) => {
    const correlations = [];
    const id = currentIOC._id;
    const type = currentIOC.type;
    const value = currentIOC.value;
    const tags = currentIOC.tags || [];

    // Find all other IOCs in our volatile in-memory database
    const allIOCs = inMemoryDB.filter(ioc => ioc._id !== id);

    // 1. Tag correlation
    if (tags.length > 0) {
        const sharedTagIOCs = allIOCs.filter(ioc => 
            ioc.tags && ioc.tags.some(t => tags.includes(t))
        );
        for (const ioc of sharedTagIOCs) {
            const commonTags = ioc.tags.filter(t => tags.includes(t));
            correlations.push({
                type: "shared_tag",
                ioc: {
                    id: ioc._id,
                    type: ioc.type,
                    value: ioc.value,
                    severity: ioc.severity
                },
                description: `Shares tag(s): ${commonTags.join(", ")}`
            });
        }
    }

    // 2. OTX Pulse correlation
    const currentPulses = currentIOC.otx?.pulses || [];
    if (currentPulses.length > 0) {
        const currentPulseIds = currentPulses.map(p => p.id);
        const sharedPulseIOCs = allIOCs.filter(ioc => {
            const otherPulses = ioc.otx?.pulses || [];
            return otherPulses.some(p => currentPulseIds.includes(p.id));
        });

        for (const ioc of sharedPulseIOCs) {
            const otherPulses = ioc.otx?.pulses || [];
            const commonPulses = otherPulses.filter(p => currentPulseIds.includes(p.id)).map(p => p.name);
            correlations.push({
                type: "shared_pulse",
                ioc: {
                    id: ioc._id,
                    type: ioc.type,
                    value: ioc.value,
                    severity: ioc.severity
                },
                description: `Associated with same threat campaign/pulse: ${commonPulses.join(", ")}`
            });
        }
    }

    // 3. Infrastructure correlation (IP/Domain/URL relationships)
    if (type === "ip" || type === "domain" || type === "url") {
        for (const ioc of allIOCs) {
            let relates = false;
            let reason = "";

            if (type === "ip" && ioc.type === "domain") {
                // Check VT resolutions or Shodan data if available
                const dnsResolutions = currentIOC.virustotal?.resolutions || [];
                if (dnsResolutions.some(r => r.ip_address === value || r.domain === ioc.value)) {
                    relates = true;
                    reason = "IP resolves to this domain";
                }
            } else if (type === "domain" && ioc.type === "ip") {
                const dnsResolutions = ioc.virustotal?.resolutions || [];
                if (dnsResolutions.some(r => r.ip_address === ioc.value || r.domain === value)) {
                    relates = true;
                    reason = "Domain resolves to this IP";
                }
            } else if (type === "url" && ioc.type === "domain") {
                // If URL contains the domain
                try {
                    const urlObj = new URL(value);
                    if (urlObj.hostname.includes(ioc.value) || ioc.value.includes(urlObj.hostname)) {
                        relates = true;
                        reason = "URL points to this domain";
                    }
                } catch (e) {
                    if (value.includes(ioc.value)) {
                        relates = true;
                        reason = "URL contains this domain";
                    }
                }
            } else if (type === "domain" && ioc.type === "url") {
                try {
                    const urlObj = new URL(ioc.value);
                    if (urlObj.hostname.includes(value) || value.includes(urlObj.hostname)) {
                        relates = true;
                        reason = "Domain hosts this URL";
                    }
                } catch (e) {
                    if (ioc.value.includes(value)) {
                        relates = true;
                        reason = "Domain hosts this URL";
                    }
                }
            }

            if (relates) {
                correlations.push({
                    type: "infrastructure_link",
                    ioc: {
                        id: ioc._id,
                        type: ioc.type,
                        value: ioc.value,
                        severity: ioc.severity
                    },
                    description: reason
                });
            }
        }
    }

    return correlations;
};
