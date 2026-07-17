import { checkAuthenticated } from "../services/authservice";
import SignInModal from "../components/signinmodal/signinmodal";
import { useWallet } from "../context/WalletContext";

import { useState } from "react";

export function useAuthGuard() {
    const [show, setShow] = useState(false);
    const { connectWallet } = useWallet();

    async function ensureAuthenticated() {
        const verified = await checkAuthenticated();

        if (verified) return true;

        setShow(true);
        return false;
    }

    async function authenticate() {
        await connectWallet();
        setShow(false);
    }

    function close() {
        setShow(false);
    }

    const modal = (
        <SignInModal
            open={show}
            onClose={close}
            onAuthenticate={authenticate}
        />
    );

    return {
        ensureAuthenticated,
        modal,
    };
}