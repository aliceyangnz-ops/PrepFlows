import React, { useState } from "react";
import { Check, Calendar as CalendarIcon, Clock, Users, Battery, Wifi, Signal, Filter, Search } from "lucide-react";
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
    <div className="absolute bottom-0 left-0 right-0 h-20 bg-zinc-900 border-t border-zinc-800 flex justify-around items-center px-4 pb-4 z-20">
      <NavButton icon={CalendarIcon} label="Today" isActive={active === "today"} />
      <NavButton icon={Clock} label="Functions" isActive={active === "functions"} />
      <NavButton icon={CheckSquareIcon} label="Prep" isActive={active === "prep"} />
      <NavButton icon={Users} label="Roster" isActive={active === "roster"} />
    </div>
  );
}

const CheckSquareIcon = ({size, strokeWidth, className}:any) => <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4"></polyline><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>;

function NavButton({ icon: Icon, label, isActive }: { icon: any, label: string, isActive: boolean }) {
  return (
    <div className={`flex flex-col items-center justify-center space-y-1 w-16 ${isActive ? 'text-amber-500' : 'text-zinc-500'}`}>
      <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
      <span className="text-[10px] font-medium">{label}</span>
    </div>
  );
}

function PrepItem({ title, qty, note, done, tag }: { title: string, qty: string, note: string, done: boolean, tag?: string }) {
  const [isDone, setIsDone] = useState(done);
  
  return (
    <div 
      className={`flex items-start p-3 rounded-lg border mb-2 transition-colors ${isDone ? 'bg-zinc-900/50 border-zinc-800/50 opacity-50' : 'bg-zinc-900 border-zinc-700'}`}
      onClick={() => setIsDone(!isDone)}
    >
      <div className={`mt-1 mr-3 flex-shrink-0 w-6 h-6 rounded flex items-center justify-center border ${isDone ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-zinc-950 border-zinc-600 text-transparent'}`}>
        <Check size={16} strokeWidth={3} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start mb-1">
          <h4 className={`font-semibold text-sm truncate ${isDone ? 'line-through text-zinc-500' : 'text-zinc-100'}`}>{title}</h4>
          <span className={`text-xs font-bold whitespace-nowrap ml-2 ${isDone ? 'text-zinc-600' : 'text-amber-500'}`}>{qty}</span>
        </div>
        <p className={`text-xs ${isDone ? 'text-zinc-600' : 'text-zinc-400'}`}>{note}</p>
        {tag && !isDone && (
          <div className="mt-2 inline-flex text-[9px] uppercase tracking-wider font-bold bg-zinc-800 text-zinc-300 px-1.5 py-0.5 rounded">
            {tag}
          </div>
        )}
      </div>
    </div>
  );
}

export function PrepList() {
  return (
    <div className="w-[390px] h-[844px] overflow-y-auto relative bg-zinc-950 text-zinc-50 font-sans flex flex-col">
      <StatusBar />
      
      {/* Header */}
      <div className="px-5 pt-3 pb-4 bg-zinc-950 sticky top-0 z-10">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold tracking-tight">Prep List</h1>
          <button className="p-2 bg-zinc-900 rounded-full text-zinc-400">
            <Filter size={18} />
          </button>
        </div>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
          <input 
            type="text" 
            placeholder="Search tasks..." 
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2 pl-9 pr-4 text-sm focus:outline-none focus:border-amber-500 text-zinc-100 placeholder-zinc-500"
          />
        </div>
        
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="text-zinc-400">Overall Progress</span>
          <span className="font-bold text-amber-500">62%</span>
        </div>
        <Progress value={62} className="h-1.5 bg-zinc-800 [&>div]:bg-amber-500" />
      </div>

      <div className="px-5 pb-24 overflow-y-auto hide-scrollbar">
        {/* Section 1 */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3 border-b border-zinc-800 pb-1">
            <h3 className="text-sm font-black text-white uppercase tracking-wider">Proteins</h3>
            <span className="text-xs text-zinc-500 font-bold">1 / 3 Done</span>
          </div>
          <PrepItem 
            title="Chicken Supreme" 
            qty="140 port." 
            note="Seal and pan-fry, rest. Do not fully cook." 
            tag="Harrison Wed"
            done={true} 
          />
          <PrepItem 
            title="Beef Tenderloin" 
            qty="140 port." 
            note="Trim, portion to 180g, vac pack for sous vide." 
            tag="Harrison Wed"
            done={false} 
          />
          <PrepItem 
            title="Salmon Fillet" 
            qty="450 port." 
            note="Pin bone, portion to 160g." 
            tag="Gala Dinner"
            done={false} 
          />
        </div>

        {/* Section 2 */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3 border-b border-zinc-800 pb-1">
            <h3 className="text-sm font-black text-white uppercase tracking-wider">Sauces & Jus</h3>
            <span className="text-xs text-zinc-500 font-bold">2 / 2 Done</span>
          </div>
          <PrepItem 
            title="Red Wine Jus" 
            qty="4 Litres" 
            note="Reduce, strain, mount with butter just before service." 
            tag="Harrison Wed"
            done={true} 
          />
          <PrepItem 
            title="Beurre Blanc" 
            qty="2 Litres" 
            note="Prep base, hold for service." 
            tag="Corp Lunch"
            done={true} 
          />
        </div>

        {/* Section 3 */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3 border-b border-zinc-800 pb-1">
            <h3 className="text-sm font-black text-white uppercase tracking-wider">Garnishes</h3>
            <span className="text-xs text-zinc-500 font-bold">0 / 2 Done</span>
          </div>
          <PrepItem 
            title="Potato Fondant" 
            qty="140 pcs" 
            note="Punch out, confit in duck fat." 
            tag="Harrison Wed"
            done={false} 
          />
          <PrepItem 
            title="Baby Carrots" 
            qty="450 pcs" 
            note="Peel, blanch, ice bath." 
            tag="Gala Dinner"
            done={false} 
          />
        </div>
      </div>

      <BottomNav active="prep" />
    </div>
  );
}

export default PrepList;