import React, { useState } from 'react';

export function PremiumPrepList() {
  const [expandedSection, setExpandedSection] = useState<string | null>('hot');

  const toggleSection = (section: string) => {
    setExpandedSection(prev => (prev === section ? null : section));
  };

  return (
    <div
      style={{
        width: 390,
        minHeight: 844,
        background: '#0D1117',
        overflowY: 'auto',
        fontFamily: "'Inter', system-ui, sans-serif",
        padding: '0 0 48px 0',
        color: '#F0F6FC',
      }}
    >
      {/* SECTION 1: Header */}
      <div style={{ padding: '24px 20px 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, margin: '0 0 4px 0', color: '#F0F6FC', letterSpacing: '-0.02em' }}>
              Prep List
            </h1>
            <div style={{ fontSize: 14, color: '#8B949E' }}>Saturday, 17 May</div>
          </div>
          <div
            style={{
              background: 'rgba(249, 115, 22, 0.1)',
              color: '#F97316',
              padding: '6px 12px',
              borderRadius: 999,
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            74% complete
          </div>
        </div>

        {/* Filter chips */}
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4, msOverflowStyle: 'none', scrollbarWidth: 'none' }}>
          {['All', 'Hot', 'Cold', 'Pastry', 'Banquet'].map((filter, idx) => (
            <div
              key={filter}
              style={{
                background: idx === 0 ? 'rgba(249, 115, 22, 0.15)' : '#161B22',
                color: idx === 0 ? '#F97316' : '#8B949E',
                border: `1px solid ${idx === 0 ? 'rgba(249, 115, 22, 0.3)' : 'rgba(255, 255, 255, 0.08)'}`,
                padding: '6px 16px',
                borderRadius: 20,
                fontSize: 14,
                fontWeight: idx === 0 ? 600 : 500,
                whiteSpace: 'nowrap',
                cursor: 'pointer',
              }}
            >
              {filter}
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 2: Alert banner */}
      <div style={{ padding: '0 20px 24px' }}>
        <div
          style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            borderRadius: 12,
            padding: 16,
            display: 'flex',
            gap: 12,
            alignItems: 'flex-start',
          }}
        >
          <div style={{ fontSize: 18, marginTop: 2 }}>⚠️</div>
          <div>
            <div style={{ color: '#EF4444', fontSize: 14, fontWeight: 600, marginBottom: 4 }}>
              3 tasks overdue
            </div>
            <div style={{ color: '#F0F6FC', fontSize: 13, lineHeight: 1.4, opacity: 0.9 }}>
              Main course mise en place for Hartley Wedding is critical
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 3: HOT KITCHEN */}
      <div style={{ padding: '0 20px 16px' }}>
        <div
          onClick={() => toggleSection('hot')}
          style={{
            background: '#161B22',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: 12,
            overflow: 'hidden',
          }}
        >
          <div style={{ padding: 16, cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#8B949E', letterSpacing: '0.05em' }}>
                  HOT KITCHEN
                </span>
                <span style={{ color: '#484F58', fontSize: 12 }}>·</span>
                <span style={{ fontSize: 13, color: '#8B949E' }}>12 tasks · <span style={{ color: '#EF4444' }}>3 overdue</span></span>
              </div>
              
              {/* Progress bar */}
              <div style={{ height: 4, width: '100%', background: 'rgba(255,255,255,0.05)', borderRadius: 2, marginTop: 8 }}>
                <div style={{ height: '100%', width: '58%', background: '#F97316', borderRadius: 2 }}></div>
              </div>
            </div>
            
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8B949E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: expandedSection === 'hot' ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </div>

          {expandedSection === 'hot' && (
            <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.04)', padding: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
              
              {/* Card A */}
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#EF4444', marginTop: 6, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 600, color: '#F0F6FC', marginBottom: 6 }}>
                    Beef Wellington Mise en Place
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                    <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#238636', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 600, color: '#fff' }}>
                      JT
                    </div>
                    <span style={{ fontSize: 13, color: '#8B949E' }}>James T</span>
                  </div>
                  <div style={{ fontSize: 12, color: '#EF4444', fontWeight: 500 }}>
                    Due 14:00 · Overdue 45min
                  </div>
                </div>
                <div style={{ width: 22, height: 22, borderRadius: '50%', border: '2px solid rgba(239, 68, 68, 0.5)', flexShrink: 0 }} />
              </div>

              {/* Card B */}
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', paddingTop: 16, borderTop: '1px solid rgba(255, 255, 255, 0.04)' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#F97316', marginTop: 6, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 500, color: '#F0F6FC', marginBottom: 6 }}>
                    Sauce Preparation — Main
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                    <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#8957E5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 600, color: '#fff' }}>
                      SM
                    </div>
                    <span style={{ fontSize: 13, color: '#8B949E' }}>Sarah M</span>
                  </div>
                  <div style={{ fontSize: 12, color: '#F97316', fontWeight: 500 }}>
                    Due 16:00 · In 1h 15min
                  </div>
                </div>
                <div style={{ width: 22, height: 22, borderRadius: '50%', border: '2px solid rgba(255, 255, 255, 0.2)', flexShrink: 0 }} />
              </div>

              {/* Card C */}
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', paddingTop: 16, borderTop: '1px solid rgba(255, 255, 255, 0.04)' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22C55E', marginTop: 6, flexShrink: 0 }} />
                <div style={{ flex: 1, opacity: 0.5 }}>
                  <div style={{ fontSize: 15, fontWeight: 500, color: '#8B949E', marginBottom: 6, textDecoration: 'line-through' }}>
                    Stock Preparation
                  </div>
                  <div style={{ fontSize: 12, color: '#22C55E', fontWeight: 500 }}>
                    Done at 11:30
                  </div>
                </div>
                <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#22C55E', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0D1117" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
              </div>

            </div>
          )}
        </div>
      </div>

      {/* SECTION 4: COLD KITCHEN */}
      <div style={{ padding: '0 20px 16px' }}>
        <div
          onClick={() => toggleSection('cold')}
          style={{
            background: '#161B22',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: 12,
            padding: 16,
            cursor: 'pointer',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#8B949E', letterSpacing: '0.05em' }}>
                  COLD KITCHEN
                </span>
                <span style={{ color: '#484F58', fontSize: 12 }}>·</span>
                <span style={{ fontSize: 13, color: '#8B949E' }}>8 tasks · <span style={{ color: '#EF4444' }}>1 overdue</span></span>
              </div>
              <div style={{ fontSize: 13, color: '#8B949E' }}>6 of 8 complete</div>
            </div>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8B949E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: expandedSection === 'cold' ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </div>
        </div>
      </div>

      {/* SECTION 5: PASTRY */}
      <div style={{ padding: '0 20px 16px' }}>
        <div
          onClick={() => toggleSection('pastry')}
          style={{
            background: '#161B22',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: 12,
            padding: 16,
            cursor: 'pointer',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#8B949E', letterSpacing: '0.05em' }}>
                  PASTRY
                </span>
                <span style={{ color: '#484F58', fontSize: 12 }}>·</span>
                <span style={{ fontSize: 13, color: '#8B949E' }}>6 tasks · all done</span>
              </div>
              <div style={{ fontSize: 13, color: '#22C55E', fontWeight: 500 }}>✓ All complete</div>
            </div>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8B949E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: expandedSection === 'pastry' ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </div>
        </div>
      </div>
      
    </div>
  );
}
