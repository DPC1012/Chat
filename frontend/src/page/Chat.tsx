// import { Button } from "../components/Button";
// import { InputBox } from "../components/InputBox";
// import { Static } from "../components/Static";

// export const Chat = () => {
//   return (
//     <div className="text-white bg-black h-screen flex justify-center items-center font-mono">
//       <div className="border-2 border-stone-800 rounded-xl px-6 py-4">
//         <Static />
//         <div className="border-2 border-stone-800 rounded-md m-3 w-lg min-h-130 scroll-auto"></div>
//         <div className="flex">
//           <div>
//             <InputBox
//               placeholder="Type a message . . . . . . . . "
//               size="w-sm m-3 py-2"
//             />
//           </div>
//           <div>
//             <Button
//               title="Send"
//               variants="sm"
//               loading={false}
//               onClick={() => {}}
//             />
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

import { useState, useRef, useEffect } from "react";
import { Button } from "../components/Button";
import { InputBox } from "../components/InputBox";
import { Static } from "../components/Static";

export const Chat = () => {
  const [messages, setMessages] = useState<
    { text: string; sender: "me" | "other" }[]
  >([]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom when new message arrives
  useEffect(() => { 
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  function handleSend() {
    if (!input.trim()) return;
    // Add your message
    setMessages((prev) => [...prev, { text: input, sender: "me" }]);
    setInput("");

    // Simulate receiving a reply (for testing)
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { text: "Got your message!", sender: "other" },
      ]);
    }, 1000);
  }

  return (
    <div className="text-white bg-black h-screen flex justify-center items-center font-mono">
      <div className="border-2 border-stone-800 rounded-xl px-6 py-4 w-[600px]">
        <Static />

        {/* Scrollable messages container */}
        <div
          ref={scrollRef}
          className="border-2 border-stone-800 rounded-md m-3 w-lg min-h-130 h-[400px] overflow-y-auto no-scrollbar p-3 space-y-2"
        >
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`max-w-[70%] px-3 py-2 rounded-lg ${
                msg.sender === "me"
                  ? "bg-stone-700 ml-auto text-right"
                  : "bg-gray-700 mr-auto text-left"
              }`}
            >
              {msg.text}
            </div>
          ))}
        </div>

        {/* Input & send button */}
        <div className="flex">
          <InputBox
            placeholder="Type a message..."
            size="w-full m-3 py-2"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <Button
            title="Send"
            variants="sm"
            loading={false}
            onClick={handleSend}
          />
        </div>
      </div>
    </div>
  );
};
