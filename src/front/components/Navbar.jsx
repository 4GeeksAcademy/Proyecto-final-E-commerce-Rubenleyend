import React from "react";
import { Link } from "react-router-dom";

const Navbar = () => (
  <nav>
    <Link to="/">Home</Link> | <Link to="/demo">Demo</Link> | <Link to="/login">Login</Link>
  </nav>
);

export default Navbar;
