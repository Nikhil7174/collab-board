import { useEffect, useState } from "react";
// import "./App.css";
import WhiteBoard from "../components/WhiteboardComponent";

const CanvasDrawing = () => {
  const [brushColor, setBrushColor] = useState("black");
  const [brushSize, setBrushSize] = useState<number>(5);

  const [uuid, setUuid] = useState<string>("");
  const [link, setLink] = useState<Boolean>(false);

  useEffect(() => {
    console.log("CanvasDrawing ", brushSize);
  }, [brushSize]);

  const handleUuid = (id: any) => {
    setUuid(id);
  };

  const baseUrl = "http://localhost:5175/board";

  const url = baseUrl + "?roomID=" + uuid;

  return (
    <div className="App bg-blue-700 flex flex-col items-center">
      <div className="font-bold text-3xl m-5 text-white">
        Collaborative Whiteboard
      </div>
      <div className="items-center justify-center mb-9">
        <WhiteBoard
          brushColor={brushColor}
          brushSize={brushSize}
          handleUuid={handleUuid}
        />
        <div className="tools flex flex-row p-5 space-x-4 bg-black text-white">
          <div>
            <span>Color: </span>
            <input
              type="color"
              value={brushColor}
              onChange={(e) => setBrushColor(e.target.value)}
            />
          </div>
          <div>
            <span>Size: </span>
            <input
              type="range"
              color="#fac176"
              min="1"
              max="100"
              value={brushSize}
              onChange={(e) => setBrushSize(Number(e.target.value))}
            />
            <span>{brushSize}</span>
          </div>
          <div>
            <button
              className="bg-green-600 py-2 px-3 text-white"
              onClick={() => setLink(true)}
            >
              Generate Url
            </button>
          </div>
        </div>
        <div id="url">
          <div
            className={`p-4 bg-[#faebd7] text-black ${
              link ? "block" : "hidden"
            }`}
          >
            {url}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CanvasDrawing;
