# Threat Forge

> Advanced Threat Intelligence & IOC Enrichment Platform

![Node.js](https://img.shields.io/badge/Node.js-Backend-green)
![Express](https://img.shields.io/badge/Express-API-black)
![In-Memory](https://img.shields.io/badge/Database-In--Memory-orange)
![React](https://img.shields.io/badge/React-Frontend-blue)
![ThreatIntel](https://img.shields.io/badge/Threat-Intelligence-red)
![License](https://img.shields.io/badge/License-MIT-yellow)

---

# 📖 Overview

Threat Forge is a SOC-focused Threat Intelligence Platform (TIP) designed to automate IOC enrichment, threat scoring, malware intelligence gathering, and analyst investigation workflows.

The platform transforms raw Indicators of Compromise (IOCs) into actionable threat intelligence by integrating multiple threat intelligence sources such as:

- VirusTotal
- AlienVault OTX
- Shodan
- AbuseIPDB
- CVE Databases

Threat Forge helps:
- SOC Analysts
- Threat Hunters
- DFIR Teams
- Threat Intelligence Analysts

investigate suspicious infrastructure faster and more efficiently.

---

# ⚙️ What It Does

Threat Forge analyzes and enriches suspicious Indicators of Compromise (IOCs) including:

- IP Addresses
- Domains
- URLs
- Malware Hashes
- File Uploads

The platform then:
- enriches the IOC
- calculates threat severity
- correlates indicators
- generates intelligence reports

---

# 🧠 IOC Enrichment Engine

Threat Forge automatically gathers:

- malicious detections
- reputation scores
- malware associations
- threat tags
- pulse intelligence
- ASN information
- geolocation
- infrastructure metadata

from multiple threat intelligence providers.

---

# 📈 Dynamic Threat Scoring

Threat Forge calculates:

- IOC severity
- maliciousness confidence
- risk prioritization
- detection confidence

Example:
- High-risk IOC → Critical
- Medium detections → High
- Suspicious infrastructure → Medium

---

# 🔗 Threat Correlation Engine

Threat Forge correlates:

- malware hashes
- domains
- IP addresses
- campaigns
- threat actors

to uncover relationships between malicious infrastructure and attack campaigns.

---

# 📄 Automated Reporting

Threat Forge generates:

- PDF reports
- CSV exports
- HTML reports
- analyst summaries
- investigation reports

---

# 🏗️ Architecture

```text
Frontend (React Dashboard)
            ↓
Express API Backend
            ↓
Threat Intelligence Engine
            ↓
IOC Enrichment Services
(VT / OTX / Shodan / AbuseIPDB)
            ↓
Threat Scoring & Correlation
            ↓
Volatile In-Memory Database
```

> **Architectural Transition:** The platform was migrated from a serverless architecture to a server-based architecture to reduce cold-start latency, improve API response handling, and provide more stable real-time IOC enrichment workflows.

---

# 🛠️ Tech Stack

## Frontend
- React
- Vite
- Tailwind CSS
- Chart.js

---

## Backend
- Node.js
- Express.js
- Axios
- Socket.IO

---

## Database
- Volatile In-Memory Database (Demo Mode / Local Store)
- No MongoDB / Mongoose dependency (lightweight, zero-setup)

---

## Threat Intelligence APIs
- VirusTotal API
- AlienVault OTX API
- Shodan API
- AbuseIPDB API
- NVD CVE API

---

# 📂 Project Structure

```text
Threat Forge/
│
├── client/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── utils/
│   │   └── styles/
│
├── server/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── services/
│   │   │   ├── enrichment/
│   │   │   ├── scoring/
│   │   │   ├── correlation/
│   │   │   ├── mitre/
│   │   │   ├── cve/
│   │   │   └── reports/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── jobs/
│   │   ├── sockets/
│   │   └── utils/
│
├── docs/
├── docker/
├── scripts/
├── README.md
└── docker-compose.yml
```

---

# 🚀 Core Features

## 🔍 IOC Enrichment
- IP reputation lookup
- Domain intelligence
- URL scanning
- Malware hash analysis
- File upload hashing

---

## 🧠 Threat Intelligence
- Multi-source enrichment
- Campaign tracking
- Threat actor analysis
- Threat feed aggregation
- MITRE ATT&CK mapping

---

## 📊 Threat Scoring
- Reputation scoring
- Severity classification
- Detection confidence scoring
- Risk prioritization

---

## 🔗 IOC Correlation
- IOC relationship mapping
- Malware infrastructure analysis
- Campaign association
- Threat graph generation

---

## 📄 Reporting
- PDF reports
- CSV exports
- HTML reports
- Executive summaries

---

## ⚡ SOC Features
- IOC watchlists
- Historical IOC tracking
- Bulk IOC processing
- Splunk/SIEM export support
- Analyst investigation workflows

---

# 🔥 Threat Intelligence Workflow

```text
IOC Submission
        ↓
IOC Validation
        ↓
Threat Intelligence Enrichment
        ↓
Threat Scoring
        ↓
IOC Correlation
        ↓
Analyst Investigation
        ↓
Report Generation
```

---

# 🛡️ Use Cases

## SOC Operations
- Alert investigation
- IOC triage
- Threat prioritization
- Incident response support

---

## Threat Hunting
- IOC enrichment during hunts
- Campaign tracking
- Infrastructure analysis

---

## DFIR
- Malware investigation
- IOC evidence collection
- Hash analysis

---

## Threat Intelligence
- Threat actor tracking
- Campaign intelligence
- IOC aggregation

---

# 🚀 Future Roadmap

- MISP integration
- Sigma rule generation
- YARA rule generation
- AI-assisted threat scoring
- IOC graph visualization
- Real-time threat feeds
- Multi-user analyst collaboration
- WebSocket live alerts
- Cross-platform SIEM integration

---

# 🔒 Security Disclaimer

Threat Forge is intended strictly for:

- defensive security operations
- threat intelligence research
- SOC workflows
- DFIR investigations
- educational purposes

This project must only be used in authorized environments.

---

# 👨‍💻 Author

Sridhar Konda

Cybersecurity Enthusiast | SOC | Threat Intelligence | DFIR | Security Automation

---

# 🛡️ License

MIT License © 2026 Threat Forge

---

# 📌 Motto

> Transforming raw IOCs into actionable threat intelligence.