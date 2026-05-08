import React from "react";
import { ArrowLeft, Clock, MapPin, Users, CheckCircle2, Circle, AlertCircle, PlayCircle, Battery, Wifi, Signal } from "lucide-react";

function StatusBar() {
  return (
    <div className="flex justify-between items-center px-6 py-3 text-xs font-medium text-zinc-200">
      <span>9:41</span>
      <div className="flex items-center space-x-2">
        <Signal size={14} />
        <Wifi size={14} />
        <Battery size={14} />
      </div>
    </div>
  );
}

function BottomNav({ active }: { active: string }) {
  return (
    <div className="absolute bottom-0 left-0 right-0 h-20 bg-zinc-900 border-t border-zinc-800 flex justify-around items-center px-4 pb-4">
      <NavButton icon={CalendarIcon} label="Today" isActive={active === "today"} />
      <NavButton icon={Clock} label="Functions" isActive={active === "functions"} />
      <NavButton icon={CheckSquareIcon} label="Prep" isActive={active === "prep"} />
      <NavButton icon={Users} label="Roster" isActive={active === "roster"} />
    </div>
  );
}

const CalendarIcon = ({size, strokeWidth, className}:any) => <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>;
const CheckSquareIcon = ({size, strokeWidth, className}:any) => <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4"></polyline><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>;

function NavButton({ icon: Icon, label, isActive }: { icon: any, label: string, isActive: boolean }) {
  return (
    <div className={`flex flex-col items-center justify-center space-y-1 w-16 ${isActive ? 'text-amber-500' : 'text-zinc-500'}`}>
      <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
      <span className="text-[10px] font-medium">{label}</span>
    </div>
  );
}

export function FunctionDetail() {
  return (
    <div className="w-[390px] h-[844px] overflow-y-auto relative bg-zinc-950 text-zinc-50 font-sans flex flex-col">
      <StatusBar />
      
      {/* Header */}
      <div className="px-4 py-3 flex items-center bg-zinc-900/80 border-b border-zinc-800 sticky top-0 z-10 backdrop-blur-sm">
        <button className="p-2 -ml-2 text-zinc-400">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-lg font-bold ml-2 truncate">Harrison Wedding</h1>
      </div>

      <div className="px-5 py-5 flex-1 overflow-y-auto hide-scrollbar">
        {/* Function Meta */}
        <div className="mb-6">
          <h2 className="text-2xl font-black mb-3">Harrison Wedding Luncheon</h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-zinc-900 rounded-lg p-3 border border-zinc-800 flex items-center">
              <Clock className="text-amber-500 mr-2" size={18} />
              <div>
                <div className="text-[10px] text-zinc-500 uppercase font-bold">Start Time</div>
                <div className="font-semibold text-sm">12:00 PM</div>
              </div>
            </div>
            <div className="bg-zinc-900 rounded-lg p-3 border border-zinc-800 flex items-center">
              <Users className="text-blue-500 mr-2" size={18} />
              <div>
                <div className="text-[10px] text-zinc-500 uppercase font-bold">Guests</div>
                <div className="font-semibold text-sm">280 Pax</div>
              </div>
            </div>
            <div className="bg-zinc-900 rounded-lg p-3 border border-zinc-800 flex items-center col-span-2">
              <MapPin className="text-emerald-500 mr-2" size={18} />
              <div>
                <div className="text-[10px] text-zinc-500 uppercase font-bold">Location</div>
                <div className="font-semibold text-sm">Ballroom A</div>
              </div>
            </div>
          </div>
        </div>

        {/* Menu Summary */}
        <div className="mb-6">
          <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-3">Menu Requirements</h3>
          <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800 text-sm">
            <div className="flex justify-between border-b border-zinc-800 pb-2 mb-2">
              <span className="text-zinc-300">Canapés</span>
              <span className="font-bold">4 varieties</span>
            </div>
            <div className="flex justify-between border-b border-zinc-800 pb-2 mb-2">
              <span className="text-zinc-300">Starter (Alt Drop)</span>
              <span className="font-bold">140 / 140</span>
            </div>
            <div className="flex justify-between border-b border-zinc-800 pb-2 mb-2">
              <span className="text-zinc-300">Main (Alt Drop)</span>
              <span className="font-bold">140 / 140</span>
            </div>
            <div className="flex justify-between text-amber-400">
              <span>Dietaries</span>
              <span className="font-bold">12 GF, 5 V, 2 NF</span>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="mb-6 pb-20">
          <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-4">Preparation Timeline</h3>
          
          <div className="relative border-l border-zinc-800 ml-3 space-y-6">
            <div className="relative pl-6">
              <CheckCircle2 className="absolute -left-[11px] top-0 text-emerald-500 bg-zinc-950" size={22} />
              <div className="text-xs font-bold text-zinc-500 mb-1">6:00 AM</div>
              <div className="font-semibold text-emerald-50 text-base">Mise en place</div>
              <div className="text-zinc-400 text-sm mt-1">Vegetables chopped, stocks started.</div>
            </div>

            <div className="relative pl-6">
              <PlayCircle className="absolute -left-[11px] top-0 text-amber-500 bg-zinc-950" size={22} />
              <div className="text-xs font-bold text-amber-500 mb-1">9:00 AM</div>
              <div className="font-semibold text-amber-50 text-base">Main Prep</div>
              <div className="text-amber-200/70 text-sm mt-1">Proteins sealed, sauces finishing.</div>
              <div className="mt-2 flex space-x-2">
                <span className="px-2 py-1 bg-amber-500/20 text-amber-400 rounded text-[10px] font-bold">Marco R.</span>
                <span className="px-2 py-1 bg-amber-500/20 text-amber-400 rounded text-[10px] font-bold">Sarah C.</span>
              </div>
            </div>

            <div className="relative pl-6">
              <Circle className="absolute -left-[11px] top-0 text-zinc-600 bg-zinc-950" size={22} />
              <div className="text-xs font-bold text-zinc-500 mb-1">11:30 AM</div>
              <div className="font-semibold text-zinc-300 text-base">Service Set Up</div>
              <div className="text-zinc-500 text-sm mt-1">Pass arranged, hot boxes on.</div>
            </div>

            <div className="relative pl-6">
              <AlertCircle className="absolute -left-[11px] top-0 text-zinc-600 bg-zinc-950" size={22} />
              <div className="text-xs font-bold text-zinc-500 mb-1">12:00 PM</div>
              <div className="font-semibold text-zinc-300 text-base">Service Commences</div>
              <div className="text-zinc-500 text-sm mt-1">First course away at 12:15 PM.</div>
            </div>
          </div>
        </div>

      </div>

      <BottomNav active="functions" />
    </div>
  );
}

export default FunctionDetail;