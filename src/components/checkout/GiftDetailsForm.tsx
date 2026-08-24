import { CalendarClock, Gift, Mail, MessageSquareText, User } from "lucide-react";

export const CUSTOM_MESSAGE_MAX_LENGTH = 300;

interface TextFieldProps {
  id: string;
  label: string;
  type?: "text" | "email";
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
  recipientEmail: string;
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

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().slice(0, 10);

  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() + 1);
  const maxDateStr = maxDate.toISOString().slice(0, 10);

  return (
    <div className="flex flex-col gap-8">
      <section>
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
              type="email"
              value={buyer.email}
              autoComplete="email"
              placeholder="nome@esempio.it"
              onChange={(value) => onBuyerChange({ ...buyer, email: value })}
            />
          </div>
        </div>
      </section>

      <section>
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
            id="recipient-email"
            label="Email"
            type="email"
            value={recipient.recipientEmail}
            autoComplete="email"
            placeholder="destinatario@esempio.it"
            onChange={(value) =>
              onRecipientChange({ ...recipient, recipientEmail: value })
            }
          />
        </div>
        <p className="mt-2 flex items-center gap-1.5 text-xs text-ink-soft/70">
          <Mail className="h-3.5 w-3.5" />
          Il destinatario riceverà un&apos;email con il link per scoprire il
          regalo.
        </p>
      </section>

      <section>
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
      </section>

      <section>
        <div className="flex items-center gap-2 font-display text-2xl font-semibold text-ink">
          <CalendarClock className="h-5 w-5 text-gold" />
          Invio programmato
        </div>

        <label className="mt-4 flex cursor-pointer items-center gap-3">
          <input
            type="checkbox"
            checked={isScheduled}
            onChange={(e) => onScheduledAtChange(e.target.checked ? minDate : "")}
            className="h-4 w-4 shrink-0 accent-gold cursor-pointer"
          />
          <span className="text-sm text-ink-soft">
            Vuoi programmare l&apos;invio della Gift Card in una data specifica?
          </span>
        </label>

        {isScheduled && (
          <div className="mt-3">
            <label htmlFor="scheduled-at" className="mb-1.5 block text-sm font-medium text-ink-soft">
              Data di invio
            </label>
            <input
              id="scheduled-at"
              type="date"
              min={minDate}
              max={maxDateStr}
              value={scheduledAt}
              onChange={(e) => onScheduledAtChange(e.target.value)}
              className="w-full rounded-xl border border-line bg-paper px-4 py-2.5 text-ink outline-none transition-colors focus:border-gold sm:w-64"
            />
            <p className="mt-2 flex items-center gap-1.5 text-xs text-ink-soft/70">
              <Mail className="h-3.5 w-3.5" />
              Il destinatario riceverà l&apos;email il{" "}
              {new Date(scheduledAt + "T12:00:00").toLocaleDateString("it-IT", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
