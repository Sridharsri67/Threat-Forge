const inMemoryDB = require("../models/iocStore");
const virusTotalService = require("../services/enrichment/virusTotalService");
const otxService = require("../services/enrichment/otxService");
const abuseipdbService = require("../services/enrichment/abuseipdbService");
const shodanService = require("../services/enrichment/shodanService");

const reputationEngine = require("../services/scoring/reputationEngine");
const correlationEngine = require("../services/correlation/correlationEngine");
const mitreMapper = require("../services/mitre/mitreMapper");

const pdfGenerator = require("../services/reports/pdfGenerator");
const csvExporter = require("../services/reports/csvExporter");
const htmlReport = require("../services/reports/htmlReport");
const socketHandler = require("../sockets/socketHandler");

// Helper to generate fake Mongo-like ObjectIDs for in-memory docs
const generateId = () => {
    return Array.from({ length: 24 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
};

// 1. Lookup and Enrich IOC
exports.lookupIOC = async (req, res) => {
    try {
        const { type, value } = req.body;

        if (!type || !value) {
            return res.status(400).json({
                success: false,
                message: "IOC type and value required"
            });
        }

        // Fetch data from multiple sources in parallel
        const [vtResult, otxResult, abuseResult, shodanResult] = await Promise.allSettled([
            virusTotalService.lookupIOC(type, value),
            otxService.lookupIOC(type, value),
            abuseipdbService.lookupIOC(type, value),
            shodanService.lookupIOC(type, value)
        ]);

        const vtData = vtResult.status === "fulfilled" ? vtResult.value : null;
        const otxData = otxResult.status === "fulfilled" ? otxResult.value : null;
        const abuseData = abuseResult.status === "fulfilled" ? abuseResult.value : null;
        const shodanData = shodanResult.status === "fulfilled" ? shodanResult.value : null;

        // Calculate reputation and severity
        const scoring = reputationEngine.calculateReputation(type, vtData, otxData, abuseData, shodanData);

        // Collect tags from VT and pulses
        const vtTags = vtData?.tags || [];
        const otxTags = (otxData?.pulses || []).flatMap(p => p.tags || []);
        const allTags = [...new Set([...vtTags, ...otxTags])].filter(Boolean).slice(0, 10);

        let ioc;
        const existingIndex = inMemoryDB.findIndex(i => i.type === type && i.value === value);
        if (existingIndex > -1) {
            const existing = inMemoryDB[existingIndex];
            existing.virustotal = vtData;
            existing.otx = otxData;
            existing.abuseipdb = abuseData;
            existing.shodan = shodanData;
            existing.severity = scoring.severity;
            existing.tags = [...new Set([...(existing.tags || []), ...allTags])];
            existing.updatedAt = new Date();
            ioc = existing;
        } else {
            ioc = {
                _id: generateId(),
                type,
                value,
                severity: scoring.severity,
                status: "active",
                virustotal: vtData,
                otx: otxData,
                abuseipdb: abuseData,
                shodan: shodanData,
                tags: allTags,
                notes: [],
                createdAt: new Date(),
                updatedAt: new Date()
            };
            inMemoryDB.push(ioc);
        }

        const mitreMappings = mitreMapper.mapTags(ioc.tags);
        const correlations = await correlationEngine.correlate(ioc);

        // Emit real-time alert via sockets
        try {
            socketHandler.emitIOCAlert({
                _id: ioc._id,
                type: ioc.type,
                value: ioc.value,
                severity: ioc.severity,
                score: scoring.score,
                createdAt: ioc.createdAt
            });
        } catch (socketErr) {
            console.warn("Failed to emit socket alert:", socketErr.message);
        }

        return res.json({
            success: true,
            ioc,
            score: scoring.score,
            mitreMappings,
            correlations
        });

    } catch (error) {
        console.error("IOC Lookup Error:", error);
        return res.status(500).json({
            success: false,
            message: "IOC lookup failed",
            error: error.message
        });
    }
};

// 2. Get All IOCs
exports.getAllIOCs = async (req, res) => {
    try {
        const { type, severity, status, search, page = 1, limit = 10 } = req.query;

        let filtered = [...inMemoryDB];
        if (type) filtered = filtered.filter(i => i.type === type);
        if (severity) filtered = filtered.filter(i => i.severity === severity);
        if (status) filtered = filtered.filter(i => i.status === status);
        if (search) filtered = filtered.filter(i => i.value.toLowerCase().includes(search.toLowerCase()));

        // Sort by createdAt descending
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        const count = filtered.length;
        const paginated = filtered.slice((page - 1) * limit, page * limit);

        return res.json({
            success: true,
            count,
            page: parseInt(page),
            pages: Math.ceil(count / limit) || 1,
            iocs: paginated
        });
    } catch (error) {
        console.error("Get IOCs Error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch IOCs",
            error: error.message
        });
    }
};

// 3. Get IOC by ID
exports.getIOCById = async (req, res) => {
    try {
        const { id } = req.params;
        const ioc = inMemoryDB.find(i => i._id === id);

        if (!ioc) {
            return res.status(404).json({
                success: false,
                message: "IOC not found"
            });
        }

        const mitreMappings = mitreMapper.mapTags(ioc.tags);
        const correlations = await correlationEngine.correlate(ioc);

        const scoring = reputationEngine.calculateReputation(
            ioc.type, 
            ioc.virustotal, 
            ioc.otx, 
            ioc.abuseipdb, 
            ioc.shodan
        );

        return res.json({
            success: true,
            ioc,
            score: scoring.score,
            mitreMappings,
            correlations
        });
    } catch (error) {
        console.error("Get IOC by ID Error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch IOC details",
            error: error.message
        });
    }
};

// 4. Update IOC (Status, Tags, Notes)
exports.updateIOC = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, tags, note } = req.body;

        const ioc = inMemoryDB.find(i => i._id === id);
        if (!ioc) {
            return res.status(404).json({
                success: false,
                message: "IOC not found"
            });
        }

        if (status) ioc.status = status;
        if (tags) ioc.tags = tags;
        if (note) {
            ioc.notes.push({
                _id: generateId(),
                text: note,
                analyst: req.headers["x-analyst-name"] || "Analyst",
                createdAt: new Date()
            });
        }
        ioc.updatedAt = new Date();

        return res.json({
            success: true,
            message: "IOC updated successfully",
            ioc
        });
    } catch (error) {
        console.error("Update IOC Error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to update IOC",
            error: error.message
        });
    }
};

// 5. Delete IOC
exports.deleteIOC = async (req, res) => {
    try {
        const { id } = req.params;
        const idx = inMemoryDB.findIndex(i => i._id === id);
        if (idx === -1) {
            return res.status(404).json({
                success: false,
                message: "IOC not found"
            });
        }
        inMemoryDB.splice(idx, 1);

        return res.json({
            success: true,
            message: "IOC deleted successfully"
        });
    } catch (error) {
        console.error("Delete IOC Error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to delete IOC",
            error: error.message
        });
    }
};

// 6. Get Dashboard Stats
exports.getDashboardStats = async (req, res) => {
    try {
        const total = inMemoryDB.length;
        const severity = { Critical: 0, High: 0, Medium: 0, Low: 0, Informational: 0 };
        const type = { ip: 0, domain: 0, url: 0, hash: 0 };
        const status = { active: 0, false_positive: 0, whitelisted: 0 };

        inMemoryDB.forEach(ioc => {
            if (ioc.severity in severity) severity[ioc.severity]++;
            if (ioc.type in type) type[ioc.type]++;
            if (ioc.status in status) status[ioc.status]++;
        });

        const recent = [...inMemoryDB]
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 5);

        return res.json({
            success: true,
            stats: { total, severity, type, status },
            recent
        });
    } catch (error) {
        console.error("Get Dashboard Stats Error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch dashboard stats",
            error: error.message
        });
    }
};

// 7. Bulk Lookup
exports.bulkLookup = async (req, res) => {
    try {
        const { iocs } = req.body;
        
        if (!iocs || !Array.isArray(iocs) || iocs.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Valid array of IOCs is required"
            });
        }

        const results = [];

        for (const item of iocs) {
            const { type, value } = item;
            if (!type || !value) continue;

            try {
                const [vtResult, otxResult, abuseResult, shodanResult] = await Promise.allSettled([
                    virusTotalService.lookupIOC(type, value),
                    otxService.lookupIOC(type, value),
                    abuseipdbService.lookupIOC(type, value),
                    shodanService.lookupIOC(type, value)
                ]);

                const vtData = vtResult.status === "fulfilled" ? vtResult.value : null;
                const otxData = otxResult.status === "fulfilled" ? otxResult.value : null;
                const abuseData = abuseResult.status === "fulfilled" ? abuseResult.value : null;
                const shodanData = shodanResult.status === "fulfilled" ? shodanResult.value : null;

                const scoring = reputationEngine.calculateReputation(type, vtData, otxData, abuseData, shodanData);
                const vtTags = vtData?.tags || [];
                const otxTags = (otxData?.pulses || []).flatMap(p => p.tags || []);
                const allTags = [...new Set([...vtTags, ...otxTags])].filter(Boolean).slice(0, 10);

                let ioc;
                const existingIndex = inMemoryDB.findIndex(i => i.type === type && i.value === value);
                if (existingIndex > -1) {
                    const existing = inMemoryDB[existingIndex];
                    existing.virustotal = vtData;
                    existing.otx = otxData;
                    existing.abuseipdb = abuseData;
                    existing.shodan = shodanData;
                    existing.severity = scoring.severity;
                    existing.tags = [...new Set([...(existing.tags || []), ...allTags])];
                    existing.updatedAt = new Date();
                    ioc = existing;
                } else {
                    ioc = {
                        _id: generateId(),
                        type,
                        value,
                        severity: scoring.severity,
                        status: "active",
                        virustotal: vtData,
                        otx: otxData,
                        abuseipdb: abuseData,
                        shodan: shodanData,
                        tags: allTags,
                        notes: [],
                        createdAt: new Date(),
                        updatedAt: new Date()
                    };
                    inMemoryDB.push(ioc);
                }

                results.push({
                    success: true,
                    value,
                    type,
                    severity: scoring.severity,
                    score: scoring.score
                });
            } catch (err) {
                results.push({
                    success: false,
                    value,
                    type,
                    error: err.message
                });
            }
        }

        return res.json({
            success: true,
            results
        });
    } catch (error) {
        console.error("Bulk Lookup Error:", error);
        return res.status(500).json({
            success: false,
            message: "Bulk lookup failed",
            error: error.message
        });
    }
};

// 8. Export Report
exports.exportReport = async (req, res) => {
    try {
        const { id } = req.params;
        const { format = "pdf" } = req.query;

        const ioc = inMemoryDB.find(i => i._id === id);

        if (!ioc) {
            return res.status(404).json({
                success: false,
                message: "IOC not found"
            });
        }

        const mitreMappings = mitreMapper.mapTags(ioc.tags);
        const correlations = await correlationEngine.correlate(ioc);

        const cleanVal = ioc.value.replace(/[^a-zA-Z0-9]/g, "_");

        if (format === "csv") {
            const csvData = csvExporter.exportToCSV(ioc);
            res.setHeader("Content-Type", "text/csv");
            res.setHeader("Content-Disposition", `attachment; filename=Threat Forge_Report_${cleanVal}.csv`);
            return res.status(200).send(csvData);
        }

        if (format === "html") {
            const htmlData = htmlReport.generateHTML(ioc, mitreMappings, correlations);
            res.setHeader("Content-Type", "text/html");
            res.setHeader("Content-Disposition", `inline; filename=Threat Forge_Report_${cleanVal}.html`);
            return res.status(200).send(htmlData);
        }

        // Default to PDF
        const pdfBuffer = await pdfGenerator.generatePDF(ioc, mitreMappings, correlations);
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `attachment; filename=Threat Forge_Report_${cleanVal}.pdf`);
        return res.status(200).send(pdfBuffer);

    } catch (error) {
        console.error("Export Report Error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to export report",
            error: error.message
        });
    }
};