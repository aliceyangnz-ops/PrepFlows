import React from "react";

export function RosterPremium() {
  const tokens = {
    bg: "#0D1117",
    surface: "#161B22",
    border: "rgba(255,255,255,0.08)",
    primary: "#F97316",
    success: "#22C55E",
    warning: "#EAB308",
    danger: "#EF4444",
    textPrimary: "#F0F6FC",
    textSecondary: "#8B949E",
  };

  const styles = {
    container: {
      width: 390,
      minHeight: 844,
      background: tokens.bg,
      overflowY: "auto" as const,
      fontFamily: "'Inter', system-ui, sans-serif",
      padding: "0 0 48px 0",
      color: tokens.textPrimary,
      WebkitFontSmoothing: "antialiased",
      boxSizing: "border-box" as const,
    },
    header: {
      padding: "24px 20px 16px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: 700,
      letterSpacing: "-0.02em",
      margin: "0 0 4px 0",
    },
    headerSubtitle: {
      fontSize: 14,
      color: tokens.textSecondary,
      fontWeight: 500,
      margin: 0,
    },
    badgeSick: {
      background: "rgba(239, 68, 68, 0.15)",
      color: tokens.danger,
      padding: "4px 8px",
      borderRadius: 6,
      fontSize: 12,
      fontWeight: 700,
      letterSpacing: "0.05em",
      display: "flex",
      alignItems: "center",
      gap: 4,
    },
    alertBanner: {
      margin: "0 20px 24px",
      background:
        "linear-gradient(145deg, rgba(239,68,68,0.15) 0%, rgba(249,115,22,0.05) 100%)",
      border: `1px solid rgba(239,68,68,0.2)`,
      borderRadius: 12,
      padding: "16px",
    },
    alertTitle: {
      fontSize: 14,
      fontWeight: 600,
      color: tokens.danger,
      display: "flex",
      alignItems: "center",
      gap: 6,
      margin: "0 0 4px 0",
    },
    alertDesc: {
      fontSize: 13,
      color: tokens.textPrimary,
      margin: "0 0 12px 0",
      opacity: 0.9,
    },
    alertLink: {
      fontSize: 13,
      fontWeight: 600,
      color: tokens.primary,
      textDecoration: "none",
      display: "inline-flex",
      alignItems: "center",
    },
    section: {
      marginBottom: 24,
    },
    sectionHeader: {
      padding: "0 20px 12px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    },
    sectionTitle: {
      fontSize: 11,
      fontWeight: 700,
      color: tokens.textSecondary,
      letterSpacing: "0.08em",
      textTransform: "uppercase" as const,
      margin: 0,
    },
    sectionCount: {
      fontSize: 12,
      color: tokens.textSecondary,
      margin: 0,
    },
    cardList: {
      display: "flex",
      flexDirection: "column" as const,
      gap: 8,
      padding: "0 20px",
    },
    card: {
      background: tokens.surface,
      border: `1px solid ${tokens.border}`,
      borderRadius: 12,
      padding: 16,
      display: "flex",
      gap: 12,
    },
    cardDimmed: {
      background: tokens.bg,
      border: `1px dashed rgba(255,255,255,0.15)`,
      opacity: 0.8,
    },
    avatar: {
      width: 36,
      height: 36,
      borderRadius: 18,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: 13,
      fontWeight: 600,
      flexShrink: 0,
    },
    cardContent: {
      flex: 1,
    },
    cardHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 2,
    },
    staffName: {
      fontSize: 15,
      fontWeight: 600,
      margin: 0,
    },
    staffRole: {
      fontSize: 13,
      color: tokens.textSecondary,
      margin: 0,
    },
    shiftText: {
      fontSize: 12,
      color: tokens.textSecondary,
      fontVariantNumeric: "tabular-nums",
    },
    pill: {
      display: "inline-flex",
      alignItems: "center",
      gap: 4,
      padding: "2px 8px",
      borderRadius: 10,
      fontSize: 11,
      fontWeight: 500,
      marginTop: 8,
    },
    pillSuccess: {
      background: "rgba(34, 197, 94, 0.1)",
      color: tokens.success,
    },
    pillDanger: {
      background: "rgba(239, 68, 68, 0.1)",
      color: tokens.danger,
    },
    cardMeta: {
      fontSize: 12,
      color: tokens.textSecondary,
      marginTop: 8,
      paddingTop: 8,
      borderTop: `1px solid ${tokens.border}`,
    },
    timeline: {
      margin: "0 20px",
      background: tokens.surface,
      border: `1px solid ${tokens.border}`,
      borderRadius: 12,
      padding: "16px",
    },
    timelineHeader: {
      display: "flex",
      justifyContent: "space-between",
      borderBottom: `1px solid ${tokens.border}`,
      paddingBottom: 8,
      marginBottom: 12,
    },
    timeLabel: {
      fontSize: 10,
      color: tokens.textSecondary,
      fontVariantNumeric: "tabular-nums",
    },
    timelineRow: {
      height: 24,
      background: "rgba(255,255,255,0.03)",
      borderRadius: 4,
      position: "relative" as const,
      marginBottom: 8,
      overflow: "hidden",
    },
    timelineBar: {
      position: "absolute" as const,
      top: 2,
      bottom: 2,
      borderRadius: 3,
      display: "flex",
      alignItems: "center",
      padding: "0 8px",
      fontSize: 10,
      fontWeight: 600,
      color: "#fff",
      whiteSpace: "nowrap" as const,
      overflow: "hidden",
    },
    actionRow: {
      display: "flex",
      gap: 12,
      padding: "0 20px",
      marginTop: 32,
    },
    actionCard: {
      flex: 1,
      background: tokens.surface,
      border: `1px solid ${tokens.border}`,
      borderRadius: 12,
      padding: "16px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      fontSize: 14,
      fontWeight: 600,
      cursor: "pointer",
    },
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.headerTitle}>Roster</h1>
          <p style={styles.headerSubtitle}>
            Saturday, 17 May · 14 staff scheduled
          </p>
        </div>
        <div style={styles.badgeSick}>
          <span style={{ fontSize: 8 }}>●</span> 2 SICK
        </div>
      </div>

      {/* Alert Banner */}
      <div style={styles.alertBanner}>
        <h2 style={styles.alertTitle}>
          <span style={{ fontSize: 16 }}>⚠️</span> Coverage Alert
        </h2>
        <p style={styles.alertDesc}>
          2 staff called sick — PM shift may be short
        </p>
        <a href="#" style={styles.alertLink}>
          View Coverage Options →
        </a>
      </div>

      {/* Staff List - KITCHEN */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <h3 style={styles.sectionTitle}>Kitchen</h3>
          <span style={styles.sectionCount}>8 staff</span>
        </div>
        <div style={styles.cardList}>
          {/* Card 1 */}
          <div style={styles.card}>
            <div
              style={{
                ...styles.avatar,
                background: "#9A3412",
                color: "#FFEDD5",
              }}
            >
              JT
            </div>
            <div style={styles.cardContent}>
              <div style={styles.cardHeader}>
                <div>
                  <h4 style={styles.staffName}>James Thompson</h4>
                  <p style={styles.staffRole}>Executive Chef</p>
                </div>
                <div style={styles.shiftText}>07:00 – 16:00</div>
              </div>
              <div style={{ ...styles.pill, ...styles.pillSuccess }}>
                <span style={{ fontSize: 8 }}>●</span> On Shift
              </div>
              <div style={styles.cardMeta}>
                Functions today: Hartley Wedding, Johnson Lunch
              </div>
            </div>
          </div>

          {/* Card 2 */}
          <div style={styles.card}>
            <div
              style={{
                ...styles.avatar,
                background: "#6B21A8",
                color: "#F3E8FF",
              }}
            >
              SM
            </div>
            <div style={styles.cardContent}>
              <div style={styles.cardHeader}>
                <div>
                  <h4 style={styles.staffName}>Sarah Martinez</h4>
                  <p style={styles.staffRole}>Sous Chef</p>
                </div>
                <div style={styles.shiftText}>10:00 – 22:00</div>
              </div>
              <div style={{ ...styles.pill, ...styles.pillSuccess }}>
                <span style={{ fontSize: 8 }}>●</span> On Shift
              </div>
            </div>
          </div>

          {/* Card 3 (Sick) */}
          <div style={{ ...styles.card, ...styles.cardDimmed }}>
            <div
              style={{
                ...styles.avatar,
                background: "#374151",
                color: "#9CA3AF",
              }}
            >
              DK
            </div>
            <div style={styles.cardContent}>
              <div style={styles.cardHeader}>
                <div>
                  <h4
                    style={{
                      ...styles.staffName,
                      color: "rgba(240, 246, 252, 0.7)",
                    }}
                  >
                    Daniel Kim
                  </h4>
                  <p style={styles.staffRole}>Chef de Partie</p>
                </div>
                <div style={styles.shiftText}>14:00 – 23:00</div>
              </div>
              <div style={{ ...styles.pill, ...styles.pillDanger }}>
                ✗ Called Sick
              </div>
              <div style={{ ...styles.cardMeta, color: tokens.warning }}>
                Shift uncovered · Find replacement
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Staff List - FOH */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <h3 style={styles.sectionTitle}>Front of House</h3>
          <span style={styles.sectionCount}>4 staff</span>
        </div>
        <div style={styles.cardList}>
          <div style={styles.card}>
            <div
              style={{
                ...styles.avatar,
                background: "#166534",
                color: "#DCFCE7",
              }}
            >
              ML
            </div>
            <div style={styles.cardContent}>
              <div style={styles.cardHeader}>
                <div>
                  <h4 style={styles.staffName}>Maria Lopes</h4>
                  <p style={styles.staffRole}>Head Waiter</p>
                </div>
                <div style={styles.shiftText}>16:00 – 23:00</div>
              </div>
              <div style={{ ...styles.pill, ...styles.pillSuccess }}>
                <span style={{ fontSize: 8 }}>●</span> On Shift
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div style={styles.section}>
        <div style={{ padding: "0 20px 12px" }}>
          <h3 style={styles.sectionTitle}>Today's Shifts</h3>
        </div>
        <div style={styles.timeline}>
          <div style={styles.timelineHeader}>
            <span style={styles.timeLabel}>06:00</span>
            <span style={styles.timeLabel}>09:00</span>
            <span style={styles.timeLabel}>12:00</span>
            <span style={styles.timeLabel}>15:00</span>
            <span style={styles.timeLabel}>18:00</span>
            <span style={styles.timeLabel}>21:00</span>
          </div>
          <div style={styles.timelineRow}>
            {/* 07:00 to 16:00 roughly 5% to 60% */}
            <div
              style={{
                ...styles.timelineBar,
                left: "5%",
                width: "55%",
                background: "#C2410C",
              }}
            >
              JT (Exec)
            </div>
          </div>
          <div style={styles.timelineRow}>
            {/* 10:00 to 22:00 roughly 25% to 100% */}
            <div
              style={{
                ...styles.timelineBar,
                left: "25%",
                width: "75%",
                background: "#4338CA",
              }}
            >
              SM (Sous)
            </div>
          </div>
          <div style={styles.timelineRow}>
            {/* 14:00 to 23:00 (Sick) */}
            <div
              style={{
                ...styles.timelineBar,
                left: "50%",
                width: "50%",
                background:
                  "repeating-linear-gradient(45deg, #7F1D1D, #7F1D1D 4px, #991B1B 4px, #991B1B 8px)",
                opacity: 0.6,
              }}
            >
              DK (SICK)
            </div>
          </div>
          <div style={styles.timelineRow}>
            {/* 16:00 to 23:00 roughly 60% to 100% */}
            <div
              style={{
                ...styles.timelineBar,
                left: "60%",
                width: "40%",
                background: "#15803D",
              }}
            >
              ML (FOH)
            </div>
          </div>
        </div>
      </div>

      {/* Action Row */}
      <div style={styles.actionRow}>
        <div style={styles.actionCard}>
          <span style={{ fontSize: 16 }}>📋</span> Add Staff
        </div>
        <div
          style={{
            ...styles.actionCard,
            color: tokens.primary,
            borderColor: "rgba(249,115,22,0.2)",
          }}
        >
          <span style={{ fontSize: 16 }}>📞</span> Call In Casual
        </div>
      </div>
    </div>
  );
}
