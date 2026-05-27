import { useRef } from "react";
import { motion } from "framer-motion";
import DottedMap from "dotted-map";

export function WorldMap({ dots = [], lineColor = "#ef4444", dotColor = "rgba(255, 255, 255, 0.7)" }) {
  const svgRef = useRef(null);
  
  // Create the dotted map grid
  const map = new DottedMap({ height: 100, grid: "diagonal" });

  const svgMap = map.getSVG({
    radius: 0.22,
    color: dotColor,
    shape: "circle",
    backgroundColor: "transparent",
  });

  // Base64 encode the SVG map to ensure it parses perfectly in all browser environments
  const base64Svg = btoa(unescape(encodeURIComponent(svgMap)));
  const mapSrc = `data:image/svg+xml;base64,${base64Svg}`;

  const projectPoint = (lat, lng) => {
    const x = (lng + 180) * (800 / 360);
    const y = (90 - lat) * (400 / 180);
    return { x, y };
  };

  const createCurvedPath = (start, end) => {
    const midX = (start.x + end.x) / 2;
    const midY = Math.min(start.y, end.y) - 50;
    return `M ${start.x} ${start.y} Q ${midX} ${midY} ${end.x} ${end.y}`;
  };

  return (
    <div style={{ width: "100%", height: "100%", position: "relative", fontFamily: "sans-serif" }}>
      <img
        src={mapSrc}
        style={{
          height: "100%",
          width: "100%",
          objectFit: "contain",
          WebkitMaskImage: "linear-gradient(to bottom, transparent, white 10%, white 90%, transparent)",
          maskImage: "linear-gradient(to bottom, transparent, white 10%, white 90%, transparent)",
          pointerEvents: "none",
          userSelect: "none",
          opacity: 0.3, // Subtle background dotted grid to avoid dominating
        }}
        alt="world map"
        draggable={false}
      />
      <svg
        ref={svgRef}
        viewBox="0 0 800 400"
        style={{
          width: "100%",
          height: "100%",
          position: "absolute",
          top: 0,
          left: 0,
          pointerEvents: "none",
          userSelect: "none",
        }}
      >
        <defs>
          <filter id="glow-filter" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <linearGradient id="path-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="transparent" stopOpacity="0" />
            <stop offset="5%" stopColor={lineColor} stopOpacity="1.0" />
            <stop offset="95%" stopColor={lineColor} stopOpacity="1.0" />
            <stop offset="100%" stopColor="transparent" stopOpacity="0" />
          </linearGradient>
        </defs>

        {dots.map((dot, i) => {
          const startPoint = projectPoint(dot.start.lat, dot.start.lng);
          const endPoint = projectPoint(dot.end.lat, dot.end.lng);
          return (
            <g key={`connection-group-${i}`}>
              {/* Glow path underneath */}
              <motion.path
                d={createCurvedPath(startPoint, endPoint)}
                fill="none"
                stroke={lineColor}
                strokeWidth="4.5"
                opacity="0.45"
                filter="url(#glow-filter)"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{
                  duration: 2.5,
                  delay: 0.4 * i,
                  ease: "easeOut",
                }}
              />

              {/* Main sharp neon Curve path between start and end */}
              <motion.path
                d={createCurvedPath(startPoint, endPoint)}
                fill="none"
                stroke="url(#path-gradient)"
                strokeWidth="1.6"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{
                  duration: 2.5,
                  delay: 0.4 * i,
                  ease: "easeOut",
                }}
              />

              {/* Start Dot with Pulsing Ring */}
              <g opacity="1.0" filter="url(#glow-filter)">
                <circle
                  cx={startPoint.x}
                  cy={startPoint.y}
                  r="3.2"
                  fill={lineColor}
                />
                <circle
                  cx={startPoint.x}
                  cy={startPoint.y}
                  r="3.2"
                  fill={lineColor}
                  opacity="0.6"
                >
                  <animate
                    attributeName="r"
                    from="3.2"
                    to="12"
                    dur="2s"
                    begin="0s"
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="opacity"
                    from="0.6"
                    to="0"
                    dur="2s"
                    begin="0s"
                    repeatCount="indefinite"
                  />
                </circle>
              </g>

              {/* End Dot with Pulsing Ring */}
              <g opacity="1.0" filter="url(#glow-filter)">
                <circle
                  cx={endPoint.x}
                  cy={endPoint.y}
                  r="3.2"
                  fill={lineColor}
                />
                <circle
                  cx={endPoint.x}
                  cy={endPoint.y}
                  r="3.2"
                  fill={lineColor}
                  opacity="0.6"
                >
                  <animate
                    attributeName="r"
                    from="3.2"
                    to="12"
                    dur="2s"
                    begin="0s"
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="opacity"
                    from="0.6"
                    to="0"
                    dur="2s"
                    begin="0s"
                    repeatCount="indefinite"
                  />
                </circle>
              </g>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
