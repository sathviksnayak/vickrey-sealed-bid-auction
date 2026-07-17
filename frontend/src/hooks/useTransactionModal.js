import { useState } from "react";

import { parseBlockchainError } from "../utils/parseBlockchainError";
export function useTransactionModal() {
    const [status, setStatus] = useState(null); // null | "in-progress" | "success" | "error"
    const [step, setStep] = useState(null);
    const [error, setError] = useState("");

    function start(firstStep) {
        setStatus("in-progress");
        setStep(firstStep);
        setError("");
    }

    function goTo(stepKey) {
        setStep(stepKey);
    }

    function succeed(finalStep = "complete") {
        setStep(finalStep);
        setStatus("success");
    }

function fail(err) {
    setStatus("error");
    setError(parseBlockchainError(err));
}

    function close() {
        setStatus(null);
        setStep(null);
        setError("");
    }

    return { status, step, error, start, goTo, succeed, fail, close };
}