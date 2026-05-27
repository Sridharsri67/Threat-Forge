import React, { useState, useEffect, useRef } from "react";
import { 
  ShieldAlert, 
  Search, 
  LayoutDashboard, 
  History, 
  FileSpreadsheet, 
  Bell, 
  User, 
  ArrowRight,
  RefreshCw,
  Plus,
  Github,
  Mail
} from "lucide-react";
import { getDashboardStats, lookupIOC } from "./api/iocApi";
import DashboardStats from "./components/DashboardStats";
import IOCList from "./components/IOCList";
import IOCDetails from "./components/IOCDetails";
import BulkLookup from "./components/BulkLookup";
import { io } from "socket.io-client";
import { ThreeCyberBackground } from "./components/ThreeCyberBackground";
import { LiveThreatFeed } from "./components/LiveThreatFeed";
import { WorldMap } from "./components/WorldMap";

// Coordinates for key tech and security hubs for global threat visualization
const mapDots = [
  { start: { lat: 51.5074, lng: -0.1278 }, end: { lat: 40.7128, lng: -74.0060 } }, // London to NYC
  { start: { lat: 55.7558, lng: 37.6173 }, end: { lat: 50.1109, lng: 8.6821 } }, // Moscow to Frankfurt
  { start: { lat: -33.8688, lng: 151.2093 }, end: { lat: 1.3521, lng: 103.8198 } }, // Sydney to Singapore
  { start: { lat: -23.5505, lng: -46.6333 }, end: { lat: 51.5074, lng: -0.1278 } } // Rio to London
];

// Custom LinkedIn SVG icon matching the outlined brand style of other social icons
const LinkedInIcon = ({ size = 16 }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    className="lucide lucide-linkedin"
  >
    <rect x="2" y="2" width="20" height="20" rx="4" ry="4" />
    <line x1="8" y1="11" x2="8" y2="17" />
    <circle cx="8" cy="7.5" r="1.25" />
    <path d="M12 17v-3.5a2.5 2.5 0 0 1 5 0V17" />
  </svg>
);

const SOC_QUOTES = [
  "Securing the perimeter starts with visibility.",
  "Threat intelligence is not what we know, but what we share.",
  "Defend in depth, act in real-time.",
  "The best defense is continuous enrichment.",
  "In security, trust is a vulnerability. Verify everything.",
  "An analyst is only as good as their data feed."
];

const getPlaceholderText = (type) => {
  switch (type) {
    case "ip":
      return "Enter IP Address (e.g., 185.220.101.5)";
    case "domain":
      return "Enter Domain Name (e.g., malicious-c2.ru)";
    case "url":
      return "Enter Full URL (e.g., http://malicious.com/payload.exe)";
    case "hash":
      return "Enter MD5 or SHA256 Hash (e.g., 44d88612fe58c9b23b78c97f22341d2d)";
    default:
      return "Search threat indicators...";
  }
};

function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedIOCId, setSelectedIOCId] = useState(null);
  const [stats, setStats] = useState(null);
  const [quoteIndex, setQuoteIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % SOC_QUOTES.length);
    }, 7000);
    return () => clearInterval(timer);
  }, []);
  const [recentIOCs, setRecentIOCs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quickSearchType, setQuickSearchType] = useState("ip");
  const [quickSearchValue, setQuickSearchValue] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const analystName = "Analyst";
  const navContainerRef = useRef(null);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0, opacity: 0 });

  // Update navbar indicator position dynamically for sliding effect
  useEffect(() => {
    const updateIndicator = () => {
      if (!navContainerRef.current) return;
      const activeEl = navContainerRef.current.querySelector(".navbar-nav-item.active");
      if (activeEl) {
        const containerRect = navContainerRef.current.getBoundingClientRect();
        const activeRect = activeEl.getBoundingClientRect();
        setIndicatorStyle({
          left: activeRect.left - containerRect.left,
          width: activeRect.width,
          opacity: 1
        });
      } else {
        setIndicatorStyle((prev) => ({ ...prev, opacity: 0 }));
      }
    };

    // Run after components have finished mounting/updating
    const timer = setTimeout(updateIndicator, 50);

    const resizeObserver = new ResizeObserver(() => {
      updateIndicator();
    });
    if (navContainerRef.current) {
      resizeObserver.observe(navContainerRef.current);
    }

    window.addEventListener("resize", updateIndicator);
    return () => {
      clearTimeout(timer);
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateIndicator);
    };
  }, [activeTab, selectedIOCId]);

  // Load dashboard stats
  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await getDashboardStats();
      if (data.success) {
        setStats(data.stats);
        setRecentIOCs(data.recent);
      }
    } catch (err) {
      console.error("Failed to load dashboard statistics:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();

    // Setup WebSockets (dynamic URL for local dev vs production)
    const socketUrl = import.meta.env.VITE_SOCKET_URL || (window.location.hostname === "localhost" ? "http://localhost:5050" : window.location.origin);
    const socket = io(socketUrl);
    
    socket.on("new-ioc-alert", (newIOC) => {
      // Add socket alert
      setAlerts((prev) => [
        {
          id: Math.random().toString(),
          value: newIOC.value,
          type: newIOC.type,
          severity: newIOC.severity,
          score: newIOC.score,
          time: new Date(newIOC.createdAt).toLocaleTimeString()
        },
        ...prev
      ]);
      
      // Auto reload dashboard stats
      loadStats();
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleQuickLookup = async (e) => {
    e.preventDefault();
    if (!quickSearchValue.trim()) return;

    try {
      setSearchLoading(true);
      const result = await lookupIOC(quickSearchType, quickSearchValue.trim());
      if (result.success) {
        setSelectedIOCId(result.ioc._id);
        setQuickSearchValue("");
        loadStats(); // reload stats in background
      } else {
        alert(result.message || "Lookup failed.");
      }
    } catch (error) {
      console.error(error);
      alert("Error occurred while looking up IOC.");
    } finally {
      setSearchLoading(false);
    }
  };

  const removeAlert = (id) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  const generateSparklinePath = (score) => {
    const seed = (score || 50) / 10;
    let points = [];
    for (let i = 0; i <= 6; i++) {
      const x = i * 10;
      const y = 10 + Math.sin(i + seed) * 8 + (Math.cos(i * 2 + seed) * 4);
      points.push(`${x},${y}`);
    }
    return `M ${points.join(" L ")}`;
  };

  return (
    <div className={`app-container ${activeTab === "dashboard" && !selectedIOCId ? "input-page" : ""}`}>
      {activeTab === "dashboard" && !selectedIOCId && (
        <div style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: 1,
          pointerEvents: "none",
          opacity: 1.0,
          overflow: "hidden"
        }}>
          <WorldMap dots={mapDots} lineColor="#ef4444" />
        </div>
      )}

      {/* Top Navbar */}
      <nav className="navbar">
        <div className="navbar-left">
          <div 
            className="logo-container" 
            style={{ cursor: "pointer" }}
            onClick={() => { setActiveTab("dashboard"); setSelectedIOCId(null); }}
          >
            <span className="logo-text">
              THREAT<span className="logo-red">FORGE</span>
            </span>
          </div>

          {/* Shodan-style navbar search bar - only active when inside detailed view or list views */}
          {(selectedIOCId !== null || activeTab !== "dashboard") && (
            <form className="navbar-search" onSubmit={handleQuickLookup}>
              <select 
                className="navbar-search-select"
                value={quickSearchType}
                onChange={(e) => setQuickSearchType(e.target.value)}
              >
                <option value="ip">IP</option>
                <option value="domain">Domain</option>
                <option value="url">URL</option>
                <option value="hash">Hash</option>
              </select>
              <input 
                type="text" 
                placeholder="Quick lookup..." 
                className="navbar-search-input"
                value={quickSearchValue}
                onChange={(e) => setQuickSearchValue(e.target.value)}
                disabled={searchLoading}
              />
              <button type="submit" className="navbar-search-btn" disabled={searchLoading}>
                {searchLoading ? (
                  <RefreshCw size={14} className="loading-spinner-small" />
                ) : (
                  <Search size={14} />
                )}
              </button>
            </form>
          )}
        </div>

        <div className="navbar-right">
          <div className="navbar-nav" ref={navContainerRef}>
            <div 
              className="navbar-nav-indicator"
              style={{
                left: indicatorStyle.left,
                width: indicatorStyle.width,
                opacity: indicatorStyle.opacity
              }}
            ></div>
            <div 
              className={`navbar-nav-item ${activeTab === "dashboard" && selectedIOCId === null ? "active" : ""}`}
              onClick={() => { setActiveTab("dashboard"); setSelectedIOCId(null); }}
            >
              Dashboard
            </div>
            <div 
              className={`navbar-nav-item ${activeTab === "history" ? "active" : ""}`}
              onClick={() => { setActiveTab("history"); setSelectedIOCId(null); }}
            >
              IOC History
            </div>
            <div 
              className={`navbar-nav-item ${activeTab === "bulk" ? "active" : ""}`}
              onClick={() => { setActiveTab("bulk"); setSelectedIOCId(null); }}
            >
              Bulk Lookup
            </div>
          </div>
        </div>
      </nav>

      {/* Main Panel Content */}
      <div className="main-content">
        {/* Dynamic Detail Overlay or Main Tabs */}
        {selectedIOCId ? (
          <div className="fade-in-up">
            <IOCDetails 
              id={selectedIOCId} 
              onClose={() => { setSelectedIOCId(null); loadStats(); }}
              analystName={analystName}
            />
          </div>
        ) : (
          <>
            {activeTab === "dashboard" && (
              <div className="dashboard-hero-layout fade-in-up">
                <div className="hero-search-panel">
                  {/* FOFA style Centered Logo */}
                  <div className="fofa-logo-large">
                    THREAT<span className="logo-red">FORGE</span>
                  </div>
                  
                  <p className="hero-subtitle">
                    Enrich and analyze threat intelligence indicators using a real-time global telemetry network.
                  </p>

                  {/* FOFA style Search box */}
                  {/* Redesigned search capsule (Apple liquid glass style) */}
                  <form className="fofa-search-capsule" onSubmit={handleQuickLookup} style={{ width: "100%", maxWidth: "100%" }}>
                    <select 
                      className="fofa-capsule-select"
                      value={quickSearchType}
                      onChange={(e) => setQuickSearchType(e.target.value)}
                    >
                      <option value="ip">IP Address</option>
                      <option value="domain">Domain</option>
                      <option value="url">URL</option>
                      <option value="hash">Hash</option>
                    </select>
                    <div className="fofa-capsule-divider"></div>
                    <input 
                      type="text"
                      className="fofa-capsule-input"
                      placeholder={getPlaceholderText(quickSearchType)}
                      value={quickSearchValue}
                      onChange={(e) => setQuickSearchValue(e.target.value)}
                      disabled={searchLoading}
                    />
                    <button type="submit" className="fofa-capsule-btn" disabled={searchLoading}>
                      {searchLoading ? (
                        <RefreshCw size={18} className="loading-spinner-small" />
                      ) : (
                        <Search size={18} />
                      )}
                    </button>
                  </form>

                  {/* SOC Quotes Carousel */}
                  <div className="soc-quote-container" style={{ marginTop: "12px" }}>
                    <span className="soc-quote-label">SOC Intel</span>
                    <span className="soc-quote-text">"{SOC_QUOTES[quoteIndex]}"</span>
                  </div>
                </div>
              </div>
            )}
            {activeTab === "history" && (
              <div className="fade-in-up">
                <IOCList onSelectIOC={setSelectedIOCId} />
              </div>
            )}
            {activeTab === "bulk" && (
              <div className="fade-in-up">
                <BulkLookup onComplete={() => { setActiveTab("history"); loadStats(); }} />
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      <footer className="app-footer">
        <div className="footer-content">
          <p className="footer-text">
            Built by <span className="footer-name">Sridhar Konda</span><span className="footer-divider">|</span><span className="footer-role">SecOps Analyst</span>
          </p>
          <div className="footer-socials">
            <a 
              href="https://www.linkedin.com/in/sridhar-konda" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="social-link"
              title="LinkedIn"
            >
              <LinkedInIcon size={16} />
            </a>
            <a 
              href="https://github.com/Sridharsri67" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="social-link"
              title="GitHub"
            >
              <Github size={16} />
            </a>
            <a 
              href="mailto:sridharsri5959@gmail.com" 
              className="social-link"
              title="Email"
            >
              <Mail size={16} />
            </a>
          </div>
        </div>
      </footer>

      {/* Floating Real-Time Notifications alerts */}
      <div className="socket-alerts-container">
        {alerts.map((alert) => (
          <div key={alert.id} className="socket-alert" style={{ borderLeftColor: alert.severity === "Critical" ? "#ef4444" : alert.severity === "High" ? "#f97316" : alert.severity === "Medium" ? "#eab308" : "#3b82f6" }}>
            <Bell size={18} style={{ color: alert.severity === "Critical" ? "#ef4444" : "#cbd5e0", marginTop: "2px" }} />
            <div>
              <div style={{ fontWeight: 600, fontSize: "0.85rem", color: "#f8fafc" }}>
                New IOC Enriched ({alert.severity})
              </div>
              <div className="mono" style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "4px", wordBreak: "break-all" }}>
                {alert.value}
              </div>
              <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "6px" }}>
                Score: {alert.score}/100 &bull; {alert.time}
              </div>
            </div>
            <button className="close-alert" onClick={() => removeAlert(alert.id)}>
              &times;
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
