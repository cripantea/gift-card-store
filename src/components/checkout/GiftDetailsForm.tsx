"use client";

import { motion } from "framer-motion";
import { CalendarClock, Gift, MessageSquareText, Phone, User } from "lucide-react";

export const CUSTOM_MESSAGE_MAX_LENGTH = 300;

function section(delay: number) {
  return {
    initial: { opacity: 0, y: 18 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.45, ease: "easeOut" as const, delay },
  };
}

interface TextFieldProps {
  id: string;
  label: string;
  type?: "text" | "tel";
  value: string;
  onChange: (value: string) => void;
  autoComplete?: string;
  placeholder?: string;
}

function TextField({
  id,
  label,
  type = "text",
  value,
  onChange,
  autoComplete,
  placeholder,
}: TextFieldProps) {
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
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-line bg-paper px-4 py-2.5 text-ink outline-none transition-colors placeholder:text-ink-soft/40 focus:border-gold"
      />
    </div>
  );
}

interface BuyerFields {
  firstName: string;
  lastName: string;
  email: string;
}

interface RecipientFields {
  recipientName: string;
  recipientPhone: string;
}

interface GiftDetailsFormProps {
  buyer: BuyerFields;
  onBuyerChange: (buyer: BuyerFields) => void;
  recipient: RecipientFields;
  onRecipientChange: (recipient: RecipientFields) => void;
  message: string;
  onMessageChange: (message: string) => void;
  scheduledAt: string;
  onScheduledAtChange: (value: string) => void;
}

export function GiftDetailsForm({
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
      <motion.section {...section(0)}>
        <h2 className="flex items-center gap-2 font-display text-2xl font-semibold text-ink">
          <User className="h-5 w-5 text-gold" />I tuoi dati
        </h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextField
            id="buyer-first-name"
            label="Nome"
            value={buyer.firstName}
            autoComplete="given-name"
            placeholder="Il tuo nome"
            onChange={(value) => onBuyerChange({ ...buyer, firstName: value })}
          />
          <TextField
            id="buyer-last-name"
            label="Cognome"
            value={buyer.lastName}
            autoComplete="family-name"
            placeholder="Il tuo cognome"
            onChange={(value) => onBuyerChange({ ...buyer, lastName: value })}
          />
          <div className="sm:col-span-2">
            <TextField
              id="buyer-email"
              label="Email"
              value={buyer.email}
              autoComplete="email"
              placeholder="nome@esempio.it"
              onChange={(value) => onBuyerChange({ ...buyer, email: value })}
            />
          </div>
        </div>
      </motion.section>

      <motion.section {...section(0.08)}>
        <h2 className="flex items-center gap-2 font-display text-2xl font-semibold text-ink">
          <Gift className="h-5 w-5 text-gold" />
          Il destinatario
        </h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextField
            id="recipient-name"
            label="Nome e cognome"
            value={recipient.recipientName}
            autoComplete="name"
            placeholder="Nome del destinatario"
            onChange={(value) =>
              onRecipientChange({ ...recipient, recipientName: value })
            }
          />
          <TextField
            id="recipient-phone"
            label="Numero di telefono"
            type="tel"
            value={recipient.recipientPhone}
            autoComplete="tel"
            placeholder="+39 333 123 4567"
            onChange={(value) =>
              onRecipientChange({ ...recipient, recipientPhone: value })
            }
          />
        </div>
        <p className="mt-2 flex items-center gap-1.5 text-xs text-ink-soft/70">
          <Phone className="h-3.5 w-3.5" />
          Il destinatario riceverà un WhatsApp direttamente dal numero di MAD for Hair.
        </p>
      </motion.section>

      <motion.section {...section(0.16)}>
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
          onChange={(event) => onMessageChange(event.target.value)}
          className="mt-4 w-full resize-none rounded-xl border border-line bg-paper px-4 py-3 text-ink outline-none transition-colors placeholder:text-ink-soft/40 focus:border-gold"
        />
        <p className="mt-1.5 text-right text-xs text-ink-soft/60">
          {message.length}/{CUSTOM_MESSAGE_MAX_LENGTH} caratteri
        </p>
      </motion.section>

      <motion.section {...section(0.24)}>
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
            <label htmlFor="scheduled-at" className="mb-1.5 block text-sm font-medium text-ink-soft">
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
                Il destinatario riceverà il WhatsApp il{" "}
                <span className="font-medium text-gold">{scheduledDisplay}</span>.
              </p>
            )}
          </div>
        )}
      </motion.section>
    </div>
  );
}
