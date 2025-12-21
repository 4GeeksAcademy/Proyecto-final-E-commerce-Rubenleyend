import React from "react";
import { createBrowserRouter, createRoutesFromElements, Route } from "react-router-dom";

import Layout from "./pages/Layout";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Demo from "./pages/Demo";
import Single from "./pages/Single";

export const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<Layout />} errorElement={<h1>Not found</h1>}>
      <Route index element={<Home />} />
      <Route path="login" element={<Login />} />
      <Route path="demo" element={<Demo />} />
      <Route path="single/:theId" element={<Single />} />
    </Route>
  )
);
