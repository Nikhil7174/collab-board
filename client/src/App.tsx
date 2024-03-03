//@ts-nocheck
import  { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Board from "./pages/Board";
import Home from "./pages/Home";

function App() {
  // const user = JSON.parse(localStorage.getItem("profile"));
  return (
    <>
      <BrowserRouter>
        {/* <Navbar /> */}
        <Routes>
          <Route exact path="/" element={<Home />} />
          <Route exact path="/board" element={<Board />} />
          {/* <Route exact path="/posts/:id" element={<PostDetails />} /> */}
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
