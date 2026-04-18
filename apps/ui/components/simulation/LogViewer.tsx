import { Terminal, CheckCircle2 } from "lucide-react";

interface Log {
  id: number;
  time: string;
  message: string;
  type: string;
}

export const LogViewer = ({ logs }: { logs: Log[] }) => {
  const getLogColor = (type: string) => {
    switch (type) {
      case "added":
        return "text-green-400";
      case "removed":
        return "text-red-400";
      case "mixed":
        return "text-orange-400";
      case "action":
        return "text-purple-300";
      default:
        return "text-blue-300";
    }
  };

  return (
    <div className="bg-slate-900 rounded-xl p-6 text-white font-mono text-sm h-[540px] flex flex-col shadow-2xl">
      <div className="flex justify-between items-center mb-4 border-b border-slate-700 pb-2">
        <div className="flex items-center gap-2">
          <Terminal size={16} className="text-blue-400" />
        </div>
        <div className="flex gap-1">
          <div className="w-2 h-2 rounded-full bg-red-500" />
          <div className="w-2 h-2 rounded-full bg-yellow-500" />
          <div className="w-2 h-2 rounded-full bg-green-500" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar">
        {logs.map((log) => (
          <div
            key={log.id}
            className="flex gap-3 animate-in fade-in slide-in-from-left duration-300"
          >
            <span className="text-slate-500">[{log.time}]</span>
            <span className={getLogColor(log.type)}>{log.message}</span>;
          </div>
        ))}
        {logs.length === 0 && <div className="text-slate-600 italic">...</div>}
      </div>
    </div>
  );
};
