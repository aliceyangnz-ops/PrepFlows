import React from "react";
import { Clock, ChefHat, CheckSquare, Calendar, ChevronRight, Bell, Users, MapPin, Battery, Wifi, Signal } from "lucide-react";
import { Progress } from "@/components/ui/progress";

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
      <NavButton icon={Calendar} label="Today" isActive={active === "today"} />
      <NavButton icon={Clock} label="Functions" isActive={active === "functions"} />
      <NavButton icon={CheckSquare} label="Prep" isActive={active === "prep"} />
      <NavButton icon={Users} label="Roster" isActive={active === "roster"} />
    </div>
  );
}

function NavButton({ icon: Icon, label, isActive }: { icon: any, label: string, isActive: boolean }) {
  return (
    <div className={`flex flex-col items-center justify-center space-y-1 w-16 ${isActive ? 'text-amber-500' : 'text-zinc-500'}`}>
      <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
      <span className="text-[10px] font-medium">{label}</span>
    </div>
  );
}

export function TodayDashboard() {
  return (
    <div className="w-[390px] h-[844px] overflow-y-auto relative bg-zinc-950 text-zinc-50 font-sans flex flex-col">
      <StatusBar />
      
      <div className="px-5 pt-4 pb-6 flex-1 overflow-y-auto hide-scrollbar">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Tuesday, Oct 24</h1>
            <div className="flex items-center text-zinc-400 text-sm mt-1">
              <ChefHat size={14} className="mr-1.5" />
              <span>Marco Ricci • Head Chef</span>
            </div>
          </div>
          <div className="relative bg-zinc-900 p-2 rounded-full">
            <Bell size={20} className="text-zinc-300" />
            <div className="absolute top-1.5 right-2 w-2 h-2 bg-red-500 rounded-full border border-zinc-900"></div>
          </div>
        </div>

        {/* Task Progress */}
        <div className="bg-zinc-900 rounded-xl p-4 mb-6 border border-zinc-800">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-zinc-400 font-medium">Daily Prep Progress</span>
            <span className="text-amber-500 font-bold">42 / 68 Tasks</span>
          </div>
          <Progress value={62} className="h-2 bg-zinc-800 [&>div]:bg-amber-500" />
        </div>

        {/* Up Next */}
        <h2 className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-3">Up Next</h2>
        <div className="bg-amber-950/20 border border-amber-900/50 rounded-xl p-4 mb-6">
          <div className="flex justify-between items-start">
            <div className="flex-1 min-w-0">
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-500/20 text-amber-400 mb-2">
                In 2h 15m
              </span>
              <h3 className="font-bold text-lg leading-tight mb-2">Harrison Wedding Luncheon</h3>
              <div className="flex items-center text-zinc-400 text-sm space-x-3">
                <span className="flex items-center"><Clock size={12} className="mr-1" /> 12:00 PM</span>
                <span className="flex items-center"><MapPin size={12} className="mr-1" /> Ballroom A</span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2 ml-3">
              <ChevronRight size={20} className="text-amber-600" />
              <div className="flex items-center gap-1 bg-amber-500/20 border border-amber-500/40 px-2.5 py-1.5 rounded-lg">
                <Users size={13} className="text-amber-400" />
                <span className="text-amber-300 font-bold text-sm">280</span>
                <span className="text-amber-500 text-xs font-medium">pax</span>
              </div>
            </div>
          </div>
        </div>

        {/* Later Today */}
        <h2 className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-3">Later Today</h2>
        <div className="space-y-3 mb-6">
          <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800 flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-base mb-1">Corporate Boardroom Lunch</h3>
              <div className="flex items-center text-zinc-400 text-sm space-x-3">
                <span className="flex items-center"><Clock size={12} className="mr-1" /> 1:00 PM</span>
                <span className="flex items-center"><MapPin size={12} className="mr-1" /> Suite 3</span>
              </div>
            </div>
            <div className="flex items-center gap-1 bg-zinc-800 border border-zinc-700 px-2.5 py-1.5 rounded-lg ml-3">
              <Users size={12} className="text-zinc-400" />
              <span className="text-zinc-200 font-bold text-sm">18</span>
              <span className="text-zinc-400 text-xs">pax</span>
            </div>
          </div>
          
          <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800 flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-base mb-1">Gala Dinner Prep</h3>
              <div className="flex items-center text-zinc-400 text-sm space-x-3">
                <span className="flex items-center"><Clock size={12} className="mr-1" /> 7:00 PM</span>
                <span className="flex items-center"><MapPin size={12} className="mr-1" /> Grand Ballroom</span>
              </div>
            </div>
            <div className="flex items-center gap-1 bg-zinc-800 border border-zinc-700 px-2.5 py-1.5 rounded-lg ml-3">
              <Users size={12} className="text-zinc-400" />
              <span className="text-zinc-200 font-bold text-sm">450</span>
              <span className="text-zinc-400 text-xs">pax</span>
            </div>
          </div>
        </div>
        
        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3 pb-20">
          <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800 flex flex-col items-center justify-center text-center">
            <div className="bg-blue-500/20 text-blue-400 p-3 rounded-full mb-2">
              <CheckSquare size={24} />
            </div>
            <span className="font-semibold text-sm">Prep List</span>
          </div>
          <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800 flex flex-col items-center justify-center text-center">
            <div className="bg-emerald-500/20 text-emerald-400 p-3 rounded-full mb-2">
              <Users size={24} />
            </div>
            <span className="font-semibold text-sm">Staff Roster</span>
          </div>
        </div>
      </div>

      <BottomNav active="today" />
    </div>
  );
}

export default TodayDashboard;