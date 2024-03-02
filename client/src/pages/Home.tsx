import React from "react";
import "./Home.css";

const Home = () => {
  return (
    <div className="DottedBg">
      <h1 className="Heading text-blue text-center">
        COLLABORATIVE WHITEBOARD
      </h1>
      <div className="justify-center items-center flex my-auto min-h-[100vh]">
        <a href="/board" target="_blank" style={{ textDecoration: "none" }}>
          <button className="px-8 py-4 rounded-[20px] bg-cyan-600 text-white font-semibold text-[30px]">
            Start Board
          </button>
        </a>
      </div>
    </div>
  );
};

export default Home;
