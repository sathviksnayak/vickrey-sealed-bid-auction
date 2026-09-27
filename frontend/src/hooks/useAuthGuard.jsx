import { checkAuthenticated } from "../services/authservice";
import SignInModal from "../components/signinmodal/signinmodal";
import { useWallet } from "../context/WalletContext";

import { useState, useRef } from "react";

export function useAuthGuard() {
  const [show, setShow] = useState(false);
  const { connectWallet } = useWallet();

  const resolver = useRef(null);
  const pendingRequest = useRef(null);

  function resolvePendingAuth(result) {
    if (resolver.current) {
      resolver.current(result);
      resolver.current = null;
    }

    pendingRequest.current = null;
    setShow(false);
  }

  async function ensureAuthenticated() {
    const verified = await checkAuthenticated();

    if (verified) {
      return true;
    }

    if (pendingRequest.current) {
      return pendingRequest.current;
    }

    console.log("[AUTH] modal opened");
    setShow(true);

    pendingRequest.current = new Promise((resolve) => {
      resolver.current = resolve;
    });

    return pendingRequest.current;
  }

  async function authenticate() {
    if (pendingRequest.current && resolver.current) {
      const ok = await connectWallet();
      resolvePendingAuth(ok);
      return ok;
    }

    const ok = await connectWallet();
    if (resolver.current) {
      resolvePendingAuth(ok);
    } else {
      setShow(false);
    }

    return ok;
  }

  function close() {
    if (pendingRequest.current || resolver.current) {
      resolvePendingAuth(false);
      return;
    }

    setShow(false);
  }

  const modal = (
    <SignInModal open={show} onClose={close} onAuthenticate={authenticate} />
  );

  return {
    ensureAuthenticated,
    modal,
  };
}
