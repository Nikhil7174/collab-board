import React from "react";

const Home = () => {
  return (
    <div className="min-h-[100vh]">
      <div className="justify-center items-center flex my-auto min-h-[100vh]">
        <a href="/board" target="_blank" style={{ textDecoration: "none" }}>
          <button className="px-3 py-2 bg-orange-500 text-white">
            Start Board
          </button>
        </a>
      </div>
    </div>
  );
};

export default Home;
