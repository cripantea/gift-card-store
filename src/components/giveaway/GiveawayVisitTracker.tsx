"use client";

import { useEffect } from "react";
import { trackGiveawayVisit } from "@/app/give-away/actions";

const VISITOR_KEY = "mad_giveaway_visitor";

/**
 * Conta un'apertura di /give-away. Gira nel browser, quindi le anteprime che
 * WhatsApp genera da solo non vengono contate. L'id casuale serve solo a
 * contare i visitatori unici: non dice chi è la persona.
 */
export function GiveawayVisitTracker() {
  useEffect(() => {
    let visitorId = "";
    try {
      visitorId = localStorage.getItem(VISITOR_KEY) ?? "";
      if (!visitorId) {
        visitorId = crypto.randomUUID();
        localStorage.setItem(VISITOR_KEY, visitorId);
      }
    } catch {
      visitorId = "";
    }
    trackGiveawayVisit(visitorId).catch(console.error);
  }, []);

  return null;
}
