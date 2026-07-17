import { FileText, Eye, Download } from "lucide-react";
import "./DocumentCard.css";

export default function DocumentCard({ document }) {
    return (
        <div className="document-card">
            <FileText size={26} className="document-icon" />

            <div className="document-info">
                <span className="document-name">{document.name}</span>
                <span className="document-meta">PDF</span>
            </div>

            <div className="document-actions">
                <a href={document.url} target="_blank" rel="noreferrer" className="doc-action-btn">
                    <Eye size={14} /> View
                </a>
                <a href={document.url} download target="_blank" rel="noreferrer" className="doc-action-btn">
                    <Download size={14} /> Download
                </a>
            </div>
        </div>
    );
}