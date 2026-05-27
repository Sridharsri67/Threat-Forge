const PDFDocument = require("pdfkit");

exports.generatePDF = (ioc, mitreMappings = [], correlationList = []) => {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ margin: 50 });
        const buffers = [];

        doc.on("data", buffers.push.bind(buffers));
        doc.on("end", () => {
            const pdfData = Buffer.concat(buffers);
            resolve(pdfData);
        });

        doc.on("error", (err) => {
            reject(err);
        });

        // 1. Header
        doc.fillColor("#0f172a").rect(0, 0, 612, 100).fill(); // Dark header bar
        
        doc.fillColor("#38bdf8")
           .font("Helvetica-Bold")
           .fontSize(24)
           .text("Threat Forge", 50, 30);

        doc.fillColor("#94a3b8")
           .font("Helvetica")
           .fontSize(10)
           .text("THREAT INTELLIGENCE REPORT", 50, 60);

        doc.fillColor("#ffffff")
           .fontSize(8)
           .text(`GENERATED: ${new Date().toLocaleString()}`, 400, 35, { align: "right", width: 162 });

        doc.moveDown(5);

        // 2. IOC Main Card
        doc.fillColor("#1e293b")
           .rect(50, 120, 512, 90)
           .fill(); // Card background
        
        // Severity Border
        let sevColor = "#475569"; // Informational
        if (ioc.severity === "Critical") sevColor = "#ef4444";
        else if (ioc.severity === "High") sevColor = "#ea580c";
        else if (ioc.severity === "Medium") sevColor = "#eab308";
        else if (ioc.severity === "Low") sevColor = "#3b82f6";

        doc.fillColor(sevColor).rect(50, 120, 8, 90).fill();

        // IOC Text inside Card
        doc.fillColor("#ffffff")
           .font("Helvetica-Bold")
           .fontSize(10)
           .text(`${ioc.type.toUpperCase()} INDICATOR`, 70, 130);

        doc.fontSize(16)
           .fillColor("#38bdf8")
           .text(ioc.value, 70, 145, { width: 470, lineBreak: true });

        doc.fillColor("#cbd5e0")
           .font("Helvetica")
           .fontSize(10)
           .text(`Severity: ${ioc.severity}   |   Status: ${ioc.status.toUpperCase()}   |   Tags: ${(ioc.tags || []).join(", ") || "None"}`, 70, 185);

        doc.moveDown(4);

        // 3. Enrichment Details Section
        doc.fillColor("#0f172a").font("Helvetica-Bold").fontSize(14).text("1. Enrichment Details", 50, 230);
        doc.strokeColor("#334155").lineWidth(1).moveTo(50, 248).lineTo(562, 248).stroke();
        
        doc.moveDown(1.5);

        // VT & OTX Grid
        const startY = doc.y;
        
        // Left Column: VirusTotal
        doc.font("Helvetica-Bold").fontSize(11).fillColor("#ffffff").text("VirusTotal Data", 50, startY);
        doc.font("Helvetica").fontSize(10).fillColor("#cbd5e0");
        const vtMalicious = ioc.virustotal ? ioc.virustotal.maliciousCount : 0;
        const vtSuspicious = ioc.virustotal ? (ioc.virustotal.suspiciousCount || 0) : 0;
        doc.text(`Malicious Detections: ${vtMalicious}`, 50, startY + 20);
        doc.text(`Suspicious Detections: ${vtSuspicious}`, 50, startY + 35);
        doc.text(`Reputation Score: ${ioc.virustotal?.reputation ?? "N/A"}`, 50, startY + 50);

        // Right Column: AlienVault OTX
        doc.font("Helvetica-Bold").fontSize(11).fillColor("#ffffff").text("AlienVault OTX Data", 300, startY);
        doc.font("Helvetica").fontSize(10).fillColor("#cbd5e0");
        doc.text(`Pulse Count: ${ioc.otx?.pulseCount || 0}`, 300, startY + 20);
        doc.text(`Associated Campaigns: ${(ioc.otx?.pulses || []).slice(0, 3).map(p => p.name).join(", ") || "None"}`, 300, startY + 35, { width: 260 });

        doc.moveDown(6);

        // 4. Infrastructure Recon (AbuseIPDB & Shodan) if present
        if (ioc.abuseipdb || ioc.shodan) {
            const nextY = doc.y;
            doc.fillColor("#0f172a").font("Helvetica-Bold").fontSize(14).text("2. Infrastructure Recon", 50, nextY);
            doc.strokeColor("#334155").lineWidth(1).moveTo(50, nextY + 18).lineTo(562, nextY + 18).stroke();
            doc.moveDown(1.5);

            const gridY = doc.y;
            if (ioc.abuseipdb) {
                doc.font("Helvetica-Bold").fontSize(11).fillColor("#ffffff").text("AbuseIPDB", 50, gridY);
                doc.font("Helvetica").fontSize(10).fillColor("#cbd5e0");
                doc.text(`Confidence Score: ${ioc.abuseipdb.abuseConfidenceScore}%`, 50, gridY + 20);
                doc.text(`Total Reports: ${ioc.abuseipdb.totalReports}`, 50, gridY + 35);
                doc.text(`Country: ${ioc.abuseipdb.countryName || "N/A"}`, 50, gridY + 50);
                doc.text(`ISP: ${ioc.abuseipdb.isp || "N/A"}`, 50, gridY + 65, { width: 230 });
            }

            if (ioc.shodan) {
                doc.font("Helvetica-Bold").fontSize(11).fillColor("#ffffff").text("Shodan Recon", 300, gridY);
                doc.font("Helvetica").fontSize(10).fillColor("#cbd5e0");
                doc.text(`Open Ports: ${ioc.shodan.ports?.join(", ") || "None"}`, 300, gridY + 20);
                doc.text(`OS: ${ioc.shodan.os || "N/A"}`, 300, gridY + 35);
                doc.text(`ISP: ${ioc.shodan.isp || "N/A"}`, 300, gridY + 50, { width: 230 });
                if (ioc.shodan.vulns?.length > 0) {
                    doc.text(`Vulnerabilities: ${ioc.shodan.vulns.slice(0, 3).join(", ")}`, 300, gridY + 65, { width: 230 });
                }
            }
            doc.moveDown(7);
        }

        // Add page break for MITRE & notes if running out of space
        if (doc.y > 450) {
            doc.addPage();
            // Reprint Header Bar for new page
            doc.fillColor("#0f172a").rect(0, 0, 612, 50).fill();
            doc.fillColor("#38bdf8").font("Helvetica-Bold").fontSize(14).text("Threat Forge Report", 50, 15);
            doc.moveDown(4);
        }

        // 5. MITRE ATT&CK Mapping
        const mitreY = doc.y;
        doc.fillColor("#0f172a").font("Helvetica-Bold").fontSize(14).text("3. MITRE ATT&CK Techniques", 50, mitreY);
        doc.strokeColor("#334155").lineWidth(1).moveTo(50, mitreY + 18).lineTo(562, mitreY + 18).stroke();
        doc.moveDown(1.5);

        if (mitreMappings.length > 0) {
            mitreMappings.forEach(m => {
                doc.font("Helvetica-Bold").fontSize(10).fillColor("#38bdf8").text(`[${m.id}] ${m.name}`, 50, doc.y);
                doc.font("Helvetica-Oblique").fontSize(9).fillColor("#94a3b8").text(`Tactic: ${m.tactic}`, 50, doc.y);
                doc.font("Helvetica").fontSize(9).fillColor("#cbd5e0").text(m.description, 50, doc.y, { width: 512 });
                doc.moveDown(0.8);
            });
        } else {
            doc.font("Helvetica-Oblique").fontSize(10).fillColor("#cbd5e0").text("No MITRE ATT&CK techniques mapped to this indicator.", 50, doc.y);
            doc.moveDown(1);
        }

        doc.moveDown(1.5);

        // 6. Analyst Notes
        const notesY = doc.y;
        doc.fillColor("#0f172a").font("Helvetica-Bold").fontSize(14).text("4. Analyst Investigations & Notes", 50, notesY);
        doc.strokeColor("#334155").lineWidth(1).moveTo(50, notesY + 18).lineTo(562, notesY + 18).stroke();
        doc.moveDown(1.5);

        if (ioc.notes && ioc.notes.length > 0) {
            ioc.notes.forEach(note => {
                const noteDate = new Date(note.createdAt).toLocaleString();
                doc.font("Helvetica-Bold").fontSize(9).fillColor("#38bdf8").text(`${note.analyst} - ${noteDate}`, 50, doc.y);
                doc.font("Helvetica").fontSize(10).fillColor("#ffffff").text(note.text, 50, doc.y, { width: 512 });
                doc.moveDown(0.8);
            });
        } else {
            doc.font("Helvetica-Oblique").fontSize(10).fillColor("#cbd5e0").text("No analyst notes have been added to this indicator yet.", 50, doc.y);
            doc.moveDown(1);
        }

        // Footer
        doc.fontSize(8)
           .fillColor("#64748b")
           .text("Threat Forge Threat Intelligence Platform © 2026", 50, 720, { align: "center", width: 512 });

        doc.end();
    });
};
