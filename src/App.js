import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import MarkupGenerator from "./components/app/MarkupGenerator.jsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route exact path="/" element={<MarkupGenerator />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
