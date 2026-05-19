import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Chat } from "./page/Chat";
import { Join } from "./page/Join";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Join />} />
        <Route path="/chat/:roomId" element={<Chat />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
