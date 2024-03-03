import React, { useRef, useEffect, useState } from "react";
import io from "socket.io-client";
import { v4 as uuidv4 } from "uuid"; // Import uuid library
import axios from "axios";

interface MyBoard {
  brushColor: string;
  brushSize: number;
  handleUuid: Function;
}

const Board: React.FC<MyBoard> = (props) => {
  const { brushColor, brushSize, handleUuid } = props;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [CollabID, setCollabID] = useState(null);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // const newSocket = io("http://localhost:5000");

    // Generate a unique room ID
    // const roomID = uuidv4();
    const urlParams = new URLSearchParams(window.location.search);
    const roomID = urlParams.get("roomID") || uuidv4(); // Use the provided roomID or generate a new one
    setCollabID(roomID);
    // Connect to the socket with the room ID as a query parameter
    const newSocket = io("http://localhost:5000", {
      query: { roomID },
    });
    console.log(newSocket, "Connected to socket", " room uuid ", roomID);
    setSocket(newSocket);
    handleUuid(roomID);
  }, []);

  useEffect(() => {
    if (socket) {
      // Event listener for receiving canvas data from the socket
      socket.on("canvasImage", (data) => {
        // Create an image object from the data URL
        const image = new Image();
        image.src = data;

        const canvas = canvasRef.current;
        // eslint-disable-next-line react-hooks/exhaustive-deps
        const ctx = canvas.getContext("2d");
        // Draw the image onto the canvas
        image.onload = () => {
          ctx.drawImage(image, 0, 0);
        };
      });
    }
  }, [socket]);

  // Function to start drawing
  useEffect(() => {
    // Variables to store drawing state
    let isDrawing = false;
    let lastX = 0;
    let lastY = 0;
    const startDrawing = (e: { offsetX: number; offsetY: number }) => {
      isDrawing = true;

      console.log(`drawing started`, brushColor, brushSize);
      [lastX, lastY] = [e.offsetX, e.offsetY];
    };

    // Function to draw
    const draw = (e: { offsetX: number; offsetY: number }) => {
      if (!isDrawing) return;

      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(e.offsetX, e.offsetY);
        ctx.stroke();
      }

      [lastX, lastY] = [e.offsetX, e.offsetY];
    };

    // Function to end drawing
    const endDrawing = () => {
      const canvas = canvasRef.current;
      const dataURL = canvas.toDataURL(); // Get the data URL of the canvas content

      // Send the dataURL or image data to the socket
      // console.log('drawing ended')
      if (socket) {
        socket.emit("canvasImage", dataURL);
        console.log("drawing ended");
      }
      isDrawing = false;
    };

    const canvas: HTMLCanvasElement | null = canvasRef.current;
    const ctx = canvasRef.current?.getContext("2d");

    // Set initial drawing styles
    if (ctx) {
      ctx.strokeStyle = brushColor;
      ctx.lineWidth = brushSize;

      ctx.lineCap = "round";
      ctx.lineJoin = "round";
    }
    // Event listeners for drawing
    canvas.addEventListener("mousedown", startDrawing);
    canvas.addEventListener("mousemove", draw);
    canvas.addEventListener("mouseup", endDrawing);
    canvas.addEventListener("mouseout", endDrawing);

    return () => {
      // Clean up event listeners when component unmounts
      canvas.removeEventListener("mousedown", startDrawing);
      canvas.removeEventListener("mousemove", draw);
      canvas.removeEventListener("mouseup", endDrawing);
      canvas.removeEventListener("mouseout", endDrawing);
    };
  }, [brushColor, brushSize, socket]);

  const [windowSize, setWindowSize] = useState([
    window.innerWidth,
    window.innerHeight,
  ]);

  useEffect(() => {
    const handleWindowResize = () => {
      setWindowSize([window.innerWidth, window.innerHeight]);
    };

    window.addEventListener("resize", handleWindowResize);

    return () => {
      window.removeEventListener("resize", handleWindowResize);
    };
  }, []);

  const canvasRefer = useRef(null);
  const windowSizeCurr = [window.innerWidth, window.innerHeight];
  const [snapshotURL, setSnapshotURL] = useState(null);

  // Function to capture the canvas content
  const takeSnapshot = () => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const image = new Image();
      image.src = canvas.toDataURL("image/png");

      // Set the URL of the snapshot image
      setSnapshotURL(image.src);
      console.log(image.src);
    } else {
      console.error("Canvas reference is not yet available.");
    }
  };
  // Function to reset the snapshot URL
  const resetSnapshot = () => {
    setSnapshotURL(null);
  };

  const [image, setImage] = useState(null);
  const [processedImage, setProcessedImage] = useState(null);
  const [recognizedText, setRecognizedText] = useState("");
  const [translatedText, setTranslatedText] = useState("");

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleSubmit = async () => {
    const formData = new FormData();
    formData.append("image", image);
    console.log(image);

    try {
      const response = await axios.post(
        "http://localhost:5001/recognize_text",
        formData,
        {
          responseType: "arraybuffer",
        }
      );

      // Set processed image
      const processedImageBlob = new Blob([response.data], {
        type: "image/png",
      });
      const processedImageUrl = URL.createObjectURL(processedImageBlob);
      setProcessedImage(processedImageUrl);
      const responseData = await response.json();
      console.log(responseData.recognizedText);
      console.log(responseData.recognizedText);
      setRecognizedText(responseData.recognizedText);
      setTranslatedText(responseData.translatedText);
    } catch (error) {
      console.error("Er ror:", error);
    }
  };

  return (
    <>
      <canvas
        ref={canvasRef}
        width={windowSize[0] > 600 ? 1200 : 900}
        height={windowSize[1] > 400 ? 1000 : 800}
        style={{ backgroundColor: "blue" }}
      />
      <div className="flex items-center justify-center gap-3">
        <button
          onClick={takeSnapshot}
          className="bg-green-600 py-2 px-3 text-white mt-4"
        >
          Take Snapshot
        </button>
        {snapshotURL && (
          <div>
            <a
              className="bg-green-600 py-2 px-3 text-white"
              href={snapshotURL}
              download={`CanvasSnapshot${CollabID}`}
            >
              Download Snapshot
            </a>
          </div>
        )}
        <div>
          <input type="file" onChange={handleImageChange} />
          <button className="bg-orange-400" onClick={handleSubmit}>
            Process Image
          </button>
          {processedImage && <img src={processedImage} alt="Processed Image" />}
          {recognizedText && (
            <div>
              <h2>Recognized Text:</h2>
              <p>{recognizedText}</p>
            </div>
          )}
          {translatedText && (
            <div>
              <h2>Translated Text:</h2>
              <p>{translatedText}</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Board;
