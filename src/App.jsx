import { useState } from "react";

function App() {
  const [link, setLink] = useState("somelink");
  function generateLink() {
    setLink(Math.random(100));
  }

  function copyLink() {
    if (link != "") {
      navigator.clipboard.writeText(link);

      // Alert the copied text
      alert("Copied the link: " + link);
    } else {
      alert("firstly generate link");
    }
  }
  return (
    <div>
      <h1>heloo</h1>
      <h3>here you can generate link</h3>
      <input type="text" readOnly value={link} />

      <button onClick={generateLink}>Click to generate</button>
      <br />
      <button onClick={copyLink}>copy</button>
    </div>
  );
}

export default App;
