import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { getIOCById, updateIOC, exportReportUrl } from "../api/iocApi";
import { 
  X, 
  FileDown, 
  Tag, 
  ShieldAlert, 
  Activity, 
  Network, 
  Brain, 
  User, 
  Send,
  CheckCircle,
  AlertOctagon,
  Globe,
  Server,
  Layers,
  History
} from "lucide-react";

function IOCDetails({ id, onClose, analystName }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("active");
  const [newNote, setNewNote] = useState("");
  const [noteLoading, setNoteLoading] = useState(false);
  const [tagText, setTagText] = useState("");
  const [activeDetailsTab, setActiveDetailsTab] = useState("report");
  const [geojsonData, setGeojsonData] = useState(null);

  useEffect(() => {
    fetch("/countries.json")
      .then(res => res.json())
      .then(js => setGeojsonData(js))
      .catch(err => console.error("Error loading countries.json:", err));
  }, []);

  const alpha2ToAlpha3 = {
    "AF": "AFG", "AX": "ALA", "AL": "ALB", "DZ": "DZA", "AS": "ASM", "AD": "AND", "AO": "AGO", "AI": "AIA", "AQ": "ATA", "AG": "ATG",
    "AR": "ARG", "AM": "ARM", "AW": "ABW", "AU": "AUS", "AT": "AUT", "AZ": "AZE", "BS": "BHS", "BH": "BHR", "BD": "BGD", "BB": "BRB",
    "BY": "BLR", "BE": "BEL", "BZ": "BLZ", "BJ": "BEN", "BM": "BMU", "BT": "BTN", "BO": "BOL", "BQ": "BES", "BA": "BIH", "BW": "BWA",
    "BV": "BVT", "BR": "BRA", "IO": "IOT", "BN": "BRN", "BG": "BGR", "BF": "BFA", "BI": "BDI", "CV": "CPV", "KH": "KHM", "CM": "CMR",
    "CA": "CAN", "KY": "CYM", "CF": "CAF", "TD": "TCD", "CL": "CHL", "CN": "CHN", "CX": "CXR", "CC": "CCK", "CO": "COL", "KM": "COM",
    "CD": "COD", "CG": "COG", "CK": "COK", "CR": "CRI", "CI": "CIV", "HR": "HRV", "CU": "CUB", "CW": "CUW", "CY": "CYP", "CZ": "CZE",
    "DK": "DNK", "DJ": "DJI", "DM": "DMA", "DO": "DOM", "EC": "ECU", "EG": "EGY", "SV": "SLV", "GQ": "GNQ", "ER": "ERI", "EE": "EST",
    "SZ": "SWZ", "ET": "ETH", "FK": "FLK", "FO": "FRO", "FJ": "FJI", "FI": "FIN", "FR": "FRA", "GF": "GUF", "PF": "PYF", "TF": "ATF",
    "GA": "GAB", "GM": "GMB", "GE": "GEO", "DE": "DEU", "GH": "GHA", "GI": "GIB", "GR": "GRC", "GL": "GRL", "GD": "GRD", "GP": "GLP",
    "GU": "GUM", "GT": "GTM", "GG": "GGY", "GN": "GIN", "GW": "GNB", "GY": "GUY", "HT": "HTI", "HM": "HMD", "VA": "VAT", "HN": "HND",
    "HK": "HKG", "HU": "HUN", "IS": "ISL", "IN": "IND", "ID": "IDN", "IR": "IRN", "IQ": "IRQ", "IE": "IRL", "IM": "IMN", "IL": "ISR",
    "IT": "ITA", "JM": "JAM", "JP": "JPN", "JE": "JEY", "JO": "JOR", "KZ": "KAZ", "KE": "KEN", "KI": "KIR", "KP": "PRK", "KR": "KOR",
    "KW": "KWT", "KG": "KGZ", "LA": "LAO", "LV": "LVA", "LB": "LBN", "LS": "LSO", "LR": "LBR", "LY": "LBY", "LI": "LIE", "LT": "LTU",
    "LU": "LUX", "MO": "MAC", "MG": "MDG", "MW": "MWI", "MY": "MYS", "MV": "MDV", "ML": "MLI", "MT": "MLT", "MH": "MHL", "MQ": "MTQ",
    "MR": "MRT", "MU": "MUS", "YT": "MYT", "MX": "MEX", "FM": "FSM", "MD": "MDA", "MC": "MCO", "MN": "MNG", "ME": "MNE", "MS": "MSR",
    "MA": "MAR", "MZ": "MOZ", "MM": "MMR", "NA": "NAM", "NR": "NRU", "NP": "NPL", "NL": "NLD", "NC": "NCL", "NZ": "NZL", "NI": "NIC",
    "NE": "NER", "NG": "NGA", "NU": "NIU", "NF": "NFK", "MP": "MNP", "NO": "NOR", "OM": "OMN", "PK": "PAK", "PW": "PLW", "PS": "PSE",
    "PA": "PAN", "PG": "PNG", "PY": "PRY", "PE": "PER", "PH": "PHL", "PN": "PCN", "PL": "POL", "PT": "PRT", "PR": "PRI", "QA": "QAT",
    "RE": "REU", "RO": "ROU", "RU": "RUS", "RW": "RWA", "BL": "BLM", "SH": "SHN", "KN": "KNA", "LC": "LCA", "MF": "MAF", "PM": "SPM",
    "VC": "VCT", "WS": "WSM", "SM": "SMR", "ST": "STP", "SA": "SAU", "SN": "SEN", "RS": "SRB", "SC": "SYC", "SL": "SLE", "SG": "SGP",
    "SX": "SXM", "SK": "SVK", "SI": "SVN", "SB": "SLB", "SO": "SOM", "ZA": "ZAF", "GS": "SGS", "SS": "SSD", "ES": "ESP", "LK": "LKA",
    "SD": "SDN", "SR": "SUR", "SJ": "SJM", "SE": "SWE", "CH": "CHE", "SY": "SYR", "TW": "TWN", "TJ": "TJK", "TZ": "TZA", "TH": "THA",
    "TL": "TLS", "TG": "TGO", "TK": "TKL", "TO": "TON", "TT": "TTO", "TN": "TUN", "TR": "TUR", "TM": "TKM", "TC": "TCA", "TV": "TUV",
    "UG": "UGA", "UA": "UKR", "AE": "ARE", "GB": "GBR", "UM": "UMI", "US": "USA", "UY": "URY", "UZ": "UZB", "VU": "VUT", "VE": "VEN",
    "VN": "VNM", "VG": "VGB", "VI": "VIR", "WF": "WLF", "EH": "ESH", "YE": "YEM", "ZM": "ZMB", "ZW": "ZWE"
  };

  const sidebarMapRef = useRef(null);
  const mainMapRef = useRef(null);
  const sidebarMapInstance = useRef(null);
  const mainMapInstance = useRef(null);

  // Initialize and update Sidebar map
  useEffect(() => {
    if (loading || !data || !window.L || !sidebarMapRef.current || !geojsonData) return;

    const ioc = data.ioc;
    const correlations = data.correlations || [];
    const primaryCountryCode = ioc.abuseipdb?.countryCode;
    const primary3 = primaryCountryCode ? alpha2ToAlpha3[primaryCountryCode.toUpperCase()] : null;
    
    // Compile map of threat country codes to their level
    const threatCountries = {};
    if (primary3) {
      threatCountries[primary3] = 'primary';
    }
    
    // Also include correlated countries
    correlations.forEach(c => {
      const code = c.ioc.abuseipdb?.countryCode;
      if (code) {
        const code3 = alpha2ToAlpha3[code.toUpperCase()];
        if (code3 && !threatCountries[code3]) {
          threatCountries[code3] = 'correlated';
        }
      }
    });

    if (!sidebarMapInstance.current) {
      sidebarMapInstance.current = window.L.map(sidebarMapRef.current, {
        zoomControl: false,
        attributionControl: false,
        dragging: false,
        scrollWheelZoom: false,
        doubleClickZoom: false,
        boxZoom: false
      });
    }

    const map = sidebarMapInstance.current;
    
    // Set a view that fits the whole world nicely
    map.setView([30, 10], 1);

    // Clear existing layers
    map.eachLayer((layer) => {
      map.removeLayer(layer);
    });

    // Add Styled GeoJSON Layer
    window.L.geoJSON(geojsonData, {
      style: (feature) => {
        const countryId = feature.id;
        const type = threatCountries[countryId];
        
        if (type === 'primary') {
          return {
            fillColor: '#ef4444', // Threat red
            fillOpacity: 1.0,
            color: '#111111', // Black border
            weight: 0.5,
            opacity: 1
          };
        } else if (type === 'correlated') {
          return {
            fillColor: '#fca5a5', // Lighter red
            fillOpacity: 0.8,
            color: '#111111',
            weight: 0.5,
            opacity: 1
          };
        } else {
          return {
            fillColor: '#ffffff', // White continent
            fillOpacity: 1.0,
            color: '#111111', // Black border
            weight: 0.5,
            opacity: 1
          };
        }
      },
      onEachFeature: (feature, layer) => {
        if (feature.properties && feature.properties.name) {
          layer.bindTooltip(feature.properties.name, {
            sticky: true,
            className: 'custom-map-tooltip'
          });
        }
      }
    }).addTo(map);

    // Trigger invalidation to render correctly
    const timer = setTimeout(() => {
      if (sidebarMapInstance.current) {
        sidebarMapInstance.current.invalidateSize();
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [data, loading, geojsonData]);

  // Initialize and update Main Map Tab
  useEffect(() => {
    if (loading || !data || !window.L || !geojsonData) return;

    if (activeDetailsTab === "map" && mainMapRef.current) {
      const ioc = data.ioc;
      const correlations = data.correlations || [];
      const primaryCountryCode = ioc.abuseipdb?.countryCode;
      const primary3 = primaryCountryCode ? alpha2ToAlpha3[primaryCountryCode.toUpperCase()] : null;
      
      const threatCountries = {};
      if (primary3) {
        threatCountries[primary3] = 'primary';
      }
      
      correlations.forEach(c => {
        const code = c.ioc.abuseipdb?.countryCode;
        if (code) {
          const code3 = alpha2ToAlpha3[code.toUpperCase()];
          if (code3 && !threatCountries[code3]) {
            threatCountries[code3] = 'correlated';
          }
        }
      });

      if (!mainMapInstance.current) {
        mainMapInstance.current = window.L.map(mainMapRef.current, {
          zoomControl: true,
          attributionControl: false
        });
      }

      const map = mainMapInstance.current;
      map.setView([20, 0], 2);

      map.eachLayer((layer) => {
        map.removeLayer(layer);
      });

      window.L.geoJSON(geojsonData, {
        style: (feature) => {
          const countryId = feature.id;
          const type = threatCountries[countryId];
          
          if (type === 'primary') {
            return {
              fillColor: '#ef4444',
              fillOpacity: 1.0,
              color: '#111111',
              weight: 0.8,
              opacity: 1
            };
          } else if (type === 'correlated') {
            return {
              fillColor: '#fca5a5',
              fillOpacity: 0.8,
              color: '#111111',
              weight: 0.8,
              opacity: 1
            };
          } else {
            return {
              fillColor: '#ffffff',
              fillOpacity: 1.0,
              color: '#111111',
              weight: 0.8,
              opacity: 1
            };
          }
        },
      onEachFeature: (feature, layer) => {
        if (feature.properties && feature.properties.name) {
          layer.bindTooltip(feature.properties.name, {
            sticky: true,
            className: 'custom-map-tooltip'
          });
        }
      }
    }).addTo(map);

      const timer = setTimeout(() => {
        if (mainMapInstance.current) {
          mainMapInstance.current.invalidateSize();
        }
      }, 150);

      return () => clearTimeout(timer);
    } else {
      if (mainMapInstance.current) {
        mainMapInstance.current.remove();
        mainMapInstance.current = null;
      }
    }
  }, [data, loading, activeDetailsTab, geojsonData]);

  // Clean up on component unmount
  useEffect(() => {
    return () => {
      if (sidebarMapInstance.current) {
        sidebarMapInstance.current.remove();
        sidebarMapInstance.current = null;
      }
      if (mainMapInstance.current) {
        mainMapInstance.current.remove();
        mainMapInstance.current = null;
      }
    };
  }, []);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const res = await getIOCById(id);
      if (res.success) {
        setData(res);
        setStatus(res.ioc.status);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const handleStatusChange = async (newStatus) => {
    try {
      const res = await updateIOC(id, { status: newStatus }, analystName);
      if (res.success) {
        setStatus(newStatus);
        setData(prev => ({
          ...prev,
          ioc: { ...prev.ioc, status: newStatus }
        }));
      }
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    try {
      setNoteLoading(true);
      const res = await updateIOC(id, { note: newNote.trim() }, analystName);
      if (res.success) {
        setNewNote("");
        fetchDetails(); // Reload data to show new note
      }
    } catch (err) {
      console.error("Failed to add analyst note:", err);
    } finally {
      setNoteLoading(false);
    }
  };

  const handleAddTag = async (e) => {
    e.preventDefault();
    if (!tagText.trim()) return;

    const currentTags = data.ioc.tags || [];
    if (currentTags.includes(tagText.trim())) {
      setTagText("");
      return;
    }

    const updatedTags = [...currentTags, tagText.trim()];
    try {
      const res = await updateIOC(id, { tags: updatedTags }, analystName);
      if (res.success) {
        setTagText("");
        setData(prev => ({
          ...prev,
          ioc: { ...prev.ioc, tags: updatedTags }
        }));
      }
    } catch (err) {
      console.error("Failed to add tag:", err);
    }
  };

  if (loading || !data) {
    return (
      <div className="glass-card" style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "400px" }}>
        <div className="loading-spinner"></div>
      </div>
    );
  }

  const { ioc, score, mitreMappings, correlations } = data;

  const getCountryFlag = (code) => {
    if (!code) return "🌐";
    const codePoints = code
      .toUpperCase()
      .split("")
      .map(char =>  127397 + char.charCodeAt(0));
    try {
      return String.fromCodePoint(...codePoints);
    } catch {
      return "🌐";
    }
  };

  const generateMockBannerText = (ioc) => {
    if (ioc.type === "ip") {
      return `HTTP/1.1 200 OK
Server: ${ioc.shodan?.os || "Linux/Ubuntu"}
Content-Type: text/html; charset=UTF-8
Connection: keep-alive
ISP: ${ioc.abuseipdb?.isp || ioc.shodan?.isp || "Unknown ISP"}
Abuse Confidence Score: ${ioc.abuseipdb?.abuseConfidenceScore || 0}%
Total AbuseIPDB Reports: ${ioc.abuseipdb?.totalReports || 0}
Ports Exposed: ${(ioc.shodan?.ports || [80, 443]).join(", ")}
OS Detected: ${ioc.shodan?.os || "Unknown"}
Last Scanned: ${new Date(ioc.updatedAt || ioc.createdAt).toISOString()}`;
    } else if (ioc.type === "domain") {
      return `Domain Enrichment Block
Domain: ${ioc.value}
Registrar: WHOIS Secure Registrar
Reputation Score: ${ioc.virustotal?.reputation || 0}
Detections (VT): ${ioc.virustotal?.maliciousCount || 0} / ${ioc.virustotal?.maliciousCount + (ioc.virustotal?.suspiciousCount || 0)} malicious
OTX Pulses: ${ioc.otx?.pulseCount || 0} pulses
Last Enrichment Check: ${new Date(ioc.updatedAt || ioc.createdAt).toISOString()}`;
    } else {
      return `Indicator Enrichment Summary
Value: ${ioc.value}
Type: ${ioc.type.toUpperCase()}
Severity: ${ioc.severity}
Detections (VT): ${ioc.virustotal?.maliciousCount || 0} malicious
OTX Linked Pulses: ${ioc.otx?.pulseCount || 0} pulse(s)
Last Updated: ${new Date(ioc.updatedAt || ioc.createdAt).toISOString()}`;
    }
  };

  // Dynamically compile sidebar statistics
  const countryList = ioc.abuseipdb?.countryName ? [
    { flag: getCountryFlag(ioc.abuseipdb.countryCode), name: ioc.abuseipdb.countryName, count: "1" }
  ] : [];

  // Add correlated country flags
  correlations.forEach(c => {
    if (c.ioc.abuseipdb?.countryName) {
      const exists = countryList.find(x => x.name === c.ioc.abuseipdb.countryName);
      if (exists) {
        exists.count = (parseInt(exists.count) + 1).toString();
      } else {
        countryList.push({
          flag: getCountryFlag(c.ioc.abuseipdb.countryCode),
          name: c.ioc.abuseipdb.countryName,
          count: "1"
        });
      }
    }
  });

  if (countryList.length === 0) {
    countryList.push({ flag: "🌐", name: "N/A", count: "0" });
  }

  const portsList = ioc.shodan?.ports ? ioc.shodan.ports.map(p => ({ port: p, count: "Open" })) : [];
  correlations.forEach(c => {
    if (c.ioc.shodan?.ports) {
      c.ioc.shodan.ports.forEach(p => {
        if (!portsList.find(x => x.port === p)) {
          portsList.push({ port: p, count: "Open" });
        }
      });
    }
  });

  if (portsList.length === 0) {
    portsList.push({ port: "80 (Mock)", count: "Offline" }, { port: "443 (Mock)", count: "Offline" });
  }

  const orgsList = [];
  const primaryOrg = ioc.shodan?.isp || ioc.abuseipdb?.isp;
  if (primaryOrg) {
    orgsList.push({ name: primaryOrg, count: "1" });
  }
  correlations.forEach(c => {
    const corOrg = c.ioc.shodan?.isp || c.ioc.abuseipdb?.isp;
    if (corOrg) {
      const exists = orgsList.find(x => x.name === corOrg);
      if (exists) {
        exists.count = (parseInt(exists.count) + 1).toString();
      } else {
        orgsList.push({ name: corOrg, count: "1" });
      }
    }
  });

  if (orgsList.length === 0) {
    orgsList.push({ name: "Internal SOC Database", count: "1" });
  }

  return (
    <div className="shodan-results-page">
      {/* Sidebar Navigation Details (Shodan Style) */}
      <div className="shodan-sidebar">
        <div className="shodan-metric-box">
          <span className="shodan-metric-label">REPUTATION RATING</span>
          <div className="shodan-metric-val">{score}</div>
          <div className="shodan-metric-sub">Threat Probability ({score}%)</div>
        </div>

        {/* Shaded World Map */}
        <div className="shodan-sidebar-section">
          <div className="shodan-sidebar-title">TOP COUNTRIES</div>
          <div className="shodan-world-map">
            <div ref={sidebarMapRef} className="red-black-map" style={{ height: "100%", width: "100%", zIndex: 1 }}></div>
          </div>
          <div className="shodan-metric-list">
            {countryList.slice(0, 5).map((c, i) => (
              <div key={i} className="shodan-metric-item">
                <span className="shodan-metric-name">{c.flag} {c.name}</span>
                <span className="shodan-metric-count">{c.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Ports List */}
        <div className="shodan-sidebar-section">
          <div className="shodan-sidebar-title">TOP PORTS</div>
          <div className="shodan-metric-list">
            {portsList.slice(0, 5).map((p, i) => (
              <div key={i} className="shodan-metric-item">
                <span className="shodan-metric-name mono">Port {p.port}</span>
                <span className="shodan-metric-count" style={{ color: p.count === "Open" ? "#10b981" : "var(--text-muted)", fontSize: "0.75rem" }}>{p.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Orgs List */}
        <div className="shodan-sidebar-section">
          <div className="shodan-sidebar-title">TOP ORGANIZATIONS</div>
          <div className="shodan-metric-list">
            {orgsList.slice(0, 5).map((o, i) => (
              <div key={i} className="shodan-metric-item">
                <span className="shodan-metric-name" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "160px" }}>
                  {o.name}
                </span>
                <span className="shodan-metric-count">{o.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Results Console (Shodan Style) */}
      <div className="shodan-results-main">
        {/* Navigation Tabs */}
        <div className="shodan-tabs-menu">
          <button 
            className={`shodan-tab-btn ${activeDetailsTab === "report" ? "active" : ""}`}
            onClick={() => setActiveDetailsTab("report")}
          >
            {activeDetailsTab === "report" && (
              <motion.div
                layoutId="activeTabGlowPill"
                className="shodan-tab-active-pill yellow"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
            <span className="shodan-tab-btn-text">View Report</span>
          </button>
          <button 
            className={`shodan-tab-btn ${activeDetailsTab === "raw" ? "active" : ""}`}
            onClick={() => setActiveDetailsTab("raw")}
          >
            {activeDetailsTab === "raw" && (
              <motion.div
                layoutId="activeTabGlowPill"
                className="shodan-tab-active-pill purple"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
            <span className="shodan-tab-btn-text">Browse Raw Data</span>
          </button>
          <button 
            className={`shodan-tab-btn ${activeDetailsTab === "map" ? "active" : ""}`}
            onClick={() => setActiveDetailsTab("map")}
          >
            {activeDetailsTab === "map" && (
              <motion.div
                layoutId="activeTabGlowPill"
                className="shodan-tab-active-pill green"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
            <span className="shodan-tab-btn-text">View on Map</span>
          </button>
          <button 
            className={`shodan-tab-btn ${activeDetailsTab === "notes" ? "active" : ""}`}
            onClick={() => setActiveDetailsTab("notes")}
          >
            {activeDetailsTab === "notes" && (
              <motion.div
                layoutId="activeTabGlowPill"
                className="shodan-tab-active-pill red"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
            <span className="shodan-tab-btn-text">Analyst Desk ({ioc.notes?.length || 0})</span>
          </button>
          
          <button 
            onClick={onClose} 
            className="shodan-tab-btn" 
            style={{ marginLeft: "auto", borderBottom: "none", color: "var(--text-secondary)" }}
          >
            <span className="shodan-tab-btn-text">
              <X size={16} /> Close
            </span>
          </button>
        </div>

        {/* Spotlight Status Bar Banner */}
        <div className="shodan-spotlight">
          <strong>Product Spotlight:</strong> Analyst is currently monitoring this indicator under 
          <select 
            className="shodan-spotlight-select"
            value={status}
            onChange={(e) => handleStatusChange(e.target.value)}
          >
            <option value="active">Active Watchlist</option>
            <option value="false_positive">False Positive</option>
            <option value="whitelisted">Whitelisted</option>
          </select>
          . Actionable reports can be downloaded in 
          <a 
            href={exportReportUrl(ioc._id, "pdf")} 
            download 
            className="spotlight-download-btn"
          >
            PDF
          </a>
          , 
          <a 
            href={exportReportUrl(ioc._id, "csv")} 
            download 
            className="spotlight-download-btn"
          >
            CSV
          </a>
          , or 
          <a 
            href={exportReportUrl(ioc._id, "html")} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="spotlight-download-btn"
          >
            HTML
          </a>.
        </div>

        {/* Tab content rendering */}
        {activeDetailsTab === "report" && (
          <div className="shodan-list-results">
            {/* Main Result Card */}
            <div className="shodan-result-item">
              <div className="shodan-result-left">
                <div className="shodan-result-header">
                  <span className="shodan-result-ip mono">{ioc.value}</span>
                  <a 
                    href={`https://www.virustotal.com/gui/search/${ioc.value}`} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="shodan-ext-link"
                    style={{ color: "#ef4444" }}
                  >
                    ↗
                  </a>
                </div>

                <div className="shodan-result-org">
                  {ioc.abuseipdb?.isp && (
                    <div>ISP: <span style={{ color: "#3b82f6" }}>{ioc.abuseipdb.isp}</span></div>
                  )}
                  {ioc.shodan?.os && (
                    <div>Operating System: <strong style={{ color: "#e5e5e5" }}>{ioc.shodan.os}</strong></div>
                  )}
                  {ioc.virustotal?.reputation !== undefined && (
                    <div>VirusTotal Reputation: <strong style={{ color: ioc.virustotal.reputation >= 0 ? "#10b981" : "#ef4444" }}>{ioc.virustotal.reputation}</strong></div>
                  )}
                </div>

                <div className="shodan-result-geo">
                  {ioc.abuseipdb?.countryName ? (
                    <>
                      <span>{ioc.abuseipdb.countryName} ({ioc.abuseipdb.countryCode})</span>
                    </>
                  ) : (
                    <span>🌐 Unknown Infrastructure Location</span>
                  )}
                </div>

                <div className="shodan-result-tags">
                  <span className="shodan-tag-pill type">{ioc.type}</span>
                  <span className={`shodan-tag-pill severity ${ioc.severity.toLowerCase()}`}>{ioc.severity} Severity</span>
                  {(ioc.tags || []).map((tag, i) => (
                    <span key={i} className="shodan-tag-pill user">{tag}</span>
                  ))}
                </div>

                {/* Add tag form */}
                <form onSubmit={handleAddTag} style={{ display: "flex", gap: "6px", marginTop: "12px" }}>
                  <input 
                    type="text" 
                    placeholder="+ Add Tag" 
                    className="shodan-quick-input"
                    value={tagText}
                    onChange={(e) => setTagText(e.target.value)}
                  />
                </form>
              </div>

              {/* Enrichment Data Banner */}
              <div className="shodan-result-right">
                <span className="shodan-banner-title">RAW ENRICHMENT BANNER</span>
                <pre className="shodan-banner-pre">
                  {generateMockBannerText(ioc)}
                </pre>
              </div>
            </div>

            {/* Exposed Vulnerabilities if present */}
            {ioc.shodan?.vulns?.length > 0 && (
              <div className="glass-card" style={{ borderLeft: "3px solid #ef4444" }}>
                <h4 style={{ color: "#ef4444", marginBottom: "8px", fontWeight: 700 }}>Exposed Vulnerabilities</h4>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {ioc.shodan.vulns.map((v, i) => (
                    <span key={i} className="mono" style={{ backgroundColor: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#ef4444", padding: "4px 8px", borderRadius: "4px", fontSize: "0.8rem" }}>
                      {v}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* MITRE Mapping */}
            <div className="glass-card">
              <h4 style={{ color: "white", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                <Layers size={16} style={{ color: "#ef4444" }} />
                MITRE ATT&CK Mapping Matrix
              </h4>
              {mitreMappings.length === 0 ? (
                <div style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>No MITRE ATT&CK techniques mapped to this indicator's profile.</div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {mitreMappings.map((m, i) => (
                    <div key={i} className="mitre-card" style={{ backgroundColor: "#161616", border: "1px solid #2e2e2e" }}>
                      <div className="mitre-card-header">
                        <span style={{ fontWeight: 700, color: "#fff" }}>{m.name}</span>
                        <span className="mitre-id" style={{ color: "#ef4444" }}>{m.id}</span>
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginBottom: "4px" }}>TACTIC: {m.tactic}</div>
                      <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>{m.description}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Correlated Threats */}
            <div className="shodan-list-results">
              {correlations.length > 0 && (
                <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--text-muted)", marginTop: "16px", borderBottom: "1px dotted #333", paddingBottom: "8px" }}>
                  CORRELATED THREAT NODES ({correlations.length})
                </div>
              )}
              {correlations.map((cor, i) => (
                <div key={i} className="shodan-result-item secondary">
                  <div className="shodan-result-left">
                    <div className="shodan-result-header">
                      <span className="shodan-result-ip secondary mono" style={{ fontSize: "1.1rem" }}>{cor.ioc.value}</span>
                    </div>
                    <div className="shodan-result-org">
                      <div style={{ color: "#ef4444", fontWeight: 600 }}>Localized Database Correlation</div>
                      <div style={{ marginTop: "4px" }}>{cor.description}</div>
                    </div>
                    <div className="shodan-result-tags">
                      <span className="shodan-tag-pill type">{cor.ioc.type}</span>
                      <span className={`shodan-tag-pill severity ${cor.ioc.severity.toLowerCase()}`}>{cor.ioc.severity}</span>
                    </div>
                  </div>
                  <div className="shodan-result-right" style={{ backgroundColor: "#141414" }}>
                    <span className="shodan-banner-title">CORRELATION SUMMARY</span>
                    <pre className="shodan-banner-pre secondary">
                      {`ID: ${cor.ioc._id || "correlated_" + i}\nType: ${cor.ioc.type.toUpperCase()}\nSeverity: ${cor.ioc.severity}\nDescription: ${cor.description}\nRelation: Linked Node`}
                    </pre>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeDetailsTab === "raw" && (
          <div className="shodan-raw-view">
            <div className="shodan-raw-card">
              <div className="shodan-raw-header">
                <span>Threat Intelligence Document</span>
                <button 
                  className="shodan-copy-btn" 
                  onClick={() => {
                    navigator.clipboard.writeText(JSON.stringify(ioc, null, 2));
                    alert("Document copied to clipboard.");
                  }}
                >
                  Copy JSON
                </button>
              </div>
              <pre className="shodan-raw-pre">
                {JSON.stringify(ioc, null, 2)}
              </pre>
            </div>
          </div>
        )}

        {activeDetailsTab === "map" && (
          <div className="shodan-map-view">
            <div className="shodan-raw-card" style={{ height: "400px", display: "flex", flexDirection: "column" }}>
              <div style={{ padding: "16px", borderBottom: "1px solid #2e2e2e", fontWeight: 700, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>Geographic Threat Map</span>
                {ioc.abuseipdb?.countryName && (
                  <span style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>
                    {ioc.abuseipdb.countryName} ({ioc.abuseipdb.countryCode}) — {ioc.abuseipdb.latitude || "N/A"}, {ioc.abuseipdb.longitude || "N/A"}
                  </span>
                )}
              </div>
              <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
                <div ref={mainMapRef} className="red-black-map" style={{ height: "100%", width: "100%", zIndex: 1 }}></div>
              </div>
            </div>
          </div>
        )}

        {activeDetailsTab === "notes" && (
          <div className="shodan-notes-view">
            <div className="shodan-raw-card">
              <div style={{ padding: "16px", borderBottom: "1px solid #2e2e2e", fontWeight: 700, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>Investigation Log logs</span>
                <span className="mono" style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Target ID: {ioc._id}</span>
              </div>

              <div className="shodan-notes-list">
                {(!ioc.notes || ioc.notes.length === 0) ? (
                  <div style={{ padding: "30px", color: "var(--text-muted)", textAlign: "center" }}>
                    No observations documented. Use the form below to append details.
                  </div>
                ) : (
                  ioc.notes.map((note) => (
                    <div key={note._id} className="shodan-note-bubble">
                      <div className="shodan-note-meta">
                        <strong style={{ color: "#fff" }}>{note.analyst}</strong>
                        <span style={{ color: "var(--text-muted)" }}>{new Date(note.createdAt).toLocaleString()}</span>
                      </div>
                      <div style={{ marginTop: "6px", fontSize: "0.9rem", color: "#e5e5e5" }}>{note.text}</div>
                    </div>
                  ))
                )}
              </div>

              <form onSubmit={handleAddNote} style={{ display: "flex", borderTop: "1px solid #2e2e2e", padding: "12px", gap: "8px" }}>
                <input 
                  type="text" 
                  placeholder="Record observation details..." 
                  className="shodan-quick-input"
                  style={{ flex: 1, padding: "10px 14px", border: "1px solid #333" }}
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  disabled={noteLoading}
                />
                <button 
                  type="submit" 
                  className="shofa-search-btn btn-primary" 
                  style={{ background: "#ef4444", border: "none", color: "#fff", cursor: "pointer", padding: "0 20px", borderRadius: "6px", fontWeight: "bold" }}
                  disabled={noteLoading || !newNote.trim()}
                >
                  Log
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default IOCDetails;
