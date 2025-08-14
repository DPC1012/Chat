import {useRef, useState } from "react";
import { Button } from "../components/Button";
import { InputBox } from "../components/InputBox";
import { Static } from "../components/Static";
import { CodeShare } from "../components/CodeShare";
import { useNavigate } from "react-router-dom"  ;

export const Join = () => {
  const [loading1, setLoading1] = useState(false);
  const [loading2, setLoading2] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const [code, setCode] = useState("");

  function HandleJoin() {
  if (!inputRef.current?.value || inputRef.current.value !== code) {
    alert("Please enter a valid room code.");
    return;
  }

  const ws = new WebSocket("ws://localhost:5050");

  ws.onopen = () => {
    console.log("Connected to server");

    ws.send(JSON.stringify({
      type: "join",
      payload: { room: inputRef.current!.value }
    }));

    navigate("/chat", { state: inputRef.current!.value });
  };

  ws.onmessage = (event) => {
    console.log("Message from server:", event.data);
  };

  ws.onclose = () => console.log("Closed");

  ws.onerror = (err) => console.error("WebSocket error", err);
}


  return (
    <div className="text-white bg-black h-screen flex justify-center items-center font-mono">
      <div className="border-2 border-stone-800 rounded-xl px-6 py-4">
        <Static />
        <div>
          <Button
            title="Create New Room"
            variants="lg"
            onClick={() => {
              setLoading1(true);
              setTimeout(() => {
                setCode(Code());
                setLoading1(false);
              }, 1000);
            }}
            loading={loading1}
          />
        </div>
        <div className="flex justify-between">
          <div className="m-3">
            <InputBox
              ref={inputRef}
              placeholder="Enter Room Code"
              size="w-sm"
            />
          </div>
          <div>
            <Button
              title="Join Room"
              variants="md"
              onClick={() => {
                setLoading2(true);
                setTimeout(() => {
                  HandleJoin();
                  setLoading2(false);
                }, 1000);
              }}
              loading={loading2}
            />
          </div>
        </div>
        {code && <CodeShare code={code} />}
      </div>
    </div>
  );
};

function Code() {
  const chars = "A1B2C3D4E5F6G7H8I9J0";
  return Array.from(
    { length: 6 },
    () => chars[Math.floor(Math.random() * chars.length)]
  ).join("");
}
