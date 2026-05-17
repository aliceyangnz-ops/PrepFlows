import React, { useState } from 'react';
import { ArrowLeft, Check, Minus, Plus } from 'lucide-react';

export function AddFunctionFlow() {
  const [covers, setCovers] = useState(190);

  return (
    <div style={{ width: 390, minHeight: 844, background: '#0D1117', overflowY: 'auto', fontFamily: "'Inter', system-ui, sans-serif", padding: '0 0 48px 0', color: '#F0F6FC' }}>
      {/* SECTION 1: Progress header */}
      <div style={{ padding: '24px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
          <button style={{ background: 'none', border: 'none', color: '#F0F6FC', padding: 0, cursor: 'pointer', display: 'flex' }}>
            <ArrowLeft size={24} />
          </button>
          <h1 style={{ fontSize: '20px', fontWeight: 600, margin: 0 }}>New Function</h1>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <div style={{ width: '24px', height: '4px', borderRadius: '2px', background: '#F97316' }} />
            <div style={{ width: '24px', height: '4px', borderRadius: '2px', background: '#F97316' }} />
            <div style={{ width: '24px', height: '4px', borderRadius: '2px', background: 'rgba(255,255,255,0.1)' }} />
            <div style={{ width: '24px', height: '4px', borderRadius: '2px', background: 'rgba(255,255,255,0.1)' }} />
          </div>
          <span style={{ fontSize: '13px', color: '#8B949E', fontWeight: 500 }}>Step 2 of 4 — Details</span>
        </div>
      </div>

      <div style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
        
        {/* SECTION 2: Completed step summary */}
        <div style={{ 
          background: '#161B22', 
          border: '1px solid rgba(255,255,255,0.08)', 
          borderRadius: '12px', 
          padding: '16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '24px', height: '24px', borderRadius: '12px', background: 'rgba(34, 197, 94, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#22C55E' }}>
              <Check size={14} strokeWidth={3} />
            </div>
            <span style={{ fontSize: '14px', color: '#8B949E' }}>Hartley Wedding · Ballroom A · Sat 17 May</span>
          </div>
          <button style={{ background: 'none', border: 'none', color: '#F97316', fontSize: '14px', fontWeight: 500, cursor: 'pointer' }}>Edit</button>
        </div>

        {/* SECTION 3: Current step form */}
        <div>
          <h2 style={{ fontSize: '28px', fontWeight: 600, margin: '0 0 32px 0', letterSpacing: '-0.5px' }}>How many guests?</h2>
          
          {/* Input group A — Covers */}
          <div style={{ marginBottom: '32px' }}>
            <label style={{ display: 'block', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#8B949E', fontWeight: 600, marginBottom: '16px' }}>Total Covers</label>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#161B22', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '12px' }}>
              <button onClick={() => setCovers(c => Math.max(0, c - 1))} style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: 'none', color: '#F0F6FC', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <Minus size={24} />
              </button>
              <div style={{ fontSize: '40px', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{covers}</div>
              <button onClick={() => setCovers(c => c + 1)} style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: 'none', color: '#F0F6FC', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <Plus size={24} />
              </button>
            </div>
            <div style={{ fontSize: '13px', color: '#8B949E', marginTop: '12px', textAlign: 'center' }}>Seated dinner guests</div>
          </div>

          {/* Input group B — Event Type */}
          <div style={{ marginBottom: '32px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#F0F6FC', marginBottom: '16px' }}>Event Type</label>
            <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '8px', margin: '0 -20px', padding: '0 20px' }}>
              <div style={{ background: '#F97316', color: '#fff', padding: '10px 20px', borderRadius: '24px', fontSize: '14px', fontWeight: 600, whiteSpace: 'nowrap' }}>Set Menu</div>
              <div style={{ background: '#161B22', color: '#8B949E', border: '1px solid rgba(255,255,255,0.08)', padding: '10px 20px', borderRadius: '24px', fontSize: '14px', fontWeight: 500, whiteSpace: 'nowrap' }}>À La Carte</div>
              <div style={{ background: '#161B22', color: '#8B949E', border: '1px solid rgba(255,255,255,0.08)', padding: '10px 20px', borderRadius: '24px', fontSize: '14px', fontWeight: 500, whiteSpace: 'nowrap' }}>Buffet</div>
              <div style={{ background: '#161B22', color: '#8B949E', border: '1px solid rgba(255,255,255,0.08)', padding: '10px 20px', borderRadius: '24px', fontSize: '14px', fontWeight: 500, whiteSpace: 'nowrap' }}>Cocktail</div>
              <div style={{ background: '#161B22', color: '#8B949E', border: '1px solid rgba(255,255,255,0.08)', padding: '10px 20px', borderRadius: '24px', fontSize: '14px', fontWeight: 500, whiteSpace: 'nowrap' }}>High Tea</div>
            </div>
          </div>

          {/* Input group C — Package */}
          <div style={{ marginBottom: '40px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#F0F6FC', marginBottom: '16px' }}>Package Tier</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ background: '#161B22', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '16px', fontSize: '16px', fontWeight: 500 }}>Standard</div>
              <div style={{ background: 'rgba(249, 115, 22, 0.05)', border: '1px solid rgba(249, 115, 22, 0.5)', borderRadius: '12px', padding: '16px', fontSize: '16px', fontWeight: 600, display: 'flex', justifyContent: 'space-between', boxShadow: '0 0 0 1px rgba(249, 115, 22, 0.2)' }}>
                <span>Gold ⭐</span>
                <div style={{ width: '20px', height: '20px', borderRadius: '10px', background: '#F97316', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '4px', background: '#fff' }} />
                </div>
              </div>
              <div style={{ background: '#161B22', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '16px', fontSize: '16px', fontWeight: 500 }}>Platinum 💎</div>
            </div>
          </div>
        </div>

        {/* SECTION 4: Dietary Requirements */}
        <div>
          <h3 style={{ fontSize: '20px', fontWeight: 600, margin: '0 0 8px 0' }}>Dietary Requirements</h3>
          <p style={{ fontSize: '14px', color: '#8B949E', margin: '0 0 24px 0' }}>Tap to add — kitchen staff will see these during service</p>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {/* Gluten Free */}
            <div style={{ background: '#161B22', border: '1px solid rgba(249, 115, 22, 0.3)', borderRadius: '12px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '16px' }}>🌾</span>
                <span style={{ fontSize: '14px', fontWeight: 500, color: '#F0F6FC' }}>Gluten Free</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <button style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: 'none', color: '#8B949E', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Minus size={14} /></button>
                <span style={{ fontSize: '16px', fontWeight: 600, color: '#F97316' }}>12</span>
                <button style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(249, 115, 22, 0.1)', border: 'none', color: '#F97316', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Plus size={14} /></button>
              </div>
            </div>

            {/* Vegan */}
            <div style={{ background: '#161B22', border: '1px solid rgba(34, 197, 94, 0.3)', borderRadius: '12px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '16px' }}>🌱</span>
                <span style={{ fontSize: '14px', fontWeight: 500, color: '#F0F6FC' }}>Vegan</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <button style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: 'none', color: '#8B949E', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Minus size={14} /></button>
                <span style={{ fontSize: '16px', fontWeight: 600, color: '#22C55E' }}>8</span>
                <button style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(34, 197, 94, 0.1)', border: 'none', color: '#22C55E', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Plus size={14} /></button>
              </div>
            </div>

            {/* Nut Allergy */}
            <div style={{ background: '#161B22', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '12px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '16px' }}>🥜</span>
                <span style={{ fontSize: '14px', fontWeight: 500, color: '#F0F6FC' }}>Nut Allergy</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <button style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: 'none', color: '#8B949E', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Minus size={14} /></button>
                <span style={{ fontSize: '16px', fontWeight: 600, color: '#EF4444' }}>3</span>
                <button style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.1)', border: 'none', color: '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Plus size={14} /></button>
              </div>
            </div>

            {/* Vegetarian */}
            <div style={{ background: '#161B22', border: '1px solid rgba(34, 197, 94, 0.3)', borderRadius: '12px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '16px' }}>🥗</span>
                <span style={{ fontSize: '14px', fontWeight: 500, color: '#F0F6FC' }}>Vegetarian</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <button style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: 'none', color: '#8B949E', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Minus size={14} /></button>
                <span style={{ fontSize: '16px', fontWeight: 600, color: '#22C55E' }}>4</span>
                <button style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(34, 197, 94, 0.1)', border: 'none', color: '#22C55E', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Plus size={14} /></button>
              </div>
            </div>

            {/* Dairy Free */}
            <div style={{ background: '#161B22', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '12px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '16px' }}>🥛</span>
                <span style={{ fontSize: '14px', fontWeight: 500, color: '#F0F6FC' }}>Dairy Free</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <button style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: 'none', color: '#8B949E', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Minus size={14} /></button>
                <span style={{ fontSize: '16px', fontWeight: 600, color: '#3B82F6' }}>2</span>
                <button style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(59, 130, 246, 0.1)', border: 'none', color: '#3B82F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Plus size={14} /></button>
              </div>
            </div>

            {/* Other */}
            <div style={{ background: '#161B22', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '12px', opacity: 0.7 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '16px' }}>➕</span>
                <span style={{ fontSize: '14px', fontWeight: 500, color: '#8B949E' }}>Other</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <button style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: 'none', color: '#484F58', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Minus size={14} /></button>
                <span style={{ fontSize: '16px', fontWeight: 600, color: '#8B949E' }}>0</span>
                <button style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: 'none', color: '#8B949E', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Plus size={14} /></button>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 5: Bottom CTA */}
        <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
          <button style={{ width: '100%', background: '#F97316', color: '#fff', border: 'none', borderRadius: '12px', padding: '16px', fontSize: '16px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            Continue → Staff & Timeline
          </button>
          <span style={{ fontSize: '13px', color: '#EF4444', opacity: 0.8 }}>3 required fields missing</span>
        </div>

      </div>
    </div>
  );
}
