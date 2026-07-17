import { Info } from "lucide-react";
import { useState } from "react";
import "./Tooltip.css";

export default function Tooltip({ text }) {
    const [visible, setVisible] = useState(false);

    return (
        <span
            className="tooltip-wrapper"
            onMouseEnter={() => setVisible(true)}
            onMouseLeave={() => setVisible(false)}
        >
            <Info size={14} className="tooltip-icon" />
            {visible && <span className="tooltip-box">{text}</span>}
        </span>
    );
}