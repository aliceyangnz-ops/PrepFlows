import React from "react";

export function AnalyticsDashboard() {
  const styles = {
    root: {
      width: 390,
      minHeight: 844,
      background: "#0D1117",
      overflowY: "auto" as const,
      fontFamily: "'Inter', system-ui, sans-serif",
      padding: "0 0 48px 0",
      color: "#F0F6FC",
      boxSizing: "border-box" as const,
    },
    header: {
      padding: "24px 20px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: 700,
      margin: "0 0 4px 0",
      lineHeight: 1.2,
    },
    headerSubtitle: {
      fontSize: 13,
      color: "#8B949E",
      margin: 0,
    },
    pillSelect: {
      background: "#161B22",
      border: "1px solid rgba(255,255,255,0.08)",
      padding: "6px 12px",
      borderRadius: 100,
      fontSize: 13,
      fontWeight: 500,
      color: "#F0F6FC",
      display: "flex",
      alignItems: "center",
      gap: 6,
      cursor: "pointer",
    },
    section: {
      padding: "0 20px",
      marginBottom: 32,
    },
    kpiGrid: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 12,
    },
    card: {
      background: "#161B22",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 12,
      padding: 16,
    },
    kpiValueRow: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-end",
      marginBottom: 4,
    },
    kpiValue: {
      fontSize: 24,
      fontWeight: 600,
      lineHeight: 1,
    },
    kpiLabel: {
      fontSize: 13,
      color: "#8B949E",
      margin: 0,
    },
    kpiTrend: {
      fontSize: 11,
      fontWeight: 500,
    },
    sectionHeader: {
      marginBottom: 16,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: 600,
      margin: "0 0 4px 0",
    },
    sectionSubtitle: {
      fontSize: 13,
      color: "#8B949E",
      margin: 0,
    },
    chartContainer: {
      display: "flex",
      alignItems: "flex-end",
      justifyContent: "space-between",
      height: 120,
      paddingTop: 20,
      borderBottom: "1px solid rgba(255,255,255,0.08)",
      paddingBottom: 8,
      marginBottom: 8,
    },
    barCol: {
      display: "flex",
      flexDirection: "column" as const,
      alignItems: "center",
      gap: 8,
      width: 32,
    },
    barWrapper: {
      height: 100,
      width: "100%",
      display: "flex",
      alignItems: "flex-end",
      justifyContent: "center",
    },
    bar: {
      width: 24,
      background: "#F97316",
      borderRadius: "4px 4px 0 0",
      transition: "height 0.3s ease",
    },
    barToday: {
      background: "#F97316",
      boxShadow: "0 0 12px rgba(249,115,22,0.4)",
    },
    barEmpty: {
      background: "rgba(255,255,255,0.04)",
    },
    barLabel: {
      fontSize: 11,
      color: "#8B949E",
    },
    labelToday: {
      color: "#F97316",
      fontWeight: 600,
    },
    listCard: {
      background: "#161B22",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 12,
      overflow: "hidden",
    },
    listItem: {
      padding: 16,
      borderBottom: "1px solid rgba(255,255,255,0.08)",
    },
    listItemRow1: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 12,
    },
    listItemLeft: {
      display: "flex",
      alignItems: "center",
      gap: 8,
    },
    dot: {
      width: 8,
      height: 8,
      borderRadius: "50%",
    },
    functionName: {
      fontSize: 14,
      fontWeight: 500,
      margin: 0,
      color: "#F0F6FC",
    },
    functionDate: {
      fontSize: 12,
      color: "#8B949E",
    },
    pill: {
      padding: "2px 8px",
      borderRadius: 100,
      fontSize: 11,
      fontWeight: 600,
      display: "flex",
      alignItems: "center",
      gap: 4,
    },
    progressBg: {
      height: 4,
      background: "rgba(255,255,255,0.08)",
      borderRadius: 2,
      overflow: "hidden",
      position: "relative" as const,
    },
    progressFill: {
      position: "absolute" as const,
      top: 0,
      left: 0,
      bottom: 0,
      background: "#F97316",
      borderRadius: 2,
    },
    progressText: {
      fontSize: 11,
      color: "#8B949E",
      marginTop: 6,
      textAlign: "right" as const,
    },
    incidentRow: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      padding: "12px 0",
      borderBottom: "1px solid rgba(255,255,255,0.08)",
    },
    incidentLeft: {
      display: "flex",
      gap: 12,
    },
    incidentEmoji: {
      fontSize: 16,
    },
    incidentTitle: {
      fontSize: 14,
      fontWeight: 500,
      margin: "0 0 4px 0",
      color: "#F0F6FC",
    },
    incidentDesc: {
      fontSize: 13,
      color: "#8B949E",
      margin: 0,
    },
    incidentIcon: {
      fontSize: 14,
    },
    laborCard: {
      background: "#161B22",
      border: "1px solid rgba(255,255,255,0.08)",
      borderLeft: "4px solid #EAB308",
      borderRadius: 12,
      padding: 20,
    },
    laborLabel: {
      fontSize: 13,
      color: "#8B949E",
      margin: "0 0 8px 0",
    },
    laborValue: {
      fontSize: 28,
      fontWeight: 600,
      margin: "0 0 4px 0",
      lineHeight: 1,
    },
    laborBench: {
      fontSize: 13,
      color: "#8B949E",
      margin: "0 0 16px 0",
    },
    laborWarn: {
      fontSize: 12,
      color: "#EAB308",
      background: "rgba(234,179,8,0.1)",
      display: "inline-block",
      padding: "4px 8px",
      borderRadius: 4,
      fontWeight: 500,
      margin: 0,
    },
  };

  const chartData = [
    { day: "M", pct: 78 },
    { day: "T", pct: 85 },
    { day: "W", pct: 92 },
    { day: "T", pct: 88 },
    { day: "F", pct: 95 },
    { day: "S", pct: 74, today: true },
    { day: "S", pct: 0 },
  ];

  return (
    <div style={styles.root}>
      {/* SECTION 1: Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.headerTitle}>Analytics</h1>
          <p style={styles.headerSubtitle}>May 2025 · Week 20</p>
        </div>
        <div style={styles.pillSelect}>
          This Week
          <svg
            width="10"
            height="6"
            viewBox="0 0 10 6"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M1 1L5 5L9 1"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>

      {/* SECTION 2: KPI row */}
      <div style={styles.section}>
        <div style={styles.kpiGrid}>
          {/* Card 1 */}
          <div style={styles.card}>
            <div style={styles.kpiValueRow}>
              <span style={{ ...styles.kpiValue, color: "#F0F6FC" }}>14</span>
              <span style={{ ...styles.kpiTrend, color: "#22C55E" }}>
                ↑ 2 vs last week
              </span>
            </div>
            <p style={styles.kpiLabel}>Functions</p>
          </div>
          {/* Card 2 */}
          <div style={styles.card}>
            <div style={styles.kpiValueRow}>
              <span style={{ ...styles.kpiValue, color: "#F0F6FC" }}>
                2,847
              </span>
              <span style={{ ...styles.kpiTrend, color: "#22C55E" }}>
                ↑ 12%
              </span>
            </div>
            <p style={styles.kpiLabel}>Total Covers</p>
          </div>
          {/* Card 3 */}
          <div style={styles.card}>
            <div style={styles.kpiValueRow}>
              <span style={{ ...styles.kpiValue, color: "#F97316" }}>
                $148k
              </span>
              <span style={{ ...styles.kpiTrend, color: "#22C55E" }}>↑ 8%</span>
            </div>
            <p style={styles.kpiLabel}>Est. Revenue</p>
          </div>
          {/* Card 4 */}
          <div style={styles.card}>
            <div style={styles.kpiValueRow}>
              <span style={{ ...styles.kpiValue, color: "#22C55E" }}>94%</span>
              <span style={{ ...styles.kpiTrend, color: "#EF4444" }}>↓ 2%</span>
            </div>
            <p style={styles.kpiLabel}>On-Time Rate</p>
          </div>
        </div>
      </div>

      {/* SECTION 3: Completion Rate chart */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>Weekly Completion Rate</h2>
          <p style={styles.sectionSubtitle}>Prep tasks completed on time</p>
        </div>

        <div>
          <div style={styles.chartContainer}>
            {chartData.map((d, i) => (
              <div key={i} style={styles.barCol}>
                <div style={styles.barWrapper}>
                  <div
                    style={{
                      ...styles.bar,
                      height: d.pct === 0 ? 4 : `${d.pct}%`,
                      ...(d.today ? styles.barToday : {}),
                      ...(d.pct === 0 ? styles.barEmpty : {}),
                    }}
                  />
                </div>
                <span
                  style={{
                    ...styles.barLabel,
                    ...(d.today ? styles.labelToday : {}),
                  }}
                >
                  {d.day}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SECTION 4: Function Performance list */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>Function Performance</h2>
        </div>
        <div style={styles.listCard}>
          {/* Item 1 */}
          <div style={styles.listItem}>
            <div style={styles.listItemRow1}>
              <div style={styles.listItemLeft}>
                <div style={{ ...styles.dot, background: "#F97316" }}></div>
                <div>
                  <p style={styles.functionName}>Hartley Wedding</p>
                  <span style={styles.functionDate}>Sat 17 · 190 covers</span>
                </div>
              </div>
              <div
                style={{
                  ...styles.pill,
                  background: "rgba(34,197,94,0.1)",
                  color: "#22C55E",
                }}
              >
                ● On Time
              </div>
            </div>
            <div>
              <div style={styles.progressBg}>
                <div style={{ ...styles.progressFill, width: "74%" }}></div>
              </div>
              <p style={styles.progressText}>74%</p>
            </div>
          </div>

          {/* Item 2 */}
          <div style={styles.listItem}>
            <div style={styles.listItemRow1}>
              <div style={styles.listItemLeft}>
                <div style={{ ...styles.dot, background: "#22C55E" }}></div>
                <div>
                  <p style={styles.functionName}>Johnson Corporate</p>
                  <span style={styles.functionDate}>Sat 17 · 45 covers</span>
                </div>
              </div>
              <div
                style={{
                  ...styles.pill,
                  background: "rgba(34,197,94,0.1)",
                  color: "#22C55E",
                }}
              >
                ● On Time
              </div>
            </div>
            <div>
              <div style={styles.progressBg}>
                <div
                  style={{
                    ...styles.progressFill,
                    width: "100%",
                    background: "#22C55E",
                  }}
                ></div>
              </div>
              <p style={styles.progressText}>100% done</p>
            </div>
          </div>

          {/* Item 3 */}
          <div style={{ ...styles.listItem, borderBottom: "none" }}>
            <div style={styles.listItemRow1}>
              <div style={styles.listItemLeft}>
                <div style={{ ...styles.dot, background: "#22C55E" }}></div>
                <div>
                  <p style={styles.functionName}>St Mary's Morning Tea</p>
                  <span style={styles.functionDate}>Sat 17 · 60 covers</span>
                </div>
              </div>
              <div
                style={{
                  ...styles.pill,
                  background: "rgba(34,197,94,0.1)",
                  color: "#22C55E",
                }}
              >
                ● On Time
              </div>
            </div>
            <div>
              <div style={styles.progressBg}>
                <div
                  style={{
                    ...styles.progressFill,
                    width: "100%",
                    background: "#22C55E",
                  }}
                ></div>
              </div>
              <p style={styles.progressText}>100%</p>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 5: Alerts & Incidents summary */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>Incidents This Week</h2>
        </div>
        <div>
          {/* Incident 1 */}
          <div style={styles.incidentRow}>
            <div style={styles.incidentLeft}>
              <span style={styles.incidentEmoji}>🥜</span>
              <div>
                <p style={styles.incidentTitle}>Nut Allergy Checks</p>
                <p style={styles.incidentDesc}>3 flagged, all resolved</p>
              </div>
            </div>
            <span style={{ ...styles.incidentIcon, color: "#22C55E" }}>✓</span>
          </div>

          {/* Incident 2 */}
          <div style={{ ...styles.incidentRow, borderBottom: "none" }}>
            <div style={styles.incidentLeft}>
              <span style={styles.incidentEmoji}>⏰</span>
              <div>
                <p style={styles.incidentTitle}>Late Prep Tasks</p>
                <p style={styles.incidentDesc}>7 overdue across 4 functions</p>
              </div>
            </div>
            <span style={{ ...styles.incidentIcon, color: "#F97316" }}>⚠</span>
          </div>
        </div>
      </div>

      {/* SECTION 6: Labor insight card */}
      <div style={styles.section}>
        <div style={styles.laborCard}>
          <p style={styles.laborLabel}>Staffing Efficiency</p>
          <p style={styles.laborValue}>14.2 hours/function avg</p>
          <p style={styles.laborBench}>Industry benchmark: 12.0h</p>
          <p style={styles.laborWarn}>↑ 18% above target this week</p>
        </div>
      </div>
    </div>
  );
}
