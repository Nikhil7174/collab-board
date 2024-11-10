//@ts-nocheck
import React from "react";
import "./Home.css";
import { Helmet } from "react-helmet";

const Home = () => {
  return (
    <div className="bg-gradient-to-r from-indigo-900 to bg-gray-900">
      <Helmet>
        <meta
          name="google-site-verification"
          content="LTEslH9dKKs5wwLu8JhLPM4jiI1qE-M05wJUK2eKZnU"
        />
      </Helmet>
      <h1 className="Heading text-blue text-center">
        COLLABORATIVE WHITEBOARD
      </h1>
      <div className="justify-center items-center flex my-auto min-h-[100vh]">
        <a href="/board" target="_blank" style={{ textDecoration: "none" }}>
          <button className="px-8 py-4 rounded-[20px] bg-cyan-600 text-black font-semibold text-[30px]">
            Start Board
          </button>
        </a>
      </div>
    </div>
  );
};

export default Home;
