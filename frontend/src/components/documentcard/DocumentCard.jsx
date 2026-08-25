import { useState } from "react";
import { FileText, Eye, X } from "lucide-react";
import "./DocumentCard.css";

export default function DocumentCard({ document }) {
  const [previewOpen, setPreviewOpen] = useState(false);

  const isLocalUrl = /^https?:\/\/(localhost|127\.0\.0\.1)/i.test(
    document.url || ""
  );

  const previewSrc = isLocalUrl
    ? document.url
    : `https://docs.google.com/viewer?url=${encodeURIComponent(
        document.url
      )}&embedded=true`;

  return (
    <>
      <div className="document-card">
        <FileText size={26} className="document-icon" />

        <div className="document-info">
          <span className="document-name">{document.name}</span>
          <span className="document-meta">PDF</span>
        </div>

        <div className="document-actions">
          <button
            type="button"
            className="doc-action-btn"
            onClick={() => setPreviewOpen(true)}
          >
            <Eye size={14} />
            View
          </button>
        </div>
      </div>

      {previewOpen && (
        <div
          className="doc-preview-overlay"
          onClick={() => setPreviewOpen(false)}
        >
          <div
            className="doc-preview-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="doc-preview-header">
              <span className="doc-preview-title">
                {document.name}
              </span>

              <button
                type="button"
                className="doc-preview-close"
                onClick={() => setPreviewOpen(false)}
                aria-label="Close document preview"
              >
                <X size={18} />
              </button>
            </div>

            {isLocalUrl && (
              <div className="doc-preview-warning">
                Previewing a local file. Inline preview may not render for
                localhost URLs.
              </div>
            )}

            <iframe
              src={previewSrc}
              title={document.name}
              className="doc-preview-frame"
            />
          </div>
        </div>
      )}
    </>
  );
}