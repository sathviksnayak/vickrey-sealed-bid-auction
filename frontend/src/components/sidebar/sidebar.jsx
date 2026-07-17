import { NavLink } from "react-router-dom";
import { House, Plus, Package, FileText, User } from "lucide-react";
import "./sidebar.css";

const links = [
    { to: "/", label: "Browse", icon: House, end: true },
    { to: "/create", label: "Create Auction", icon: Plus },
    { to: "/my-auctions", label: "My Auctions", icon: Package },
    { to: "/my-bids", label: "My Bids", icon: FileText },
    { to: "/profile", label: "Profile", icon: User },
];

export default function Sidebar({ open }) {
    return (
        <aside className={`sidebar ${open ? "" : "sidebar-collapsed"}`}>
            <nav className="sidebar-links">
                {links.map(({ to, label, icon: Icon, end }) => (
                    <NavLink
                        key={to}
                        to={to}
                        end={end}
                        className={({ isActive }) =>
                            `sidebar-link ${isActive ? "active" : ""}`
                        }
                    >
                        <Icon size={18} className="sidebar-icon" />
                        {open && <span>{label}</span>}
                    </NavLink>
                ))}
            </nav>
        </aside>
    );
}