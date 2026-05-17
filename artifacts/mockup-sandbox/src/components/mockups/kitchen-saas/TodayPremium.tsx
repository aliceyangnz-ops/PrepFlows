import React from 'react';
import { Bell, AlertTriangle, CheckCircle2, Clock, Check } from 'lucide-react';

export function TodayPremium() {
  return (
    <div 
      style={{
        width: 390, 
        minHeight: 844, 
        background: '#0D1117', 
        overflowY: 'auto', 
        fontFamily: "'Inter', system-ui, sans-serif", 
        padding: '0 0 32px 0'
      }}
      className="text-[#F0F6FC] antialiased"
    >
      <style>{`
        @keyframes pulse-ring {
          0% { transform: scale(0.8); box-shadow: 0 0 0 0 rgba(249, 115, 22, 0.7); }
          70% { transform: scale(1); box-shadow: 0 0 0 4px rgba(249, 115, 22, 0); }
          100% { transform: scale(0.8); box-shadow: 0 0 0 0 rgba(249, 115, 22, 0); }
        }
      `}</style>
      {/* SECTION 1: Header strip */}
      <div className="px-5 pt-12 pb-6 flex justify-between items-end">
        <div>
          <p className="text-[#8B949E] text-xs font-medium uppercase tracking-wider mb-1">Saturday, 17 May</p>
          <h1 className="text-2xl font-bold text-[#F0F6FC] tracking-tight">Today</h1>
        </div>
        <div className="flex items-center bg-[#F97316]/10 px-3 py-1.5 rounded-full border border-[#F97316]/20">
          <div className="w-2 h-2 rounded-full bg-[#F97316] mr-2" style={{ animation: 'pulse-ring 2s infinite' }} />
          <span className="text-[#F97316] text-[11px] font-bold tracking-widest uppercase">3 Live</span>
        </div>
      </div>

      {/* SECTION 2: Countdown hero card */}
      <div className="px-5 mb-8">
        <div className="bg-[#161B22] border border-[#21262D] rounded-xl relative overflow-hidden shadow-2xl">
          {/* Orange left border accent */}
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#F97316]"></div>
          
          <div className="p-5 pl-6">
            <p className="text-[#484F58] text-[10px] font-bold tracking-widest uppercase mb-3">Next Service</p>
            <h2 className="text-[18px] font-bold text-[#F0F6FC] mb-2 leading-tight">Hartley Wedding — Ballroom A</h2>
            
            <div className="mb-4">
              <p className="text-[#8B949E] text-xs mb-1">Service in</p>
              <div className="text-[32px] font-bold text-[#F97316] leading-none tracking-tight">
                2h 14m
              </div>
            </div>
            
            <div className="flex items-center text-xs text-[#8B949E] mb-5 font-medium">
              <span>190 covers</span>
              <span className="mx-2 text-[#484F58]">•</span>
              <span>Gold Package</span>
              <span className="mx-2 text-[#484F58]">•</span>
              <span>Dinner</span>
            </div>
            
            {/* Dietary chips */}
            <div className="flex gap-2">
              <div className="bg-[#0D1117] border border-[#21262D] text-[#8B949E] text-[10px] font-semibold px-2.5 py-1 rounded-md flex items-center">
                <span className="text-[#F0F6FC] mr-1">12</span> GF
              </div>
              <div className="bg-[#0D1117] border border-[#21262D] text-[#8B949E] text-[10px] font-semibold px-2.5 py-1 rounded-md flex items-center">
                <span className="text-[#F0F6FC] mr-1">8</span> VG
              </div>
              <div className="bg-[#EF4444]/10 border border-[#EF4444]/20 text-[#EF4444] text-[10px] font-semibold px-2.5 py-1 rounded-md flex items-center">
                <span className="mr-1">3</span> NUT
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 3: "Today's Functions" */}
      <div className="px-5 mb-8">
        <h3 className="text-[#F0F6FC] text-sm font-semibold mb-4 tracking-wide">Today's Functions</h3>
        
        <div className="flex flex-col gap-3">
          {/* Card 1: Active */}
          <div className="bg-[#161B22] border border-[#21262D] rounded-lg p-4 relative overflow-hidden flex flex-col justify-center min-h-[80px]">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#F97316]" style={{ animation: 'pulse-ring 2s infinite' }} />
                <h4 className="text-[15px] font-semibold text-[#F0F6FC] leading-none">Hartley Wedding</h4>
              </div>
              <div className="bg-[#F97316]/10 text-[#F97316] text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                In Progress
              </div>
            </div>
            <div className="text-xs text-[#8B949E] pl-4 font-medium">
              Ballroom A <span className="mx-1 text-[#484F58]">·</span> 6:30pm <span className="mx-1 text-[#484F58]">·</span> 190 covers
            </div>
          </div>

          {/* Card 2: Upcoming */}
          <div className="bg-[#161B22] border border-[#21262D] rounded-lg p-4 relative overflow-hidden flex flex-col justify-center min-h-[80px]">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#484F58]" />
                <h4 className="text-[15px] font-semibold text-[#F0F6FC] leading-none">Johnson Corporate Lunch</h4>
              </div>
              <div className="text-[#8B949E] text-xs font-medium flex items-center gap-1">
                <Clock size={12} />
                2h away
              </div>
            </div>
            <div className="text-xs text-[#8B949E] pl-4 font-medium">
              Dining Room <span className="mx-1 text-[#484F58]">·</span> 12:00pm <span className="mx-1 text-[#484F58]">·</span> 45 covers
            </div>
          </div>

          {/* Card 3: Completed */}
          <div className="bg-[#0D1117] border border-[#21262D]/50 opacity-60 rounded-lg p-4 relative overflow-hidden flex flex-col justify-center min-h-[80px]">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#22C55E]" />
                <h4 className="text-[15px] font-semibold text-[#8B949E] leading-none line-through decoration-[#484F58]">St Mary's Morning Tea</h4>
              </div>
              <div className="text-[#22C55E] text-[11px] font-bold flex items-center gap-1">
                <Check size={12} strokeWidth={3} />
                Completed
              </div>
            </div>
            <div className="text-xs text-[#484F58] pl-4 font-medium">
              Garden Pavilion <span className="mx-1 text-[#21262D]">·</span> 9:00am <span className="mx-1 text-[#21262D]">·</span> 60 covers
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 4: Prep Status bar */}
      <div className="px-5 mb-8">
        <div className="flex justify-between items-end mb-3">
          <h3 className="text-[#F0F6FC] text-sm font-semibold tracking-wide">Prep Progress</h3>
          <span className="text-[#F97316] text-sm font-bold">74%</span>
        </div>
        
        <div className="h-4 bg-[#161B22] border border-[#21262D] rounded-full overflow-hidden mb-3">
          <div className="h-full bg-[#F97316] rounded-full" style={{ width: '74%' }}></div>
        </div>
        
        <div className="flex gap-2">
          <div className="bg-[#161B22] border border-[#21262D] text-[#8B949E] text-xs font-medium px-3 py-1.5 rounded-md">
            <strong className="text-[#F0F6FC] font-semibold mr-1">42</strong> of 57 tasks
          </div>
          <div className="bg-[#EF4444]/10 border border-[#EF4444]/20 text-[#EF4444] text-xs font-semibold px-3 py-1.5 rounded-md flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-[#EF4444]" />
            3 overdue
          </div>
        </div>
      </div>

      {/* SECTION 5: Active Alerts strip */}
      <div className="px-5">
        <h3 className="text-[#F0F6FC] text-sm font-semibold mb-4 tracking-wide">Active Alerts</h3>
        
        <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar -mx-5 px-5">
          {/* Orange alert */}
          <div className="bg-[#F97316]/5 border border-[#F97316]/20 rounded-lg p-3 min-w-[200px] flex-shrink-0">
            <div className="flex items-center gap-1.5 mb-2">
              <Bell size={14} className="text-[#F97316]" />
              <h4 className="text-[#F97316] text-xs font-bold uppercase tracking-wider">Allergy Check</h4>
            </div>
            <p className="text-[#8B949E] text-xs leading-relaxed font-medium">
              Hartley: <strong className="text-[#F0F6FC]">3 nut allergies</strong> — verify menu
            </p>
          </div>

          {/* Yellow alert */}
          <div className="bg-[#EAB308]/5 border border-[#EAB308]/20 rounded-lg p-3 min-w-[200px] flex-shrink-0">
            <div className="flex items-center gap-1.5 mb-2">
              <AlertTriangle size={14} className="text-[#EAB308]" />
              <h4 className="text-[#EAB308] text-xs font-bold uppercase tracking-wider">Short Staff</h4>
            </div>
            <p className="text-[#8B949E] text-xs leading-relaxed font-medium">
              PM shift: <strong className="text-[#F0F6FC]">2 staff</strong> called in sick
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
