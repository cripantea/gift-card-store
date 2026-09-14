"use client";

import { useEffect, useMemo, useState } from "react";

const FUSIONWA_SCRIPT_ID = "fusionwa-sdk";
const FUSIONWA_SCRIPT_SRC = "https://wa.fusionsoft.it/sdk/v1.js";
const FUSIONWA_API_KEY =
  process.env.NEXT_PUBLIC_FUSIONWA_API_KEY ?? "fwa_live_j3o8SrYeEzvK2to-k17OGwhh";
const FUSIONWA_CUSTOMER_ID =
  process.env.NEXT_PUBLIC_FUSIONWA_CUSTOMER_ID ?? "mad-vigevano-gift-card-store";

let fusionWALoadPromise: Promise<void> | null = null;

declare global {
  interface Window {
    FusionWA?: {
      init: (options: {
        apiKey: string;
        customerId: string;
        containerId: string;
      }) => void;
    };
  }
}

export function FusionWAWidget() {
  const [failed, setFailed] = useState(false);
  const containerId = useMemo(() => "fusionwa-widget", []);

  useEffect(() => {
    let isMounted = true;

    loadFusionWASdk()
      .then(() => {
        if (!isMounted || !window.FusionWA) return;

        window.FusionWA.init({
          apiKey: FUSIONWA_API_KEY,
          customerId: FUSIONWA_CUSTOMER_ID,
          containerId,
        });
      })
      .catch((error) => {
        console.error("Caricamento FusionWA fallito", error);
        if (isMounted) {
          setFailed(true);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [containerId]);

  return (
    <div className="mt-2">
      <div id={containerId} />
      {failed && (
        <p className="text-xs text-red-600">
          Pulsante WhatsApp non disponibile.
        </p>
      )}
    </div>
  );
}

function loadFusionWASdk(): Promise<void> {
  if (window.FusionWA) {
    return Promise.resolve();
  }

  if (fusionWALoadPromise) {
    return fusionWALoadPromise;
  }

  fusionWALoadPromise = new Promise((resolve, reject) => {
    const existingScript = document.getElementById(FUSIONWA_SCRIPT_ID) as
      | HTMLScriptElement
      | null;

    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(), { once: true });
      existingScript.addEventListener("error", reject, { once: true });
      return;
    }

    const script = document.createElement("script");
    script.id = FUSIONWA_SCRIPT_ID;
    script.src = FUSIONWA_SCRIPT_SRC;
    script.async = true;
    script.addEventListener("load", () => resolve(), { once: true });
    script.addEventListener("error", reject, { once: true });
    document.body.appendChild(script);
  });

  return fusionWALoadPromise;
}
