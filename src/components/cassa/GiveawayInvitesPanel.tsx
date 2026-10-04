"use client";

import { useState, useTransition } from "react";
import { Check, Copy, MessageCircle, Trash2, UserPlus } from "lucide-react";
import {
  createGiveawayInvites,
  deleteGiveawayInvite,
  type AdminGiveawayEntry,
  type AdminGiveawayInvite,
} from "@/app/cassa/giveawayActions";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://shop.madvigevano.it";
const dateTime = new Intl.DateTimeFormat("it-IT", { dateStyle: "short", timeStyle: "short" });

export function inviteLink(code: string): string {
  return `${BASE_URL}/give-away?id=${code}`;
}

function whatsappUrl(invite: AdminGiveawayInvite): string | null {
  if (!invite.phone) return null;
  const firstName = invite.name.split(/\s+/)[0];
  const text =
    `Ciao ${firstName}! Questa volta abbiamo pensato a te: in occasione del lancio della nuova Gift Card ` +
    `abbiamo riservato una Gift Card da 50 € proprio per te 🎁\n${inviteLink(invite.code)}`;
  return `https://wa.me/${invite.phone.replace(/\D/g, "")}?text=${encodeURIComponent(text)}`;
}

export function GiveawayInvitesPanel({
  invites,
  entries,
  onChanged,
}: {
  invites: AdminGiveawayInvite[];
  entries: AdminGiveawayEntry[];
  onChanged: () => void;
}) {
  const [text, setText] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const entriesById = new Map(entries.map((e) => [e.id, e]));
  const clicked = invites.filter((i) => i.clickCount > 0).length;
  const answered = invites.filter((i) => i.entryIds.length > 0).length;

  function handleCreate() {
    if (!text.trim()) return;
    startTransition(async () => {
      const result = await createGiveawayInvites(text);
      if (result.status === "unauthorized") {
        setMessage("Sessione scaduta: ricarica la pagina.");
        return;
      }
      setMessage(
        `${result.created} link creati.` +
          (result.skipped.length ? ` Righe non valide (controlla il telefono): ${result.skipped.join(" · ")}` : ""),
      );
      setText(result.skipped.join("\n"));
      onChanged();
    });
  }

  function handleDelete(invite: AdminGiveawayInvite) {
    if (!window.confirm(`Eliminare il link di ${invite.name}? Le risposte già arrivate restano.`)) return;
    startTransition(async () => {
      await deleteGiveawayInvite(invite.id);
      onChanged();
    });
  }

  function handleCopy(invite: AdminGiveawayInvite) {
    navigator.clipboard
      .writeText(inviteLink(invite.code))
      .then(() => {
        setCopiedId(invite.id);
        setTimeout(() => setCopiedId(null), 2000);
      })
      .catch(console.error);
  }

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-line bg-paper p-4 sm:p-5">
      <div>
        <p className="text-sm font-semibold text-ink">Link personali WhatsApp</p>
        <p className="text-xs text-ink-soft">
          Ogni cliente riceve un link con il suo codice: qui vedi se l&apos;ha aperto e cosa ha risposto.
          {invites.length > 0 && ` ${invites.length} link · ${clicked} aperti · ${answered} compilati.`}
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={3}
          placeholder={"Un cliente per riga: Nome Cognome, telefono\nGiulia Rossi, 333 123 4567\nMarco Bianchi, +39 347 765 4321"}
          className="w-full resize-y rounded-xl border border-sand-dark bg-white px-4 py-3 font-mono text-xs text-ink outline-none placeholder:text-neutral-400 focus:border-gold focus:ring-1 focus:ring-gold/30"
        />
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[0.7rem] text-ink-soft">{message}</p>
          <button
            onClick={handleCreate}
            disabled={isPending || !text.trim()}
            className="flex shrink-0 items-center justify-center gap-1.5 rounded-full bg-ink px-4 py-2 text-xs font-medium text-paper hover:bg-ink/85 disabled:opacity-40"
          >
            <UserPlus className="h-3 w-3" />
            Crea link
          </button>
        </div>
      </div>

      {invites.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-line">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line bg-paper-muted/50">
                {["Cliente", "Link", "Click", "Risposta", ""].map((h) => (
                  <th key={h} className="px-3 py-2.5 text-left text-[0.65rem] font-medium uppercase tracking-[0.15em] text-ink-soft">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {invites.map((invite) => {
                const wa = whatsappUrl(invite);
                const answers = invite.entryIds.map((id) => entriesById.get(id)).filter((e) => e !== undefined);
                return (
                  <tr key={invite.id} className="bg-paper align-top">
                    <td className="px-3 py-3">
                      <p className="font-medium text-ink">{invite.name}</p>
                      <p className="text-xs text-ink-soft/70">{invite.phone ?? "senza telefono"}</p>
                    </td>
                    <td className="px-3 py-3">
                      <p className="font-mono text-xs tracking-wider text-ink-soft">{invite.code}</p>
                      <div className="mt-1.5 flex gap-1.5">
                        <button
                          onClick={() => handleCopy(invite)}
                          className="flex items-center gap-1 rounded-full border border-line px-2.5 py-1 text-[0.65rem] font-medium text-ink-soft hover:border-gold-soft hover:text-ink"
                        >
                          {copiedId === invite.id ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                          {copiedId === invite.id ? "Copiato" : "Copia"}
                        </button>
                        {wa && (
                          <a
                            href={wa}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 rounded-full bg-emerald-600 px-2.5 py-1 text-[0.65rem] font-medium text-white hover:bg-emerald-700"
                          >
                            <MessageCircle className="h-3 w-3" />
                            WhatsApp
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-xs text-ink-soft">
                      {invite.clickCount === 0 ? (
                        <span className="text-ink-soft/60">Non ancora aperto</span>
                      ) : (
                        <>
                          <p className="font-semibold text-ink">{invite.clickCount} {invite.clickCount === 1 ? "apertura" : "aperture"}</p>
                          <p>Prima: {dateTime.format(new Date(invite.firstClickedAt!))}</p>
                          {invite.lastClickedAt !== invite.firstClickedAt && (
                            <p>Ultima: {dateTime.format(new Date(invite.lastClickedAt!))}</p>
                          )}
                        </>
                      )}
                    </td>
                    <td className="min-w-[14rem] px-3 py-3 text-xs">
                      {answers.length === 0 ? (
                        <span className="text-ink-soft/60">Non ancora compilato</span>
                      ) : (
                        answers.map((e) => (
                          <div key={e.id} className="mb-1 last:mb-0">
                            <p className="font-medium text-emerald-700">
                              ✓ {e.firstName} {e.lastName} · {dateTime.format(new Date(e.createdAt))}
                            </p>
                            <p className="text-ink-soft">
                              {e.source === "Altro" && e.sourceOther ? `Altro: ${e.sourceOther}` : e.source} · ci conosce da {e.knownSince.toLowerCase()}
                            </p>
                          </div>
                        ))
                      )}
                    </td>
                    <td className="px-3 py-3 text-right">
                      <button
                        onClick={() => handleDelete(invite)}
                        title="Elimina link"
                        className="rounded-full p-1.5 text-ink-soft/60 hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
