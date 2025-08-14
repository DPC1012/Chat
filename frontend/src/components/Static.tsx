import { ChatIcon } from "../icons/ChatIcon";

export const Static = () => {
  return (
    <>
      <div className="flex gap-2 ml-3 font-mono">
        <div className="flex items-center">
          <ChatIcon />
        </div>
        <div className="text-2xl font-bold ">{"Real Time Chat"}</div>
      </div>
      <div className="font-noraml text-xs text-slate-300 ml-3 mb-2 tracking-wider">
        {"Temporary room that expires after both users exit"}
      </div>
    </>
  );
};
