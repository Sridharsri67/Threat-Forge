import React, { useEffect, useRef } from "react";
import * as THREE from "three";

export function ThreeCyberBackground() {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // --- Scene Setup ---
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x000000, 0.0016);

    // --- Camera Setup ---
    const camera = new THREE.PerspectiveCamera(
      50,
      window.innerWidth / window.innerHeight,
      1,
      2500
    );
    camera.position.z = 750;
    camera.position.y = 280;

    // --- Renderer Setup ---
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true, // Let the CSS gradient shine through
      powerPreference: "high-performance" 
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    // --- 3D Cyber Wave Grid (Terrain) ---
    const gridRows = 42;
    const gridCols = 42;
    const gridSpacing = 42;
    const totalPoints = gridRows * gridCols;

    const gridPositions = new Float32Array(totalPoints * 3);
    const gridColors = new Float32Array(totalPoints * 3);

    const colorWhite = new THREE.Color("#ffffff");
    const colorLightGray = new THREE.Color("#aaaaaa");
    const colorDarkGray = new THREE.Color("#333333");

    let idx = 0;
    for (let r = 0; r < gridRows; r++) {
      for (let c = 0; c < gridCols; c++) {
        const x = (c - gridCols / 2) * gridSpacing;
        const z = (r - gridRows / 2) * gridSpacing;
        const y = 0;

        gridPositions[idx * 3] = x;
        gridPositions[idx * 3 + 1] = y;
        gridPositions[idx * 3 + 2] = z;

        // Fades/interpolates colors from center (bright) to edges (dark gray)
        const dist = Math.sqrt(x * x + z * z) / 850;
        const lerpColor = colorWhite.clone().lerp(colorDarkGray, Math.min(1, dist));
        
        gridColors[idx * 3] = lerpColor.r;
        gridColors[idx * 3 + 1] = lerpColor.g;
        gridColors[idx * 3 + 2] = lerpColor.b;

        idx++;
      }
    }

    const gridGeometry = new THREE.BufferGeometry();
    gridGeometry.setAttribute("position", new THREE.BufferAttribute(gridPositions, 3));
    gridGeometry.setAttribute("color", new THREE.BufferAttribute(gridColors, 3));

    // Dynamic High-Quality Glow Texture (pure white/gray)
    const createGlowTexture = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 64;
      canvas.height = 64;
      const ctx = canvas.getContext("2d");
      const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
      gradient.addColorStop(0, "rgba(255, 255, 255, 1)");
      gradient.addColorStop(0.2, "rgba(235, 235, 240, 0.95)");
      gradient.addColorStop(0.5, "rgba(180, 180, 190, 0.35)");
      gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 64, 64);
      return new THREE.CanvasTexture(canvas);
    };

    const glowTexture = createGlowTexture();

    const gridMaterial = new THREE.PointsMaterial({
      size: 9, // Slightly smaller white dots for a clean, sleek mesh look
      vertexColors: true,
      map: glowTexture,
      transparent: true,
      opacity: 0.55,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const gridPoints = new THREE.Points(gridGeometry, gridMaterial);
    scene.add(gridPoints);

    // --- Floating Atmosphere Nodes ---
    const nodeCount = 140;
    const nodePositions = new Float32Array(nodeCount * 3);
    const nodeColors = new Float32Array(nodeCount * 3);
    const nodeDrifts = [];

    for (let i = 0; i < nodeCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const radius = 50 + Math.random() * 600;
      const x = Math.cos(theta) * radius;
      const z = Math.sin(theta) * radius;
      const y = -100 + Math.random() * 450;

      nodePositions[i * 3] = x;
      nodePositions[i * 3 + 1] = y;
      nodePositions[i * 3 + 2] = z;

      // Glowing white/light gray nodes
      const isWhite = Math.random() > 0.4;
      const c = isWhite ? colorWhite : colorLightGray;
      nodeColors[i * 3] = c.r;
      nodeColors[i * 3 + 1] = c.g;
      nodeColors[i * 3 + 2] = c.b;

      nodeDrifts.push({
        phase: Math.random() * 100,
        speed: 0.006 + Math.random() * 0.012,
        rotSpeed: (Math.random() - 0.5) * 0.0016,
        radius: radius,
        theta: theta
      });
    }

    const nodeGeometry = new THREE.BufferGeometry();
    nodeGeometry.setAttribute("position", new THREE.BufferAttribute(nodePositions, 3));
    nodeGeometry.setAttribute("color", new THREE.BufferAttribute(nodeColors, 3));

    const nodeMaterial = new THREE.PointsMaterial({
      size: 26, // Distinct nodes
      vertexColors: true,
      map: glowTexture,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const nodePoints = new THREE.Points(nodeGeometry, nodeMaterial);
    scene.add(nodePoints);

    // --- Interconnected Constellation Mesh ---
    const maxConnections = 180;
    const linePositions = new Float32Array(maxConnections * 2 * 3);
    const lineColors = new Float32Array(maxConnections * 2 * 3);

    const lineGeometry = new THREE.BufferGeometry();
    lineGeometry.setAttribute("position", new THREE.BufferAttribute(linePositions, 3));
    lineGeometry.setAttribute("color", new THREE.BufferAttribute(lineColors, 3));

    const lineMaterial = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.45, // High visibility lines
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const nodeLines = new THREE.LineSegments(lineGeometry, lineMaterial);
    scene.add(nodeLines);

    // --- Mouse Parallax ---
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (event) => {
      mouseX = event.clientX - window.innerWidth / 2;
      mouseY = event.clientY - window.innerHeight / 2;
    };

    window.addEventListener("mousemove", handleMouseMove);

    // --- Resize Handler ---
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", handleResize);

    // --- Render Loop ---
    let animationFrameId;
    let clock = new THREE.Clock();

    const animate = () => {
      const time = clock.getElapsedTime();

      // 1. Terrain grid waves math
      const gridPos = gridGeometry.attributes.position.array;
      let gridIdx = 0;
      for (let r = 0; r < gridRows; r++) {
        for (let c = 0; c < gridCols; c++) {
          const x = gridPos[gridIdx * 3];
          const z = gridPos[gridIdx * 3 + 2];
          
          const d = Math.sqrt(x * x + z * z);
          gridPos[gridIdx * 3 + 1] = Math.sin(d * 0.014 - time * 2.0) * 60 + Math.cos(x * 0.006 + time * 1.2) * 22;

          gridIdx++;
        }
      }
      gridGeometry.attributes.position.needsUpdate = true;

      // 2. Swirling drift of floating nodes
      const nodes = nodeGeometry.attributes.position.array;
      const lines = lineGeometry.attributes.position.array;
      const lColors = new Float32Array(maxConnections * 2 * 3);

      for (let i = 0; i < nodeCount; i++) {
        const drift = nodeDrifts[i];
        
        drift.theta += drift.rotSpeed;
        nodes[i * 3] = Math.cos(drift.theta) * drift.radius;
        nodes[i * 3 + 2] = Math.sin(drift.theta) * drift.radius;
        
        nodes[i * 3 + 1] += Math.sin(time * drift.speed * 18 + drift.phase) * 0.75;
      }
      nodeGeometry.attributes.position.needsUpdate = true;

      // 3. Connect nodes that are close to each other
      let connectionCount = 0;
      for (let i = 0; i < nodeCount; i++) {
        if (connectionCount >= maxConnections) break;

        const x1 = nodes[i * 3];
        const y1 = nodes[i * 3 + 1];
        const z1 = nodes[i * 3 + 2];

        for (let j = i + 1; j < nodeCount; j++) {
          if (connectionCount >= maxConnections) break;

          const x2 = nodes[j * 3];
          const y2 = nodes[j * 3 + 1];
          const z2 = nodes[j * 3 + 2];

          const dx = x1 - x2;
          const dy = y1 - y2;
          const dz = z1 - z2;
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

          if (dist < 190) {
            const index = connectionCount * 6;
            
            lines[index] = x1;
            lines[index + 1] = y1;
            lines[index + 2] = z1;

            lines[index + 3] = x2;
            lines[index + 4] = y2;
            lines[index + 5] = z2;

            const strength = 1.0 - (dist / 190);
            
            // Minimal white/gray mesh line gradient
            lColors[index] = colorLightGray.r * strength * 0.35;
            lColors[index + 1] = colorLightGray.g * strength * 0.35;
            lColors[index + 2] = colorLightGray.b * strength * 0.35;

            lColors[index + 3] = colorWhite.r * strength * 0.35;
            lColors[index + 4] = colorWhite.g * strength * 0.35;
            lColors[index + 5] = colorWhite.b * strength * 0.35;

            connectionCount++;
          }
        }
      }

      // Hide unused connection line slots
      for (let i = connectionCount; i < maxConnections; i++) {
        const index = i * 6;
        lines[index] = 0;
        lines[index + 1] = 0;
        lines[index + 2] = 0;
        lines[index + 3] = 0;
        lines[index + 4] = 0;
        lines[index + 5] = 0;
      }

      lineGeometry.attributes.position.needsUpdate = true;
      lineGeometry.setAttribute("color", new THREE.BufferAttribute(lColors, 3));
      lineGeometry.attributes.color.needsUpdate = true;

      // 4. Parallax Cam easing
      targetX = mouseX * 0.4;
      targetY = mouseY * 0.2;

      camera.position.x += (targetX - camera.position.x) * 0.055;
      camera.position.y += ((280 - targetY) - camera.position.y) * 0.055;
      camera.lookAt(new THREE.Vector3(0, 40, 0));

      // Slow orbital rotate
      gridPoints.rotation.y = time * 0.03;
      nodePoints.rotation.y = time * 0.045;
      nodeLines.rotation.y = time * 0.045;

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    // --- Cleanup ---
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      gridGeometry.dispose();
      gridMaterial.dispose();
      nodeGeometry.dispose();
      nodeMaterial.dispose();
      lineGeometry.dispose();
      lineMaterial.dispose();
      glowTexture.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="three-canvas-container"
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: 1,
        pointerEvents: "none",
        overflow: "hidden"
      }}
    />
  );
}
