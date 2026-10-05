"use client";

import { useEffect } from "react";
import { trackGiveawayVisit } from "@/app/give-away/actions";

const VISITOR_KEY = "mad_giveaway_visitor";
/** Attesa massima della scelta sui cookie già salvata (public/mad-consent.js). */
const CONSENT_WAIT_MS = 2500;

interface ConsentDetail {
  statistics?: boolean;
}

interface MadConsentApi {
  get: () => ConsentDetail | null;
}

declare global {
  interface Window {
    madConsent?: MadConsentApi;
  }
}

function statisticsAllowed(detail: ConsentDetail | null | undefined): boolean {
  return detail?.statistics === true;
}

function visitorIdIfAllowed(allowed: boolean): string {
  try {
    if (!allowed) {
      localStorage.removeItem(VISITOR_KEY);
      return "";
    }
    let visitorId = localStorage.getItem(VISITOR_KEY) ?? "";
    if (!visitorId) {
      visitorId = crypto.randomUUID();
      localStorage.setItem(VISITOR_KEY, visitorId);
    }
    return visitorId;
  } catch {
    return "";
  }
}

/**
 * Conta un'apertura di /give-away. Gira nel browser, quindi le anteprime che
 * WhatsApp genera da solo non vengono contate. Il totale delle aperture è
 * sempre anonimo; l'id casuale per contare i visitatori unici viene salvato
 * solo con il consenso ai cookie statistici e cancellato se lo si revoca.
 */
export function GiveawayVisitTracker() {
  useEffect(() => {
    let tracked = false;
    const track = (allowed: boolean) => {
      if (tracked) return;
      tracked = true;
      trackGiveawayVisit(visitorIdIfAllowed(allowed)).catch(console.error);
    };

    const onConsent = (event: Event) => {
      const allowed = statisticsAllowed((event as CustomEvent<ConsentDetail>).detail);
      if (tracked) visitorIdIfAllowed(allowed);
      else track(allowed);
    };
    window.addEventListener("mad:consent", onConsent);

    if (window.madConsent) track(statisticsAllowed(window.madConsent.get()));
    const timer = window.setTimeout(() => track(false), CONSENT_WAIT_MS);

    return () => {
      window.removeEventListener("mad:consent", onConsent);
      window.clearTimeout(timer);
    };
  }, []);

  return null;
}
