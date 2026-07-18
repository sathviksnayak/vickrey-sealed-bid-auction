import {
  Check,
  Loader2,
  Wallet,
  PenSquare,
  Blocks,
  Database,
  CircleCheckBig,
  CircleX,
} from "lucide-react";
import "./TransactionModal.css";

const DEFAULT_SUCCESS = "Completed Successfully";

const STEP_ICONS = {
  connecting: Wallet,
  signature: PenSquare,
  pending: Blocks,
  saving: Database,
  complete: CircleCheckBig,
};

export default function TransactionModal({
  status, // null | "in-progress" | "success" | "error"
  title,
  steps,
  currentStep,
  successMessage,
  errorMessage,
  onClose,
}) {
  if (!status) return null;

  const currentIndex = steps.findIndex((step) => step.key === currentStep);

  return (
    <div className="tx-modal-overlay">
      <div className="tx-modal">
        {status === "success" ? (
          <div className="tx-result success">
            <CircleCheckBig size={56} className="tx-result-icon success" />

            <h3>{successMessage || DEFAULT_SUCCESS}</h3>

            <button className="tx-modal-close" onClick={onClose}>
              Close
            </button>
          </div>
        ) : status === "error" ? (
          <div className="tx-result error">
            <CircleX size={56} className="tx-result-icon error" />

            <h3>{errorMessage || "Something went wrong"}</h3>

            <button className="tx-modal-close" onClick={onClose}>
              Close
            </button>
          </div>
        ) : (
          <>
            <h3 className="tx-modal-title">{title}</h3>

            <div className="tx-steps">
              {steps.map((step, index) => {
                let state;

                if (index < currentIndex) {
                  state = "done";
                } else if (index === currentIndex) {
                  state = "active";
                } else {
                  state = "pending";
                }

                const Icon = STEP_ICONS[step.key];

                return (
                  <div key={step.key} className={`tx-step ${state}`}>
                    <span className="tx-step-icon">
                      {state === "done" ? (
                        <Check size={18} />
                      ) : state === "active" ? (
                        <Loader2 size={18} className="tx-spin" />
                      ) : (
                        <Icon size={18} />
                      )}
                    </span>

                    <span className="tx-step-label">{step.label}</span>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
