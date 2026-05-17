import React, { useState, useEffect } from 'react';

export function LiveServiceMode() {
  const [now, setNow] = useState(new Date());
  
  // A simple tick for the UI clock, if we wanted it real-time. 
  // For the mockup we'll just keep the static 18:47 feel or let it tick.
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Use the requested time "18:47" for the mockup layout
  const displayTime = "18:47";

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
        boxSizing: 'border-box'
      }}
    >
      {/* SECTION 1: Header */}
      <div
        style={{
          borderTop: '4px solid #F97316',
          background: '#161B22',
          padding: '16px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          borderBottom: '1px solid rgba(255,255,255,0.08)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#F97316',
                boxShadow: '0 0 8px #F97316',
                animation: 'pulse 2s infinite'
              }}
            />
            <span style={{ color: '#F97316', fontSize: '12px', fontWeight: 700, letterSpacing: '0.05em' }}>
              LIVE SERVICE
            </span>
          </div>
          <div style={{ color: '#F97316', fontSize: '20px', fontFamily: 'monospace', fontWeight: 700 }}>
            {displayTime}
          </div>
        </div>
        <div style={{ fontSize: '20px', fontWeight: 700, color: '#FFFFFF' }}>
          Hartley Wedding
        </div>
      </div>

      <div style={{ padding: '20px' }}>
        {/* SECTION 2: Service Progress hero */}
        <div
          style={{
            background: '#161B22',
            borderRadius: '12px',
            padding: '24px 20px',
            marginBottom: '32px',
            border: '1px solid rgba(249,115,22,0.3)',
            boxShadow: '0 0 24px rgba(249,115,22,0.1)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center'
          }}
        >
          <div style={{ fontSize: '14px', fontWeight: 700, color: '#F0F6FC', letterSpacing: '0.05em', marginBottom: '8px' }}>
            COURSE 2 OF 4 — MAIN
          </div>
          <div style={{ fontSize: '48px', fontWeight: 800, color: '#F97316', fontFamily: 'monospace', lineHeight: 1, marginBottom: '16px' }}>
            12:34
          </div>
          <div style={{ color: '#8B949E', fontSize: '14px', marginBottom: '24px' }}>
            Main Course &middot; 190 covers &middot; Fire to expo at 19:00
          </div>
          
          {/* Progress Bar */}
          <div style={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-between', position: 'relative' }}>
            <div style={{ position: 'absolute', top: '11px', left: '10%', right: '10%', height: '2px', background: 'rgba(255,255,255,0.08)', zIndex: 0 }} />
            
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', zIndex: 1, background: '#161B22', padding: '0 4px' }}>
              <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#22C55E', color: '#161B22', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 'bold' }}>✓</div>
              <div style={{ fontSize: '11px', color: '#8B949E' }}>Entrée</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', zIndex: 1, background: '#161B22', padding: '0 4px' }}>
              <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#F97316', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#0D1117' }} />
              </div>
              <div style={{ fontSize: '11px', color: '#F0F6FC', fontWeight: 700 }}>Main</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', zIndex: 1, background: '#161B22', padding: '0 4px' }}>
              <div style={{ width: '24px', height: '24px', borderRadius: '50%', border: '2px solid #484F58', background: '#161B22', boxSizing: 'border-box' }} />
              <div style={{ fontSize: '11px', color: '#484F58' }}>Dessert</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', zIndex: 1, background: '#161B22', padding: '0 4px' }}>
              <div style={{ width: '24px', height: '24px', borderRadius: '50%', border: '2px solid #484F58', background: '#161B22', boxSizing: 'border-box' }} />
              <div style={{ fontSize: '11px', color: '#484F58' }}>Petit Fours</div>
            </div>
          </div>
        </div>

        {/* SECTION 3: Section Status Grid */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#8B949E', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
            Section Status
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={{ background: '#161B22', borderRadius: '8px', padding: '16px', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ fontSize: '16px', fontWeight: 700, marginBottom: '12px', color: '#F0F6FC' }}>HOT SECTION</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#22C55E', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>
                <span>●</span> READY
              </div>
              <div style={{ fontSize: '12px', color: '#8B949E' }}>190 portions prepped</div>
            </div>
            <div style={{ background: '#161B22', borderRadius: '8px', padding: '16px', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ fontSize: '16px', fontWeight: 700, marginBottom: '12px', color: '#F0F6FC' }}>COLD SECTION</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#22C55E', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>
                <span>●</span> READY
              </div>
              <div style={{ fontSize: '12px', color: '#8B949E' }}>Resetting for dessert</div>
            </div>
            <div style={{ background: '#161B22', borderRadius: '8px', padding: '16px', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ fontSize: '16px', fontWeight: 700, marginBottom: '12px', color: '#F0F6FC' }}>PASTRY</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#F97316', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>
                <span>●</span> PLATING
              </div>
              <div style={{ fontSize: '12px', color: '#8B949E' }}>Dietaries assembling</div>
            </div>
            <div style={{ background: '#161B22', borderRadius: '8px', padding: '16px', border: '1px solid rgba(239,68,68,0.3)', boxShadow: '0 0 12px rgba(239,68,68,0.1)' }}>
              <div style={{ fontSize: '16px', fontWeight: 700, marginBottom: '12px', color: '#F0F6FC' }}>EXPO</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#EF4444', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>
                <span>⚠</span> HOLDING
              </div>
              <div style={{ fontSize: '12px', color: '#8B949E' }}>Waiting on FOH cue</div>
            </div>
          </div>
        </div>

        {/* SECTION 4: Firing Log */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#8B949E', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
            Service Log
          </div>
          <div style={{ background: '#161B22', borderRadius: '8px', padding: '16px', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', gap: '12px', fontSize: '14px' }}>
              <div style={{ color: '#484F58', fontFamily: 'monospace' }}>18:47</div>
              <div style={{ color: '#8B949E' }}>Expo: All mains plated</div>
            </div>
            <div style={{ display: 'flex', gap: '12px', fontSize: '14px', position: 'relative' }}>
              <div style={{ position: 'absolute', left: '-16px', top: '6px', width: '4px', height: '4px', borderRadius: '50%', background: '#F0F6FC' }} />
              <div style={{ color: '#8B949E', fontFamily: 'monospace' }}>18:43</div>
              <div style={{ color: '#F0F6FC', fontWeight: 500 }}>Hot: Fire main confirmed</div>
            </div>
            <div style={{ display: 'flex', gap: '12px', fontSize: '14px' }}>
              <div style={{ color: '#484F58', fontFamily: 'monospace' }}>18:30</div>
              <div style={{ color: '#22C55E' }}>Cold: Entrée cleared ✓</div>
            </div>
            <div style={{ display: 'flex', gap: '12px', fontSize: '14px' }}>
              <div style={{ color: '#484F58', fontFamily: 'monospace' }}>18:15</div>
              <div style={{ color: '#484F58' }}>Service Start — Entrée fired</div>
            </div>
          </div>
        </div>

        {/* SECTION 5: Quick Actions row */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button
            style={{
              width: '100%',
              padding: '20px',
              background: '#F97316',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '18px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '12px',
              boxShadow: '0 4px 12px rgba(249,115,22,0.3)'
            }}
          >
            <span>🔥</span> FIRE NEXT
          </button>
          
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              style={{
                flex: 1,
                padding: '16px',
                background: 'transparent',
                color: '#EAB308',
                border: '1px solid #EAB308',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <span>⏸</span> HOLD
            </button>
            <button
              style={{
                flex: 1,
                padding: '16px',
                background: 'transparent',
                color: '#F0F6FC',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <span>📣</span> ANNOUNCE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
