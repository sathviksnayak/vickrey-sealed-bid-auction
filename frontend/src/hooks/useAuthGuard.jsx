import { checkAuthenticated } from "../services/authservice";
import SignInModal from "../components/signinmodal/signinmodal";
import { useWallet } from "../context/WalletContext";

import { useState, useRef } from "react";

export function useAuthGuard() {
  const [show, setShow] = useState(false);
  const { connectWallet, authenticated } = useWallet();

  const resolver = useRef(null);
  async function ensureAuthenticated() {
    const verified = await checkAuthenticated();

    if (verified) {
      return true;
    }
    setShow(true);
    return new Promise((resolve) => {
      resolver.current = resolve;
    });
  }
  async function authenticate() {
    const ok = await connectWallet();

    setShow(false);

    resolver.current?.(ok);
    resolver.current = null;
  }

  function close() {
    setShow(false);
    resolver.current?.(false);
  }

  const modal = (
    <SignInModal open={show} onClose={close} onAuthenticate={authenticate} />
  );

  return {
    ensureAuthenticated,
    modal,
  };
}
