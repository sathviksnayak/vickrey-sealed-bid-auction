import { useState, useEffect } from "react";

import { useWallet } from "../../context/WalletContext";
import { getUser, updateUser } from "../../services/userService";

export default function Profile() {

    const { account } = useWallet();

    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {

        if (!account) return;

        async function loadProfile() {

            try {

                setLoading(true);

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

            setLoading(true);

            await updateUser(account, {
                username,
                email
            });

            alert("Profile updated successfully!");

        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }

    }

    if (!account) {
        return <h2>Connect your wallet.</h2>;
    }

    if (loading) {
        return <h2>Loading profile...</h2>;
    }

    return (
        <div>

            <h1>Profile</h1>

            <label>Wallet Address</label>
            <input
                type="text"
                value={account}
                readOnly
            />

            <label>Username</label>
            <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
            />

            <label>Email</label>
            <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />

            <button onClick={saveData}>
                Save Profile
            </button>

        </div>
    );
}