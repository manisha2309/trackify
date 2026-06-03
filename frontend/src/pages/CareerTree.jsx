"use client";
import { useState, useRef, useEffect, useCallback } from "react";

const CAREER_DATA = {
  id: "root",
  label: "Your Career",
  icon: "🌱",
  color: "#7c3aed",
  x: 0,
  y: 0,
  children: [
    {
      id: "swe",
      label: "Software Engineer",
      icon: "💻",
      color: "#2563eb",
      salary: "$95k–$180k",
      demand: "Very High",
      skills: ["DSA", "System Design", "Git"],
      children: [
        {
          id: "frontend",
          label: "Frontend Dev",
          icon: "🎨",
          color: "#0891b2",
          salary: "$85k–$160k",
          demand: "High",
          skills: ["React", "CSS", "TypeScript"],
          children: [
            { id: "ux-eng", label: "UX Engineer", icon: "✏️", color: "#06b6d4", salary: "$100k–$170k", demand: "Medium", skills: ["Figma", "A11y", "Motion"], children: [] },
            { id: "web3", label: "Web3 Dev", icon: "⛓️", color: "#8b5cf6", salary: "$120k–$200k", demand: "Medium", skills: ["Solidity", "Web3.js", "DeFi"], children: [] },
          ],
        },
        {
          id: "backend",
          label: "Backend Dev",
          icon: "⚙️",
          color: "#1d4ed8",
          salary: "$90k–$175k",
          demand: "Very High",
          skills: ["Node.js", "SQL", "APIs"],
          children: [
            { id: "devops", label: "DevOps Engineer", icon: "🚀", color: "#0369a1", salary: "$100k–$185k", demand: "High", skills: ["Docker", "K8s", "CI/CD"], children: [] },
            { id: "cloud", label: "Cloud Architect", icon: "☁️", color: "#0284c7", salary: "$130k–$220k", demand: "High", skills: ["AWS", "Azure", "Terraform"], children: [] },
          ],
        },
        {
          id: "mobile",
          label: "Mobile Dev",
          icon: "📱",
          color: "#4f46e5",
          salary: "$90k–$165k",
          demand: "High",
          skills: ["React Native", "Swift", "Kotlin"],
          children: [
            { id: "ios", label: "iOS Dev", icon: "🍎", color: "#6d28d9", salary: "$95k–$170k", demand: "Medium", skills: ["Swift", "SwiftUI", "Xcode"], children: [] },
            { id: "android", label: "Android Dev", icon: "🤖", color: "#7c3aed", salary: "$90k–$165k", demand: "Medium", skills: ["Kotlin", "Jetpack", "ADB"], children: [] },
          ],
        },
      ],
    },
    {
      id: "data",
      label: "Data Science",
      icon: "📊",
      color: "#059669",
      salary: "$100k–$190k",
      demand: "Very High",
      skills: ["Python", "ML", "Statistics"],
      children: [
        {
          id: "ml",
          label: "ML Engineer",
          icon: "🤖",
          color: "#10b981",
          salary: "$120k–$210k",
          demand: "Very High",
          skills: ["PyTorch", "TensorFlow", "MLOps"],
          children: [
            { id: "llm", label: "LLM Engineer", icon: "🧠", color: "#34d399", salary: "$150k–$280k", demand: "Explosive", skills: ["LangChain", "RAG", "RLHF"], children: [] },
            { id: "cv", label: "Computer Vision", icon: "👁️", color: "#6ee7b7", salary: "$120k–$200k", demand: "High", skills: ["OpenCV", "YOLO", "CNNs"], children: [] },
          ],
        },
        {
          id: "analyst",
          label: "Data Analyst",
          icon: "📈",
          color: "#047857",
          salary: "$70k–$130k",
          demand: "High",
          skills: ["SQL", "Tableau", "Excel"],
          children: [
            { id: "bi", label: "BI Developer", icon: "📉", color: "#065f46", salary: "$80k–$140k", demand: "Medium", skills: ["Power BI", "DAX", "ETL"], children: [] },
          ],
        },
      ],
    },
    {
      id: "pm",
      label: "Product Manager",
      icon: "🎯",
      color: "#d97706",
      salary: "$100k–$200k",
      demand: "High",
      skills: ["Roadmapping", "Agile", "UX"],
      children: [
        { id: "apm", label: "Associate PM", icon: "🌱", color: "#f59e0b", salary: "$80k–$130k", demand: "High", skills: ["Jira", "Analytics", "PRDs"], children: [] },
        { id: "tpm", label: "Technical PM", icon: "🔧", color: "#b45309", salary: "$120k–$210k", demand: "High", skills: ["APIs", "Eng Collab", "SQL"], children: [] },
        {
          id: "gpm",
          label: "Growth PM",
          icon: "📣",
          color: "#92400e",
          salary: "$110k–$190k",
          demand: "Medium",
          skills: ["A/B Testing", "Funnels", "SEO"],
          children: [],
        },
      ],
    },
    {
      id: "design",
      label: "UX/UI Design",
      icon: "🎨",
      color: "#db2777",
      salary: "$75k–$155k",
      demand: "High",
      skills: ["Figma", "User Research", "Prototyping"],
      children: [
        { id: "product-design", label: "Product Designer", icon: "💡", color: "#ec4899", salary: "$90k–$165k", demand: "High", skills: ["Design Systems", "Wireframing", "A/B Testing"], children: [] },
        { id: "motion", label: "Motion Designer", icon: "✨", color: "#f472b6", salary: "$70k–$130k", demand: "Medium", skills: ["After Effects", "Lottie", "GSAP"], children: [] },
      ],
    },
    {
      id: "security",
      label: "Cybersecurity",
      icon: "🔐",
      color: "#dc2626",
      salary: "$90k–$185k",
      demand: "Very High",
      skills: ["Networking", "Pen Testing", "SIEM"],
      children: [
        { id: "pentest", label: "Pen Tester", icon: "🕵️", color: "#ef4444", salary: "$95k–$175k", demand: "High", skills: ["Kali", "Burp Suite", "OSCP"], children: [] },
        { id: "soc", label: "SOC Analyst", icon: "🛡️", color: "#b91c1c", salary: "$70k–$130k", demand: "Very High", skills: ["SIEM", "IDS", "Incident Response"], children: [] },
      ],
    },
  ],
};

// Flatten tree to nodes + edges
function flattenTree(node, parentId = null, depth = 0, index = 0, siblingCount = 1, parentX = 0, parentY = 0) {
  const LEVEL_GAP = 260;
  const NODE_SPREAD = 170;

  let x, y;
  if (depth === 0) {
    x = 700; y = 420;
  } else {
    const spread = siblingCount * NODE_SPREAD;
    const startOffset = -spread / 2 + NODE_SPREAD / 2;
    const angleOffset = startOffset + index * NODE_SPREAD;
    x = parentX + angleOffset;
    y = parentY + LEVEL_GAP;
  }

  const nodes = [{ ...node, x, y, depth, parentId, children: undefined }];
  const edges = parentId ? [{ from: parentId, to: node.id }] : [];

  (node.children || []).forEach((child, i) => {
    const { nodes: cn, edges: ce } = flattenTree(child, node.id, depth + 1, i, node.children.length, x, y);
    nodes.push(...cn);
    edges.push(...ce);
  });

  return { nodes, edges };
}

const DEMAND_COLOR = {
  "Explosive": "#ff6b00",
  "Very High": "#22c55e",
  "High": "#3b82f6",
  "Medium": "#f59e0b",
};

export default function CareerTree() {
  const svgRef = useRef(null);
  const [selected, setSelected] = useState(null);
  const [hovered, setHovered] = useState(null);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(0.72);
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef(null);
  const [expandedNodes, setExpandedNodes] = useState(new Set(["root", "swe", "data", "pm", "design", "security"]));
  const [animatedNodes, setAnimatedNodes] = useState(new Set(["root"]));

  // Build visible tree based on expanded nodes
  const { nodes, edges } = flattenTree(CAREER_DATA);
  const visibleNodeIds = new Set();
  nodes.forEach(n => {
    if (n.depth === 0) visibleNodeIds.add(n.id);
    if (n.parentId && expandedNodes.has(n.parentId)) visibleNodeIds.add(n.id);
    // also show if grandparent expanded
    const parent = nodes.find(x => x.id === n.parentId);
    if (parent && parent.parentId && expandedNodes.has(parent.parentId)) visibleNodeIds.add(n.id);
    if (expandedNodes.has(n.id)) visibleNodeIds.add(n.id);
  });

  const visibleNodes = nodes.filter(n => visibleNodeIds.has(n.id));
  const visibleEdges = edges.filter(e => visibleNodeIds.has(e.from) && visibleNodeIds.has(e.to));

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedNodes(new Set(nodes.map(n => n.id)));
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const handleWheel = useCallback((e) => {
    e.preventDefault();
    setZoom(z => Math.max(0.3, Math.min(2, z - e.deltaY * 0.001)));
  }, []);

  const handleMouseDown = (e) => {
    if (e.target === svgRef.current || e.target.tagName === "svg" || e.target.classList.contains("bg-rect")) {
      setIsDragging(true);
      dragStart.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
    }
  };

  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return;
    setPan({ x: e.clientX - dragStart.current.x, y: e.clientY - dragStart.current.y });
  }, [isDragging]);

  const handleMouseUp = () => setIsDragging(false);

  const toggleExpand = (nodeId) => {
    setExpandedNodes(prev => {
      const next = new Set(prev);
      if (next.has(nodeId)) next.delete(nodeId);
      else next.add(nodeId);
      return next;
    });
  };

  const nodeMap = Object.fromEntries(nodes.map(n => [n.id, n]));

  const selectedNode = selected ? nodes.find(n => n.id === selected) : null;

  return (
    <div style={{
      width: "100%", height: "100vh",
      background: "#0a0a14",
      fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
      display: "flex", flexDirection: "column",
      overflow: "hidden",
      color: "#e2e8f0"
    }}>
      {/* Header */}
      <div style={{
        padding: "18px 28px",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: "rgba(255,255,255,0.02)",
        backdropFilter: "blur(10px)",
        zIndex: 10,
        flexShrink: 0
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12,
            background: "linear-gradient(135deg, #7c3aed, #2563eb)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 20, boxShadow: "0 0 20px rgba(124,58,237,0.4)"
          }}>🌐</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 18, letterSpacing: "-0.3px" }}>3D Career Tree</div>
            <div style={{ fontSize: 12, color: "#64748b" }}>Interactive career path explorer</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <div style={{
            padding: "6px 14px", borderRadius: 8,
            background: "rgba(124,58,237,0.15)", border: "1px solid rgba(124,58,237,0.3)",
            fontSize: 12, color: "#a78bfa", cursor: "pointer",
            display: "flex", alignItems: "center", gap: 6
          }} onClick={() => { setZoom(0.72); setPan({ x: 0, y: 0 }); }}>
            <span>⊕</span> Reset View
          </div>
          <div style={{ fontSize: 12, color: "#475569", padding: "6px 14px", background: "rgba(255,255,255,0.04)", borderRadius: 8, border: "1px solid rgba(255,255,255,0.06)" }}>
            Scroll to zoom · Drag to pan · Click node to expand
          </div>
        </div>
      </div>

      {/* Main area */}
      <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
        <svg
          ref={svgRef}
          width="100%" height="100%"
          style={{ cursor: isDragging ? "grabbing" : "grab", display: "block" }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
        >
          <defs>
            <radialGradient id="bgGrad" cx="50%" cy="40%" r="60%">
              <stop offset="0%" stopColor="#0f0f2e" />
              <stop offset="100%" stopColor="#0a0a14" />
            </radialGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            <filter id="glow-strong">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            {nodes.map(n => (
              <radialGradient key={`grad-${n.id}`} id={`grad-${n.id}`} cx="35%" cy="30%" r="70%">
                <stop offset="0%" stopColor={n.color} stopOpacity="0.95" />
                <stop offset="100%" stopColor={n.color} stopOpacity="0.6" />
              </radialGradient>
            ))}
          </defs>

          <rect className="bg-rect" width="100%" height="100%" fill="url(#bgGrad)" />

          {/* Grid dots */}
          <pattern id="dots" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
            <circle cx="20" cy="20" r="1" fill="rgba(255,255,255,0.04)" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#dots)" />

          <g transform={`translate(${pan.x + window.innerWidth / 2 - 700 * zoom}, ${pan.y + 40}) scale(${zoom})`}>
            {/* Edges */}
            {visibleEdges.map(edge => {
              const from = nodeMap[edge.from];
              const to = nodeMap[edge.to];
              if (!from || !to) return null;
              const mx = (from.x + to.x) / 2;
              const my = (from.y + to.y) / 2;
              return (
                <g key={`${edge.from}-${edge.to}`}>
                  <path
                    d={`M ${from.x} ${from.y} C ${from.x} ${my + 40}, ${to.x} ${my - 40}, ${to.x} ${to.y}`}
                    fill="none"
                    stroke={from.color}
                    strokeWidth={selected === from.id || selected === to.id ? 2.5 : 1.5}
                    strokeOpacity={selected && selected !== from.id && selected !== to.id ? 0.15 : 0.35}
                    strokeDasharray={selected === from.id || selected === to.id ? "none" : "none"}
                  />
                  {/* Animated dot along edge */}
                  <circle r="2.5" fill={from.color} opacity="0.7">
                    <animateMotion
                      dur={`${2 + Math.random() * 2}s`}
                      repeatCount="indefinite"
                      path={`M ${from.x} ${from.y} C ${from.x} ${my + 40}, ${to.x} ${my - 40}, ${to.x} ${to.y}`}
                    />
                  </circle>
                </g>
              );
            })}

            {/* Nodes */}
            {visibleNodes.map(node => {
              const isSelected = selected === node.id;
              const isHovered = hovered === node.id;
              const isRoot = node.depth === 0;
              const r = isRoot ? 52 : node.depth === 1 ? 40 : node.depth === 2 ? 34 : 28;
              const hasChildren = (CAREER_DATA.children || []).length > 0;
              const originalNode = nodes.find(n => n.id === node.id);
              const childCount = node.depth === 0 ? CAREER_DATA.children.length :
                nodes.find(n => n.id === node.id)?.children?.length || 0;

              return (
                <g key={node.id}
                  transform={`translate(${node.x}, ${node.y})`}
                  style={{ cursor: "pointer" }}
                  onClick={(e) => { e.stopPropagation(); setSelected(isSelected ? null : node.id); toggleExpand(node.id); }}
                  onMouseEnter={() => setHovered(node.id)}
                  onMouseLeave={() => setHovered(null)}
                >
                  {/* Outer glow ring */}
                  {(isSelected || isHovered) && (
                    <circle r={r + 14} fill="none" stroke={node.color} strokeWidth={1.5} strokeOpacity={0.3}
                      strokeDasharray="4 4">
                      <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="8s" repeatCount="indefinite" />
                    </circle>
                  )}

                  {/* Pulse ring for root */}
                  {isRoot && (
                    <circle r={r + 8} fill="none" stroke={node.color} strokeWidth="1" strokeOpacity="0.4">
                      <animate attributeName="r" values={`${r+6};${r+20};${r+6}`} dur="3s" repeatCount="indefinite" />
                      <animate attributeName="stroke-opacity" values="0.4;0;0.4" dur="3s" repeatCount="indefinite" />
                    </circle>
                  )}

                  {/* Shadow */}
                  <circle r={r + 4} fill={node.color} fillOpacity="0.1" />

                  {/* Main circle */}
                  <circle
                    r={r}
                    fill={`url(#grad-${node.id})`}
                    stroke={node.color}
                    strokeWidth={isSelected ? 3 : 1.5}
                    strokeOpacity={isSelected ? 1 : 0.6}
                    filter={isSelected || isHovered ? "url(#glow)" : "none"}
                  />

                  {/* Inner highlight */}
                  <circle r={r * 0.55} cx={-r * 0.2} cy={-r * 0.25}
                    fill="white" fillOpacity={isSelected ? 0.12 : 0.07} />

                  {/* Icon */}
                  <text textAnchor="middle" dominantBaseline="central"
                    y={node.label.length > 10 ? -6 : 0}
                    fontSize={isRoot ? 26 : node.depth === 1 ? 20 : 16}>
                    {node.icon}
                  </text>

                  {/* Label under icon for multi-word */}
                  {node.depth > 0 && (
                    <text textAnchor="middle" y={r + 18}
                      fontSize={node.depth === 1 ? 12 : 10}
                      fill="white" fontWeight="600" opacity={0.9}>
                      {node.label}
                    </text>
                  )}

                  {isRoot && (
                    <text textAnchor="middle" y={r + 18} fontSize={13} fill="white" fontWeight="700">
                      Your Career
                    </text>
                  )}

                  {/* Expand indicator */}
                  {childCount > 0 && node.depth < 3 && (
                    <g transform={`translate(${r - 8}, ${-r + 8})`}>
                      <circle r={9} fill={expandedNodes.has(node.id) ? node.color : "#1e293b"}
                        stroke={node.color} strokeWidth={1.5} />
                      <text textAnchor="middle" dominantBaseline="central" fontSize={11}
                        fill="white" fontWeight="700">
                        {expandedNodes.has(node.id) ? "−" : "+"}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </g>
        </svg>

        {/* Info Panel */}
        {selectedNode && (
          <div style={{
            position: "absolute", right: 20, top: 20,
            width: 300,
            background: "rgba(10,10,20,0.92)",
            border: `1px solid ${selectedNode.color}40`,
            borderRadius: 20,
            padding: 24,
            backdropFilter: "blur(20px)",
            boxShadow: `0 0 40px ${selectedNode.color}20, 0 20px 60px rgba(0,0,0,0.5)`,
            animation: "slideIn 0.2s ease"
          }}>
            <style>{`
              @keyframes slideIn { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
              @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            `}</style>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <div style={{
                width: 48, height: 48, borderRadius: 14,
                background: `${selectedNode.color}25`,
                border: `1.5px solid ${selectedNode.color}50`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 24
              }}>{selectedNode.icon}</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 17 }}>{selectedNode.label}</div>
                <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>Career Path</div>
              </div>
              <div style={{ marginLeft: "auto", cursor: "pointer", opacity: 0.5, fontSize: 18 }}
                onClick={() => setSelected(null)}>✕</div>
            </div>

            {selectedNode.salary && (
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Salary Range</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: "#22c55e" }}>{selectedNode.salary}</div>
              </div>
            )}

            {selectedNode.demand && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Market Demand</div>
                <div style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  padding: "4px 12px", borderRadius: 20,
                  background: `${DEMAND_COLOR[selectedNode.demand]}20`,
                  border: `1px solid ${DEMAND_COLOR[selectedNode.demand]}40`,
                  fontSize: 13, fontWeight: 600, color: DEMAND_COLOR[selectedNode.demand]
                }}>
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: DEMAND_COLOR[selectedNode.demand], display: "inline-block" }} />
                  {selectedNode.demand}
                </div>
              </div>
            )}

            {selectedNode.skills && selectedNode.skills.length > 0 && (
              <div>
                <div style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Key Skills</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {selectedNode.skills.map(skill => (
                    <span key={skill} style={{
                      padding: "4px 10px", borderRadius: 8,
                      background: `${selectedNode.color}18`,
                      border: `1px solid ${selectedNode.color}30`,
                      fontSize: 12, color: selectedNode.color, fontWeight: 500
                    }}>{skill}</span>
                  ))}
                </div>
              </div>
            )}

            <div style={{
              marginTop: 20, padding: "10px 16px", borderRadius: 12,
              background: `${selectedNode.color}12`,
              border: `1px solid ${selectedNode.color}25`,
              fontSize: 12, color: "#94a3b8",
              display: "flex", alignItems: "center", gap: 8
            }}>
              <span>💡</span>
              <span>Click node on tree to <strong style={{ color: "#e2e8f0" }}>expand branches</strong></span>
            </div>
          </div>
        )}

        {/* Zoom controls */}
        <div style={{
          position: "absolute", bottom: 24, right: 24,
          display: "flex", flexDirection: "column", gap: 4
        }}>
          {[{ label: "+", delta: 0.15 }, { label: "−", delta: -0.15 }].map(btn => (
            <button key={btn.label} onClick={() => setZoom(z => Math.max(0.3, Math.min(2, z + btn.delta)))}
              style={{
                width: 36, height: 36, borderRadius: 10, border: "1px solid rgba(255,255,255,0.1)",
                background: "rgba(255,255,255,0.06)", color: "white", fontSize: 18,
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                backdropFilter: "blur(10px)"
              }}>{btn.label}</button>
          ))}
          <div style={{
            textAlign: "center", fontSize: 10, color: "#475569", marginTop: 2
          }}>{Math.round(zoom * 100)}%</div>
        </div>

        {/* Legend */}
        <div style={{
          position: "absolute", bottom: 24, left: 20,
          background: "rgba(10,10,20,0.85)", backdropFilter: "blur(10px)",
          border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14,
          padding: "12px 16px"
        }}>
          <div style={{ fontSize: 10, color: "#475569", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>Career Domains</div>
          {[
            { color: "#2563eb", label: "Software Engineering" },
            { color: "#059669", label: "Data Science & AI" },
            { color: "#d97706", label: "Product Management" },
            { color: "#db2777", label: "Design" },
            { color: "#dc2626", label: "Cybersecurity" },
          ].map(item => (
            <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: item.color, flexShrink: 0 }} />
              <span style={{ fontSize: 11, color: "#94a3b8" }}>{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}