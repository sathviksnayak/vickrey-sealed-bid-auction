import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Copy, Check, RefreshCw, LogOut } from "lucide-react";

import { useWallet } from "../../context/WalletContext";
import { getUser, updateUser } from "../../services/userService";
import { useAuthGuard } from "../../hooks/useAuthGuard";
import "./profile.css";

export default function Profile() {
    const auth = useAuthGuard();
    const navigate = useNavigate();
    const { account, switchAccount, disconnectWallet ,provider} = useWallet();

    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [copied, setCopied] = useState(false);
    const [network,setnetwork]=useState("")

    useEffect(() => {

        if (!account) return;

        async function loadProfile() {

            try {
                if (!(await auth.ensureAuthenticated())) return;
                setLoading(true);
                const network=await provider.getNetwork()
                setnetwork(network.name);
                const user = await getUser(account);

                setUsername(user.username || "");
                setEmail(user.email || "");

            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }

        }

        loadProfile();

    }, [account]);

    async function saveData() {

        try {
            if (!(await auth.ensureAuthenticated())) return;

            setSaving(true);

            await updateUser({
                username,
                email
            });

        } catch (err) {
            console.error(err);
        } finally {
            setSaving(false);
        }

    }

    function handleCopy() {
        navigator.clipboard.writeText(account);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    }

    function handleDisconnect() {
        disconnectWallet();
        navigate("/");
    }

    if (!account) {
        return <><h2>Connect your wallet.</h2></>;
    }

    if (loading) {
        return <><h2>Loading profile...</h2>{auth.modal}</>;
    }

    return (
        <div className="profile-page">

            <div className="profile-header">
                <h1>Profile</h1>
                <p>Manage your account information and wallet settings.</p>
            </div>

            <div className="profile-card">
                <div className="profile-card-header">Account Information</div>

                <div className="profile-card-body">
                    <div className="field-group">
                        <label>Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Enter a username"
                        />
                    </div>

                    <div className="field-group">
                        <label>Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                        />
                    </div>

                    <div className="profile-card-footer">
                        <button
                            className="save-button"
                            onClick={saveData}
                            disabled={saving}
                        >
                            {saving ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </div>
            </div>

            <div className="profile-card">
                <div className="profile-card-header">Wallet Information</div>

                <div className="profile-card-body">
                    <div className="field-group">
                        <label>Wallet Address</label>
                        <div className="wallet-address-row">
                            <span>{account.slice(0, 6)}...{account.slice(-4)}</span>
                            <button className="copy-button" onClick={handleCopy}>
                                {copied ? <Check size={14} /> : <Copy size={14} />}
                                {copied ? "Copied" : "Copy"}
                            </button>
                        </div>
                    </div>

                    <div className="field-group">
                        <label>Network</label>
                        <span className="status-pill green">🟢 {network}</span>
                    </div>

                    <div className="field-group">
                        <label>Status</label>
                        <span className="status-pill green">🟢 Connected</span>
                    </div>

                    <div className="wallet-actions">
                        <button className="wallet-action-btn" onClick={switchAccount}>
                            <RefreshCw size={14} /> Switch Account
                        </button>
                        <button className="wallet-action-btn danger" onClick={handleDisconnect}>
                            <LogOut size={14} /> Disconnect
                        </button>
                    </div>
                </div>
            </div>

            {auth.modal}
        </div>
    );
}