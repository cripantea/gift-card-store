"use client";

import { motion, AnimatePresence } from "framer-motion";
import { CalendarClock, Gift, MessageSquareText, Phone, User } from "lucide-react";

export const CUSTOM_MESSAGE_MAX_LENGTH = 300;

export type GiftMode = "self" | "gift";
export type DeliveryTarget = "self" | "other";

// Set to true to re-enable the "Ricevi tu / Manda al destinatario" sub-toggle
const SHOW_DELIVERY_TARGET = false;

function slide(delay = 0) {
  return {
    initial: { opacity: 0, y: 14 },
    animate: { opacity: 1, y: 0 },
    exit:    { opacity: 0, y: -8 },
    transition: { duration: 0.35, ease: "easeOut" as const, delay },
  };
}

function TextField({
  id,
  label,
  type = "text",
  value,
  onChange,
  autoComplete,
  placeholder,
}: {
  id: string;
  label: string;
  type?: "text" | "tel";
  value: string;
  onChange: (v: string) => void;
  autoComplete?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-ink-soft">
        {label}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        required
        value={value}
        autoComplete={autoComplete}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-line bg-paper px-4 py-2.5 text-ink outline-none transition-colors placeholder:text-ink-soft/40 focus:border-gold"
      />
    </div>
  );
}

export interface BuyerFields {
  firstName: string;
  lastName: string;
  phone: string;
}

export interface RecipientFields {
  recipientFirstName: string;
  recipientLastName: string;
  recipientPhone: string;
}

interface GiftDetailsFormProps {
  giftMode: GiftMode;
  onGiftModeChange: (m: GiftMode) => void;
  deliveryTarget: DeliveryTarget;
  onDeliveryTargetChange: (t: DeliveryTarget) => void;
  buyer: BuyerFields;
  onBuyerChange: (b: BuyerFields) => void;
  recipient: RecipientFields;
  onRecipientChange: (r: RecipientFields) => void;
  message: string;
  onMessageChange: (m: string) => void;
  scheduledAt: string;
  onScheduledAtChange: (v: string) => void;
}

export function GiftDetailsForm({
  giftMode,
  onGiftModeChange,
  deliveryTarget,
  onDeliveryTargetChange,
  buyer,
  onBuyerChange,
  recipient,
  onRecipientChange,
  message,
  onMessageChange,
  scheduledAt,
  onScheduledAtChange,
}: GiftDetailsFormProps) {
  const isScheduled = scheduledAt !== "";

  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(10, 0, 0, 0);
  const minDatetime = tomorrow.toISOString().slice(0, 16);

  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() + 1);
  const maxDatetime = maxDate.toISOString().slice(0, 16);

  const scheduledDisplay = scheduledAt
    ? new Date(scheduledAt).toLocaleString("it-IT", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  return (
    <div className="flex flex-col gap-8">
      {/* Top mode toggle */}
      <motion.div {...slide(0)}>
        <div className="flex rounded-2xl border border-line bg-paper-muted/40 p-1">
          <button
            type="button"
            onClick={() => {
              onGiftModeChange("self");
              onScheduledAtChange("");
            }}
            className={
              "flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200 " +
              (giftMode === "self"
                ? "bg-ink text-paper shadow-sm"
                : "text-ink-soft hover:text-ink")
            }
          >
            <User className="h-3.5 w-3.5" />
            Per me
          </button>
          <button
            type="button"
            onClick={() => onGiftModeChange("gift")}
            className={
              "flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200 " +
              (giftMode === "gift"
                ? "bg-ink text-paper shadow-sm"
                : "text-ink-soft hover:text-ink")
            }
          >
            <Gift className="h-3.5 w-3.5" />
            Come regalo
          </button>
        </div>
      </motion.div>

      {/* Buyer */}
      <motion.section {...slide(0.05)}>
        <h2 className="flex items-center gap-2 font-display text-2xl font-semibold text-ink">
          <User className="h-5 w-5 text-gold" />
          {giftMode === "self" ? "I tuoi dati" : "Chi acquista"}
        </h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextField
            id="buyer-first-name"
            label="Nome"
            value={buyer.firstName}
            autoComplete="given-name"
            placeholder="Il tuo nome"
            onChange={(v) => onBuyerChange({ ...buyer, firstName: v })}
          />
          <TextField
            id="buyer-last-name"
            label="Cognome"
            value={buyer.lastName}
            autoComplete="family-name"
            placeholder="Il tuo cognome"
            onChange={(v) => onBuyerChange({ ...buyer, lastName: v })}
          />
          <div className="sm:col-span-2">
            <TextField
              id="buyer-phone"
              label="Telefono"
              type="tel"
              value={buyer.phone}
              autoComplete="tel"
              placeholder="+39 333 123 4567"
              onChange={(v) => onBuyerChange({ ...buyer, phone: v })}
            />
            <p className="mt-1.5 flex items-center gap-1.5 text-xs text-ink-soft/60">
              <Phone className="h-3 w-3" />
              {giftMode === "self"
                ? "Riceverai la gift card su questo numero via WhatsApp."
                : "Riceverai la conferma d'acquisto su questo numero."}
            </p>
          </div>
        </div>
      </motion.section>

      {/* Gift-mode extra sections */}
      <AnimatePresence>
        {giftMode === "gift" && (
          <>
            {/* Delivery target sub-toggle — hidden, set SHOW_DELIVERY_TARGET=true to re-enable */}
            {SHOW_DELIVERY_TARGET && (
              <motion.section key="delivery-target" {...slide(0.05)}>
                <h2 className="flex items-center gap-2 font-display text-2xl font-semibold text-ink">
                  <Phone className="h-5 w-5 text-gold" />
                  Chi riceve il WhatsApp
                </h2>
                <div className="mt-4 flex rounded-2xl border border-line bg-paper-muted/40 p-1">
                  <button
                    type="button"
                    onClick={() => {
                      onDeliveryTargetChange("self");
                      onScheduledAtChange("");
                    }}
                    className={
                      "flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200 " +
                      (deliveryTarget === "self"
                        ? "bg-gold/90 text-paper shadow-sm"
                        : "text-ink-soft hover:text-ink")
                    }
                  >
                    Ricevi tu
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeliveryTargetChange("other")}
                    className={
                      "flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200 " +
                      (deliveryTarget === "other"
                        ? "bg-gold/90 text-paper shadow-sm"
                        : "text-ink-soft hover:text-ink")
                    }
                  >
                    <Gift className="h-3.5 w-3.5" />
                    Manda al destinatario
                  </button>
                </div>
              </motion.section>
            )}

            {/* Recipient fields — hidden with toggle, always "self" for now */}
            {SHOW_DELIVERY_TARGET && deliveryTarget === "other" && (
              <motion.section
                key="recipient"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
              >
                <h2 className="flex items-center gap-2 font-display text-2xl font-semibold text-ink">
                  <Gift className="h-5 w-5 text-gold" />
                  Il destinatario
                </h2>
                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <TextField
                    id="recipient-first-name"
                    label="Nome"
                    value={recipient.recipientFirstName}
                    autoComplete="given-name"
                    placeholder="Nome"
                    onChange={(v) =>
                      onRecipientChange({ ...recipient, recipientFirstName: v })
                    }
                  />
                  <TextField
                    id="recipient-last-name"
                    label="Cognome"
                    value={recipient.recipientLastName}
                    autoComplete="family-name"
                    placeholder="Cognome"
                    onChange={(v) =>
                      onRecipientChange({ ...recipient, recipientLastName: v })
                    }
                  />
                  <div className="sm:col-span-2">
                    <TextField
                      id="recipient-phone"
                      label="Numero di telefono"
                      type="tel"
                      value={recipient.recipientPhone}
                      autoComplete="tel"
                      placeholder="+39 333 123 4567"
                      onChange={(v) =>
                        onRecipientChange({ ...recipient, recipientPhone: v })
                      }
                    />
                  </div>
                </div>
                <p className="mt-2 flex items-center gap-1.5 text-xs text-ink-soft/70">
                  <Phone className="h-3.5 w-3.5" />
                  Il destinatario riceverà la gift card via WhatsApp.
                </p>
              </motion.section>
            )}

            {/* Message */}
            <motion.section key="message" {...slide(0.1)}>
              <label
                htmlFor="custom-message"
                className="flex items-center gap-2 font-display text-2xl font-semibold text-ink"
              >
                <MessageSquareText className="h-5 w-5 text-gold" />
                Dedica personalizzata
              </label>
              <textarea
                id="custom-message"
                rows={4}
                maxLength={CUSTOM_MESSAGE_MAX_LENGTH}
                value={message}
                placeholder="Scrivi un pensiero speciale per accompagnare il regalo…"
                onChange={(e) => onMessageChange(e.target.value)}
                className="mt-4 w-full resize-none rounded-xl border border-line bg-paper px-4 py-3 text-ink outline-none transition-colors placeholder:text-ink-soft/40 focus:border-gold"
              />
              <p className="mt-1.5 text-right text-xs text-ink-soft/60">
                {message.length}/{CUSTOM_MESSAGE_MAX_LENGTH} caratteri
              </p>
            </motion.section>

            {/* Scheduling */}
            <motion.section key="scheduling" {...slide(0.15)}>
              <div className="flex items-center gap-2 font-display text-2xl font-semibold text-ink">
                <CalendarClock className="h-5 w-5 text-gold" />
                Invio programmato
              </div>

              <label className="mt-4 flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  checked={isScheduled}
                  onChange={(e) => onScheduledAtChange(e.target.checked ? minDatetime : "")}
                  className="h-4 w-4 shrink-0 accent-gold cursor-pointer"
                />
                <span className="text-sm text-ink-soft">
                  Scegli data e ora di consegna del WhatsApp
                </span>
              </label>

              {isScheduled && (
                <div className="mt-3">
                  <label
                    htmlFor="scheduled-at"
                    className="mb-1.5 block text-sm font-medium text-ink-soft"
                  >
                    Data e ora di invio
                  </label>
                  <input
                    id="scheduled-at"
                    type="datetime-local"
                    min={minDatetime}
                    max={maxDatetime}
                    value={scheduledAt}
                    onChange={(e) => onScheduledAtChange(e.target.value)}
                    className="w-full rounded-xl border border-line bg-paper px-4 py-2.5 text-ink outline-none transition-colors focus:border-gold sm:w-72"
                  />
                  {scheduledDisplay && (
                    <p className="mt-2 flex items-center gap-1.5 text-xs text-ink-soft/70">
                      <Phone className="h-3.5 w-3.5 text-gold" />
                      {deliveryTarget === "other"
                        ? "Il destinatario riceverà il WhatsApp il "
                        : "Riceverai il WhatsApp il "}
                      <span className="font-medium text-gold">{scheduledDisplay}</span>.
                    </p>
                  )}
                </div>
              )}
            </motion.section>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
