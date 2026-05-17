import React, { useState } from 'react';

export function SettingsPanel() {
  const [theme, setTheme] = useState('dark');
  const [toggles, setToggles] = useState({
    dailyBriefing: true,
    prepAlerts: true,
    dietaryWarnings: true,
    staffSickCalls: true,
    serviceUpdates: false
  });

  const toggleHandler = (key: keyof typeof toggles) => {
    setToggles(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const tokens = {
    bg: '#0D1117',
    card: '#161B22',
    border: 'rgba(255,255,255,0.08)',
    primary: '#F97316',
    success: '#22C55E',
    warning: '#EAB308',
    danger: '#EF4444',
    textPrimary: '#F0F6FC',
    textSecondary: '#8B949E',
    textMuted: '#484F58'
  };

  const Toggle = ({ active, color = tokens.primary, onClick }: { active: boolean, color?: string, onClick: () => void }) => (
    <div 
      onClick={onClick}
      style={{
        width: 36,
        height: 20,
        borderRadius: 10,
        background: active ? color : tokens.border,
        position: 'relative',
        cursor: 'pointer',
        transition: 'background 0.2s'
      }}
    >
      <div style={{
        width: 16,
        height: 16,
        borderRadius: 8,
        background: '#fff',
        position: 'absolute',
        top: 2,
        left: active ? 18 : 2,
        transition: 'left 0.2s'
      }} />
    </div>
  );

  return (
    <div style={{ width: 390, minHeight: 844, background: tokens.bg, overflowY: 'auto', fontFamily: "'Inter', system-ui, sans-serif", padding: '0 0 48px 0', color: tokens.textPrimary }}>
      
      {/* SECTION 1: Header + Profile */}
      <div style={{ padding: '24px 20px 16px' }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: '0 0 24px 0', letterSpacing: '-0.02em' }}>Settings</h1>
        
        <div style={{ background: tokens.card, borderRadius: 12, border: `1px solid ${tokens.border}`, padding: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 48, height: 48, borderRadius: 24, background: tokens.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: 18, color: '#fff' }}>
              JT
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 2 }}>James Thompson</div>
              <div style={{ fontSize: 13, color: tokens.textSecondary }}>Executive Chef · Head Chef role</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: `1px solid ${tokens.border}`, paddingTop: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(34, 197, 94, 0.1)', color: tokens.success, padding: '4px 8px', borderRadius: 4, fontSize: 12, fontWeight: 500 }}>
              <div style={{ width: 6, height: 6, borderRadius: 3, background: tokens.success }} />
              Manager Access
            </div>
            <div style={{ fontSize: 13, color: tokens.textMuted, cursor: 'pointer' }}>
              Edit Profile &rarr;
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: Organization */}
      <div style={{ padding: '16px 20px' }}>
        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.05em', color: tokens.textMuted, marginBottom: 12 }}>ORGANIZATION</div>
        <div style={{ background: tokens.card, borderRadius: 12, border: `1px solid ${tokens.border}`, overflow: 'hidden' }}>
          {[
            { label: 'Kitchen Name', value: 'Hartley Grand Catering' },
            { label: 'Location', value: 'Melbourne, VIC' },
            { label: 'Timezone', value: 'AEST (UTC+10)' }
          ].map((item, i, arr) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: i < arr.length - 1 ? `1px solid ${tokens.border}` : 'none' }}>
              <span style={{ fontSize: 14, color: tokens.textPrimary }}>{item.label}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 14, color: tokens.textSecondary }}>{item.value}</span>
                <span style={{ color: tokens.textMuted }}>›</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 3: Roles & Permissions */}
      <div style={{ padding: '16px 20px' }}>
        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.05em', color: tokens.textMuted, marginBottom: 12 }}>ROLES & PERMISSIONS</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Manager Card */}
          <div style={{ background: tokens.card, borderRadius: 12, border: `1px solid ${tokens.primary}`, padding: 16 }}>
            <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>Manager</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
              <div style={{ fontSize: 13, color: tokens.textSecondary, display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ color: tokens.success }}>✓</span> Edit functions</div>
              <div style={{ fontSize: 13, color: tokens.textSecondary, display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ color: tokens.success }}>✓</span> Manage roster</div>
              <div style={{ fontSize: 13, color: tokens.textSecondary, display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ color: tokens.success }}>✓</span> View analytics</div>
              <div style={{ fontSize: 13, color: tokens.textSecondary, display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ color: tokens.success }}>✓</span> Send broadcasts</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, borderTop: `1px solid ${tokens.border}`, paddingTop: 12 }}>
              <div style={{ display: 'flex' }}>
                <div style={{ width: 20, height: 20, borderRadius: 10, background: tokens.textMuted, border: `2px solid ${tokens.card}`, marginLeft: 0 }} />
                <div style={{ width: 20, height: 20, borderRadius: 10, background: tokens.textSecondary, border: `2px solid ${tokens.card}`, marginLeft: -8 }} />
              </div>
              <span style={{ fontSize: 13, color: tokens.textMuted }}>2 staff</span>
            </div>
          </div>

          {/* Team Leader Card */}
          <div style={{ background: tokens.card, borderRadius: 12, border: `1px solid ${tokens.border}`, padding: 16 }}>
            <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>Team Leader</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
              <div style={{ fontSize: 13, color: tokens.textSecondary, display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ color: tokens.success }}>✓</span> Edit timelines</div>
              <div style={{ fontSize: 13, color: tokens.textSecondary, display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ color: tokens.success }}>✓</span> Edit dietary</div>
              <div style={{ fontSize: 13, color: tokens.textSecondary, display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ color: tokens.textMuted }}>✗</span> Manage roster</div>
              <div style={{ fontSize: 13, color: tokens.textSecondary, display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ color: tokens.textMuted }}>✗</span> View analytics</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, borderTop: `1px solid ${tokens.border}`, paddingTop: 12 }}>
              <span style={{ fontSize: 13, color: tokens.textMuted }}>4 staff</span>
            </div>
          </div>

          {/* Staff Card */}
          <div style={{ background: tokens.card, borderRadius: 12, border: `1px solid ${tokens.border}`, padding: 16 }}>
            <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>Staff</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
              <div style={{ fontSize: 13, color: tokens.textSecondary, display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ color: tokens.success }}>✓</span> View functions</div>
              <div style={{ fontSize: 13, color: tokens.textSecondary, display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ color: tokens.success }}>✓</span> Complete prep tasks</div>
              <div style={{ fontSize: 13, color: tokens.textSecondary, display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ color: tokens.textMuted }}>✗</span> Edit anything</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, borderTop: `1px solid ${tokens.border}`, paddingTop: 12 }}>
              <span style={{ fontSize: 13, color: tokens.textMuted }}>8 staff</span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 4: Notifications */}
      <div style={{ padding: '16px 20px' }}>
        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.05em', color: tokens.textMuted, marginBottom: 12 }}>NOTIFICATIONS</div>
        <div style={{ background: tokens.card, borderRadius: 12, border: `1px solid ${tokens.border}`, overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: `1px solid ${tokens.border}` }}>
            <span style={{ fontSize: 14, color: tokens.textPrimary }}>Daily Briefing</span>
            <Toggle active={toggles.dailyBriefing} onClick={() => toggleHandler('dailyBriefing')} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: `1px solid ${tokens.border}` }}>
            <span style={{ fontSize: 14, color: tokens.textPrimary }}>Prep Alerts</span>
            <Toggle active={toggles.prepAlerts} onClick={() => toggleHandler('prepAlerts')} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: `1px solid ${tokens.border}` }}>
            <span style={{ fontSize: 14, color: tokens.textPrimary }}>Dietary Warnings</span>
            <Toggle active={toggles.dietaryWarnings} color={tokens.danger} onClick={() => toggleHandler('dietaryWarnings')} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: `1px solid ${tokens.border}` }}>
            <span style={{ fontSize: 14, color: tokens.textPrimary }}>Staff Sick Calls</span>
            <Toggle active={toggles.staffSickCalls} onClick={() => toggleHandler('staffSickCalls')} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px' }}>
            <span style={{ fontSize: 14, color: tokens.textPrimary }}>Service Updates</span>
            <Toggle active={toggles.serviceUpdates} onClick={() => toggleHandler('serviceUpdates')} />
          </div>
        </div>
      </div>

      {/* SECTION 5: Appearance */}
      <div style={{ padding: '16px 20px' }}>
        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.05em', color: tokens.textMuted, marginBottom: 12 }}>APPEARANCE</div>
        <div style={{ background: tokens.card, borderRadius: 12, border: `1px solid ${tokens.border}`, overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: `1px solid ${tokens.border}` }}>
            <span style={{ fontSize: 14, color: tokens.textPrimary }}>Theme</span>
            <div style={{ display: 'flex', background: tokens.bg, padding: 2, borderRadius: 6 }}>
              <div 
                style={{ padding: '4px 12px', fontSize: 12, fontWeight: 500, borderRadius: 4, background: theme === 'dark' ? tokens.primary : 'transparent', color: theme === 'dark' ? '#fff' : tokens.textSecondary, cursor: 'pointer' }}
                onClick={() => setTheme('dark')}
              >
                Dark
              </div>
              <div 
                style={{ padding: '4px 12px', fontSize: 12, fontWeight: 500, borderRadius: 4, background: theme === 'light' ? tokens.primary : 'transparent', color: theme === 'light' ? '#fff' : tokens.textSecondary, cursor: 'pointer' }}
                onClick={() => setTheme('light')}
              >
                Light
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px' }}>
            <span style={{ fontSize: 14, color: tokens.textPrimary }}>Font Size</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: tokens.bg, padding: '4px 12px', borderRadius: 12, fontSize: 12, color: tokens.textSecondary, cursor: 'pointer' }}>
              Default <span>▾</span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 6: Danger zone */}
      <div style={{ padding: '16px 20px', marginBottom: 24 }}>
        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.05em', color: tokens.danger, marginBottom: 12 }}>DATA</div>
        <div style={{ background: tokens.card, borderRadius: 12, border: `1px solid ${tokens.border}`, overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: `1px solid ${tokens.border}` }}>
            <span style={{ fontSize: 14, color: tokens.textPrimary }}>Load Sample Data</span>
            <div style={{ fontSize: 12, fontWeight: 500, color: tokens.textPrimary, background: tokens.border, padding: '6px 12px', borderRadius: 6, cursor: 'pointer' }}>Load</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: `1px solid ${tokens.border}` }}>
            <span style={{ fontSize: 14, color: tokens.textPrimary }}>Export All Data</span>
            <div style={{ fontSize: 12, fontWeight: 500, color: tokens.textPrimary, background: tokens.border, padding: '6px 12px', borderRadius: 6, cursor: 'pointer' }}>Export</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', cursor: 'pointer' }}>
            <span style={{ fontSize: 14, color: tokens.textPrimary }}>Reset All Data</span>
            <span style={{ fontSize: 14, color: tokens.danger, fontWeight: 500 }}>Delete everything</span>
          </div>
        </div>
      </div>
      
    </div>
  );
}
