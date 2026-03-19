import { useState } from "react";

function App() {
  const [name, setName] = useState("");

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h2>Mini Task 2 - Input</h2>

      <input
        type="text"
        placeholder="Enter your name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        style={{ padding: "8px", width: "250px" }}
      />

      <p style={{ marginTop: "12px" }}>
        You typed: <strong>{name || "Nothing yet"}</strong>
      </p>
    </div>
  );
}

export default App;