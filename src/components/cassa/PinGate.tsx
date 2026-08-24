"use client";

import { useActionState } from "react";
import { verifyCassaPin, type PinFormState } from "@/app/cassa/actions";

const INITIAL_STATE: PinFormState = {};

export function PinGate() {
  const [state, action, pending] = useActionState(verifyCassaPin, INITIAL_STATE);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-paper px-6 py-16">
      <div className="w-full max-w-sm rounded-3xl border border-line bg-paper-muted/60 p-8 text-center shadow-xl shadow-ink/5">
        <p className="text-[0.65rem] font-medium uppercase tracking-[0.2em] text-gold">
          Area riservata
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-ink">
          Cassa MAD Vigevano
        </h1>
        <p className="mt-2 text-sm text-ink-soft">
          Inserisci il PIN per accedere al portale di riscatto delle Gift Card.
        </p>

        <form action={action} className="mt-8 flex flex-col gap-4">
          <input
            type="password"
            name="pin"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={4}
            autoFocus
            required
            placeholder="••••"
            className="w-full rounded-xl border border-line bg-paper px-4 py-4 text-center text-3xl tracking-[0.5em] text-ink outline-none focus:border-gold"
          />

          {state.error && (
            <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {state.error}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="rounded-full bg-ink px-6 py-3 text-base font-medium text-paper transition-colors hover:bg-ink-soft disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pending ? "Verifica…" : "Accedi"}
          </button>
        </form>
      </div>
    </div>
  );
}
