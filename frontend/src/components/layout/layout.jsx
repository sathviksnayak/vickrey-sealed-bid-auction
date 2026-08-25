import { useState, useEffect } from "react";
import Topbar from "../topbar/topbar";
import Sidebar from "../sidebar/sidebar";
import "./layout.css";

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(
    typeof window !== "undefined" ? window.innerWidth > 768 : true
  );

  useEffect(() => {
    function handleResize() {
      // snap to a sane default when crossing the breakpoint
      setSidebarOpen(window.innerWidth > 768);
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="layout">
      <Topbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="layout-body">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="layout-content">{children}</main>
      </div>
    </div>
  );
}