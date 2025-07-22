import { useState } from "react";
import "./App.css";

import { ArtTable } from "./components/ArtTable";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <div className="p-4">
        <ArtTable></ArtTable>
      </div>
    </>
  );
}

export default App;
