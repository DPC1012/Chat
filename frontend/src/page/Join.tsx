import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/Button";
import { CodeShare } from "../components/CodeShare";
import { InputBox } from "../components/InputBox";
import { Static } from "../components/Static";

export const Join = () => {
  const [roomCode, setRoomCode] = useState("");
  const [createdCode, setCreatedCode] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  function enterRoom(code: string, intent: "join" | "create" = "join") {
    const normalizedCode = normalizeRoomCode(code);

    if (!normalizedCode) {
      setError("Please enter a room code.");
      return;
    }

    setError("");
    navigate(`/chat/${encodeURIComponent(normalizedCode)}`, { state: { intent } });
  }

  function createRoom() {
    const code = generateRoomCode();
    setCreatedCode(code);
    setRoomCode(code);
    setError("");
  }

  return (
    <main className="min-h-screen bg-black px-4 py-8 text-white selection:bg-white selection:text-black">
      <section className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-xl items-center animate-in zoom-in-95 duration-500">
        <div className="w-full rounded-xl border-2 border-stone-800 bg-zinc-950/50 backdrop-blur-sm px-4 py-8 sm:px-10 shadow-2xl relative overflow-hidden font-sans">
          {/* Decorative background element */}
          <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/5 blur-3xl" />
          
          <div className="relative z-10">
            <Static />

            <div className="mt-8 space-y-6">
              <div className="group">
                <Button 
                  title="Create New Room" 
                  variants="lg" 
                  onClick={createRoom} 
                />
                <p className="mt-2 text-[10px] text-center text-slate-500 uppercase tracking-[0.2em] opacity-0 group-hover:opacity-100 transition-opacity font-mono">
                  Generate a private secure link
                </p>
              </div>

              <div className="relative flex items-center py-2">
                <div className="flex-grow border-t border-stone-800"></div>
                <span className="flex-shrink mx-4 text-[10px] text-stone-600 uppercase tracking-widest font-mono">OR</span>
                <div className="flex-grow border-t border-stone-800"></div>
              </div>

              <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
                <div className="relative group">
                  <InputBox
                    placeholder="Enter Room Code"
                    size="w-full uppercase tracking-[0.3em] font-bold text-center sm:text-left transition-all duration-300 group-hover:border-stone-600 font-mono"
                    value={roomCode}
                    maxLength={6}
                    onChange={(event) => {
                      const val = event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "");
                      setRoomCode(val.slice(0, 6));
                      setError("");
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        enterRoom(roomCode);
                      }
                    }}
                  />
                  {roomCode.length > 0 && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-stone-500 animate-in fade-in zoom-in duration-200 font-mono">
                      {roomCode.length}/6
                    </span>
                  )}
                </div>

                <Button
                  title="Join Room"
                  variants="md"
                  onClick={() => enterRoom(roomCode)}
                />
              </div>
            </div>

            {error && (
              <div className="mt-4 rounded-md border border-red-900/50 bg-red-950/30 px-4 py-3 text-xs text-red-200 animate-in shake-1 duration-300 flex items-center gap-2 font-sans">
                <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                {error}
              </div>
            )}

            {createdCode && (
              <div className="mt-6 space-y-4 animate-in slide-in-from-top-4 duration-500 font-sans">
                <div className="border-t border-stone-800 pt-6">
                  <CodeShare code={createdCode} />
                </div>
                <Button
                  title="Enter Secure Channel"
                  variants="lg"
                  onClick={() => enterRoom(createdCode, "create")}
                />
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
};

function generateRoomCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from(
    { length: 6 },
    () => chars[Math.floor(Math.random() * chars.length)]
  ).join("");
}

function normalizeRoomCode(code: string) {
  return code.trim().toUpperCase();
}
