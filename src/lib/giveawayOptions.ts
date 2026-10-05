// Opzioni del form Give Away: file senza dipendenze server, importabile dal client.

/** Testo esatto del consenso marketing: mostrato nel form e salvato con la risposta. */
export const GIVEAWAY_MARKETING_CONSENT_TEXT =
  "Acconsento a ricevere offerte riservate, novità e promozioni da MAD for Hair (MAD S.r.l.s.) via WhatsApp. Posso revocare il consenso in qualsiasi momento rispondendo STOP.";

/** Età minima per partecipare (regolamento del Give Away). */
export const GIVEAWAY_MIN_AGE = 18;

export const GIVEAWAY_THANK_YOU = "Grazie della tua fiducia — questo è il nostro regalo per te";

export const GIVEAWAY_SOURCES = [
  "Passaparola di amici o parenti",
  "Instagram",
  "Facebook",
  "Google",
  "Passando davanti al salone",
  "Altro",
] as const;

export const GIVEAWAY_KNOWN_SINCE = [
  "Meno di 1 anno",
  "1-2 anni",
  "2-5 anni",
  "Più di 5 anni",
] as const;

/** Servizi reali MAD Vigevano (da listino-prezzi) per "trattamenti preferiti". */
export const SERVIZI_GRUPPI: { label: string; items: string[] }[] = [
  {
    label: "Taglio",
    items: ["Taglio donna", "Taglio uomo"],
  },
  {
    label: "Piega & Styling",
    items: ["Piega capelli corti", "Piega capelli lunghi", "Styling"],
  },
  {
    label: "Colorazioni",
    items: [
      "Colore organica",
      "Colore organica + lunghezze",
      "Gloss color",
      "Decolorazione",
    ],
  },
  {
    label: "Schiariture",
    items: ["Balayage", "Bleach No Bleach", "Airtouch / Hair Touch"],
  },
  {
    label: "Trattamenti",
    items: [
      "Ristrutturazione profonda",
      "Hair Filler",
      "Detox",
      "Ossigenoterapia",
      "Ozonoterapia",
      "OXY Hair Spa",
      "Nanoplastia",
      "Permanente",
    ],
  },
  {
    label: "Eventi & Shooting",
    items: [
      "Preparazione sposa",
      "Preparazione shooting",
      "Hair Styling & Art Direction",
      "Fashion Show & Events",
    ],
  },
];

export const GIVEAWAY_SERVICES: readonly string[] = SERVIZI_GRUPPI.flatMap((g) => g.items);
