import { z } from "zod";

export const cassaPinSchema = z.string().trim().regex(/^\d{4}$/);

export const cardCodeSchema = z
  .string()
  .regex(/^([A-Z0-9]{4}-){3}[A-Z0-9]{4}$/, "Codice non valido");
