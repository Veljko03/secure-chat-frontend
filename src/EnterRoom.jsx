import { useState } from "react";

const EnterRoom = () => {
  const [code, setCode] = useState("");

  const handleSubmit = (e) => {
    e.preventDefoult();
    if (code == "") {
      alert("enter some code");
    }
    fetch();
  };
  return (
    <div>
      <h1>Enter room code here</h1>
      <form onSubmit={handleSubmit}>
        <h5>Secret code:</h5>
        <input
          type="text"
          value={code}
          required
          onChange={(event) => setCode(event.target.value)}
        />
      </form>
    </div>
  );
};

export default EnterRoom;
