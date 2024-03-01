import { useEffect, useState } from "react";
import "./App.css";
import Board from "./components/WhiteboardComponent";

const CanvasDrawing = () => {
  const [brushColor, setBrushColor] = useState("black");
  const [brushSize, setBrushSize] = useState<number>(5);

  useEffect(() => {
    console.log("CanvasDrawing ", brushSize);
  }, [brushSize]);

  return (
    <div className="App bg-blue-700 flex flex-col items-center">
      <div className="font-bold text-3xl">Collaborative Whiteboard</div>
      <div className="items-center justify-center">
        <Board brushColor={brushColor} brushSize={brushSize} />
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
        </div>
      </div>
    </div>
  );
};

export default CanvasDrawing;
