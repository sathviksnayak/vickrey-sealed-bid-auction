import { useState } from "react";
import Topbar from "../topbar/topbar";
import Sidebar from "../sidebar/sidebar";
import "./layout.css";

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="layout">
      <Topbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="layout-body">
        <Sidebar open={sidebarOpen} />
        <main className="layout-content">{children}</main>
      </div>
    </div>
  );
}
