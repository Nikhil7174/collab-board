//@ts-nocheck
import React, { useRef, useEffect, useState } from "react";
import io from "socket.io-client";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import "./WhiteBoard.css";

interface MyBoard {
  brushColor: string;
  brushSize: number;
  handleUuid: (uuid: string) => void;
}

const Board: React.FC<MyBoard> = ({ brushColor, brushSize, handleUuid }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [CollabID, setCollabID] = useState<string | null>(null);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const roomID = urlParams.get("roomID") || uuidv4();
    setCollabID(roomID);
    const newSocket = io("https://collab-board.onrender.com", { query: { roomID } });
    console.log("Connected to socket:", newSocket, " Room ID:", roomID);
    setSocket(newSocket);
    handleUuid(roomID);
    return () => newSocket.disconnect(); // Cleanup socket on unmount
  }, []);

  useEffect(() => {
    if (!socket) return;
    socket.on("canvasImage", (data) => {
      const image = new Image();
      image.src = data;
      image.onload = () => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext("2d");
        if (ctx) ctx.drawImage(image, 0, 0);
      };
    });
    return () => socket.off("canvasImage"); // Cleanup listener
  }, [socket]);

  useEffect(() => {
    let isDrawing = false;
    let lastX = 0,
      lastY = 0;

    const startDrawing = (e: MouseEvent) => {
      isDrawing = true;
      [lastX, lastY] = [e.offsetX, e.offsetY];
    };

    const draw = (e: MouseEvent) => {
      if (!isDrawing) return;
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (ctx) {
        ctx.strokeStyle = brushColor;
        ctx.lineWidth = brushSize;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(e.offsetX, e.offsetY);
        ctx.stroke();
      }
      [lastX, lastY] = [e.offsetX, e.offsetY];
    };

    const endDrawing = () => {
      isDrawing = false;
      const canvas = canvasRef.current;
      if (canvas && socket) {
        socket.emit("canvasImage", canvas.toDataURL());
      }
    };

    const canvas = canvasRef.current;
    if (canvas) {
      canvas.addEventListener("mousedown", startDrawing);
      canvas.addEventListener("mousemove", draw);
      canvas.addEventListener("mouseup", endDrawing);
      canvas.addEventListener("mouseout", endDrawing);
    }

    return () => {
      if (canvas) {
        canvas.removeEventListener("mousedown", startDrawing);
        canvas.removeEventListener("mousemove", draw);
        canvas.removeEventListener("mouseup", endDrawing);
        canvas.removeEventListener("mouseout", endDrawing);
      }
    };
  }, [brushColor, brushSize, socket]);

  const [windowSize, setWindowSize] = useState([window.innerWidth, window.innerHeight]);

  useEffect(() => {
    const handleWindowResize = () => setWindowSize([window.innerWidth, window.innerHeight]);
    window.addEventListener("resize", handleWindowResize);
    return () => window.removeEventListener("resize", handleWindowResize);
  }, []);

  const [snapshotURL, setSnapshotURL] = useState<string | null>(null);
  const takeSnapshot = () => {
    if (canvasRef.current) {
      setSnapshotURL(canvasRef.current.toDataURL("image/png"));
    }
  };
  const resetSnapshot = () => setSnapshotURL(null);

  // Image Upload & Processing
  const [image, setImage] = useState<File | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [recognizedText, setRecognizedText] = useState<string>("");
  const [translatedText, setTranslatedText] = useState<string>("");

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setImage(e.target.files[0]);
  };

  const handleSubmit = async () => {
    if (!image) return;
    const formData = new FormData();
    formData.append("image", image);

    try {
      const response = await axios.post(
        "https://collab-board-1-3hd3.onrender.com",
        formData,
        { responseType: "json" }
      );

      const { recognizedText, translatedText } = response.data;
      setRecognizedText(recognizedText);
      setTranslatedText(translatedText);
      console.log("Recognized:", recognizedText, "Translated:", translatedText);
    } catch (error) {
      console.error("Error processing image:", error);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <canvas
        ref={canvasRef}
        width={windowSize[0] > 600 ? 1200 : 900}
        height={windowSize[1] > 400 ? 1000 : 800}
        style={{ backgroundColor: "black" }}
        className="rounded-[4rem]"
      />
      <div className="flex flex-row items-center justify-center gap-3 mt-6">
        <button onClick={takeSnapshot} className="bg-green-600 rounded-lg py-2 px-3 text-white">
          Take Snapshot
        </button>
        {snapshotURL && (
          <a href={snapshotURL} download={`CanvasSnapshot_${CollabID}`} className="bg-green-600 rounded-lg py-2 px-3 text-white">
            Download Snapshot
          </a>
        )}
      </div>

      {/* Image Upload & Processing */}
      <div className="mt-6 flex flex-col items-center">
        <input type="file" onChange={handleImageChange} className="mb-4" />
        <button onClick={handleSubmit} className="bg-blue-600 rounded-lg py-2 px-3 text-white">
          Process Image
        </button>
      </div>

      {processedImage && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold">Processed Image:</h3>
          <img src={processedImage} alt="Processed" className="rounded-lg mt-2" />
        </div>
      )}

      {recognizedText && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold">Recognized Text:</h3>
          <p className="bg-gray-200 p-2 rounded">{recognizedText}</p>
        </div>
      )}

      {translatedText && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold">Translated Text:</h3>
          <p className="bg-gray-200 p-2 rounded">{translatedText}</p>
        </div>
      )}
    </div>
  );
};

export default Board;
