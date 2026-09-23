import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import Nav from "./Nav";
import Footer from "./Footer";
import { initSmoothScroll } from "../lib/lenis";

export default function Layout() {
  // Mounted once for the life of the app (nested routes keep Layout mounted across navigation;
  // only <Outlet />'s content swaps) — the single Lenis instance the whole site scrolls through.
  useEffect(() => initSmoothScroll(), []);

  return (
    <div>
      <Nav />
      <Outlet />
      <Footer />
    </div>
  );
}
