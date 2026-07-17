import "./signinmodal.css";

export default function SignInModal({
    open,
    onClose,
    onAuthenticate,
}) {
    if (!open) return null;

    return (
        <div className="signin-overlay">
            <div className="signin-card">

                <h2>Session Expired</h2>

                <p className="signin-text">
                    Your authentication session has expired.
                    Re-authenticate with your wallet to continue.
                </p>

                <div className="signin-actions">
                    <button
                        className="signin-secondary"
                        onClick={onClose}
                    >
                        Cancel
                    </button>

                    <button
                        className="signin-primary"
                        onClick={onAuthenticate}
                    >
                        Authenticate
                    </button>
                </div>

            </div>
        </div>
    );
}