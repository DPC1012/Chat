import { ChatIcon } from "../icons/ChatIcon";

export const Static = () => {
  return (
    <div className="animate-in fade-in slide-in-from-left-2 duration-700">
      <div className="flex gap-2 ml-3 font-mono">
        <div className="flex items-center text-white">
          <ChatIcon />
        </div>
        <div className="text-2xl font-bold tracking-tighter">{"Real Time Chat"}</div>
      </div>
      <div className="font-normal text-[10px] text-slate-500 ml-3 mb-2 tracking-[0.2em] uppercase">
        {"Temporary channel • auto-destruct on exit"}
      </div>
    </div>
  );
};
