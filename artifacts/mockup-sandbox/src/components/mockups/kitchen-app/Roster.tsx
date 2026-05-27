import React from "react";
import {
  Calendar as CalendarIcon,
  Clock,
  Users,
  MapPin,
  Battery,
  Wifi,
  Signal,
} from "lucide-react";

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
    <div className="absolute bottom-0 left-0 right-0 h-20 bg-zinc-900 border-t border-zinc-800 flex justify-around items-center px-4 pb-4 z-20">
      <NavButton
        icon={CalendarIcon}
        label="Today"
        isActive={active === "today"}
      />
      <NavButton
        icon={Clock}
        label="Functions"
        isActive={active === "functions"}
      />
      <NavButton
        icon={CheckSquareIcon}
        label="Prep"
        isActive={active === "prep"}
      />
      <NavButton icon={Users} label="Roster" isActive={active === "roster"} />
    </div>
  );
}

const CheckSquareIcon = ({ size, strokeWidth, className }: any) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="9 11 12 14 22 4"></polyline>
    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
  </svg>
);

function NavButton({
  icon: Icon,
  label,
  isActive,
}: {
  icon: any;
  label: string;
  isActive: boolean;
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center space-y-1 w-16 ${isActive ? "text-amber-500" : "text-zinc-500"}`}
    >
      <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
      <span className="text-[10px] font-medium">{label}</span>
    </div>
  );
}

export function Roster() {
  // Hours array from 5AM to 8PM
  const hours = [5, 7, 9, 11, 13, 15, 17, 19];

  return (
    <div className="w-[390px] h-[844px] overflow-y-auto relative bg-zinc-950 text-zinc-50 font-sans flex flex-col">
      <StatusBar />

      {/* Header */}
      <div className="px-5 pt-3 pb-4 bg-zinc-950 sticky top-0 z-10 border-b border-zinc-800">
        <h1 className="text-2xl font-bold tracking-tight mb-2">Daily Roster</h1>
        <div className="flex space-x-2">
          <span className="px-3 py-1 bg-amber-500/20 text-amber-500 rounded-full text-xs font-bold border border-amber-500/30">
            Oct 24
          </span>
          <span className="px-3 py-1 bg-zinc-800 text-zinc-300 rounded-full text-xs font-bold">
            5 Staff
          </span>
        </div>
      </div>

      <div className="px-5 py-5 pb-24 overflow-y-auto hide-scrollbar">
        {/* Timeline Header */}
        <div className="flex mb-4 ml-16">
          {hours.map((h) => (
            <div
              key={h}
              className="flex-1 text-[10px] text-zinc-500 font-bold -ml-2"
            >
              {h > 12 ? h - 12 : h}
              {h >= 12 ? "p" : "a"}
            </div>
          ))}
        </div>

        <div className="space-y-6">
          {/* Marco - Head Chef */}
          <div className="relative">
            <div className="flex items-center mb-2">
              <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-sm border-2 border-zinc-700 z-10 text-white">
                MR
              </div>
              <div className="ml-3">
                <div className="font-bold text-sm text-zinc-100">
                  Marco Ricci
                </div>
                <div className="text-[10px] uppercase font-bold text-red-400">
                  Head Chef
                </div>
              </div>
            </div>
            {/* Timeline bar 5am - 2pm */}
            <div className="ml-16 h-8 bg-zinc-900 rounded border border-zinc-800 relative overflow-hidden">
              <div className="absolute top-0 bottom-0 left-0 w-[60%] bg-red-500/20 border-l-2 border-red-500 flex items-center px-2">
                <span className="text-[10px] font-bold text-red-200 truncate">
                  5:00am - 2:00pm
                </span>
              </div>
            </div>
            <div className="ml-16 mt-1 flex text-[10px] text-zinc-500 items-center">
              <MapPin size={10} className="mr-1" /> All Functions
            </div>
          </div>

          {/* Sarah - Sous Chef */}
          <div className="relative">
            <div className="flex items-center mb-2">
              <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-sm border-2 border-zinc-700 z-10 text-white">
                SC
              </div>
              <div className="ml-3">
                <div className="font-bold text-sm text-zinc-100">
                  Sarah Chen
                </div>
                <div className="text-[10px] uppercase font-bold text-orange-400">
                  Sous Chef
                </div>
              </div>
            </div>
            {/* Timeline bar 7am - 4pm */}
            <div className="ml-16 h-8 bg-zinc-900 rounded border border-zinc-800 relative overflow-hidden">
              <div className="absolute top-0 bottom-0 left-[13%] w-[60%] bg-orange-500/20 border-l-2 border-orange-500 flex items-center px-2">
                <span className="text-[10px] font-bold text-orange-200 truncate">
                  7:00am - 4:00pm
                </span>
              </div>
            </div>
            <div className="ml-16 mt-1 flex text-[10px] text-zinc-500 items-center">
              <MapPin size={10} className="mr-1" /> Ballroom A, Grand Ballroom
            </div>
          </div>

          {/* Amara - Pastry Chef */}
          <div className="relative">
            <div className="flex items-center mb-2">
              <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-sm border-2 border-zinc-700 z-10 text-white">
                AO
              </div>
              <div className="ml-3">
                <div className="font-bold text-sm text-zinc-100">
                  Amara Osei
                </div>
                <div className="text-[10px] uppercase font-bold text-pink-400">
                  Pastry Chef
                </div>
              </div>
            </div>
            {/* Timeline bar 6am - 3pm */}
            <div className="ml-16 h-8 bg-zinc-900 rounded border border-zinc-800 relative overflow-hidden">
              <div className="absolute top-0 bottom-0 left-[6%] w-[60%] bg-pink-500/20 border-l-2 border-pink-500 flex items-center px-2">
                <span className="text-[10px] font-bold text-pink-200 truncate">
                  6:00am - 3:00pm
                </span>
              </div>
            </div>
            <div className="ml-16 mt-1 flex text-[10px] text-zinc-500 items-center">
              <MapPin size={10} className="mr-1" /> Grand Ballroom
            </div>
          </div>

          {/* Current User Highlighted */}
          <div className="relative bg-blue-950/20 p-3 -mx-3 rounded-xl border border-blue-900/30">
            <div className="flex items-center mb-2">
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-bold text-sm border-2 border-blue-400 z-10 text-white">
                JM
              </div>
              <div className="ml-3">
                <div className="font-bold text-sm text-blue-50">
                  Jake Morrison (You)
                </div>
                <div className="text-[10px] uppercase font-bold text-blue-400">
                  Casual Chef
                </div>
              </div>
            </div>
            {/* Timeline bar 9am - 5pm */}
            <div className="ml-13 h-8 bg-zinc-900/50 rounded border border-zinc-800 relative overflow-hidden">
              <div className="absolute top-0 bottom-0 left-[26%] w-[53%] bg-blue-500/30 border-l-2 border-blue-400 flex items-center px-2">
                <span className="text-[10px] font-bold text-blue-200 truncate">
                  9:00am - 5:00pm
                </span>
              </div>
            </div>
            <div className="ml-13 mt-2 bg-blue-900/40 rounded p-2 border border-blue-800/50">
              <div className="text-xs font-bold text-blue-200 mb-1">
                Harrison Wedding
              </div>
              <div className="flex text-[10px] text-blue-300 items-center font-medium">
                <MapPin size={10} className="mr-1" /> Ballroom A
              </div>
            </div>
          </div>

          {/* Liam - Casual Chef */}
          <div className="relative">
            <div className="flex items-center mb-2">
              <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-sm border-2 border-zinc-700 z-10 text-white">
                LW
              </div>
              <div className="ml-3">
                <div className="font-bold text-sm text-zinc-100">
                  Liam Walsh
                </div>
                <div className="text-[10px] uppercase font-bold text-blue-400">
                  Casual Chef
                </div>
              </div>
            </div>
            {/* Timeline bar 10am - 6pm */}
            <div className="ml-16 h-8 bg-zinc-900 rounded border border-zinc-800 relative overflow-hidden">
              <div className="absolute top-0 bottom-0 left-[33%] w-[53%] bg-blue-500/20 border-l-2 border-blue-500 flex items-center px-2">
                <span className="text-[10px] font-bold text-blue-200 truncate">
                  10:00am - 6:00pm
                </span>
              </div>
            </div>
            <div className="ml-16 mt-1 flex text-[10px] text-zinc-500 items-center">
              <MapPin size={10} className="mr-1" /> Grand Ballroom
            </div>
          </div>
        </div>
      </div>

      <BottomNav active="roster" />
    </div>
  );
}

export default Roster;
