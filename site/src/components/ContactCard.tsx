import { useEffect, useState, type ReactNode } from 'react';
import { RiCheckLine, RiCloseLine, RiEyeLine, RiEyeOffLine, RiFileCopyLine } from 'react-icons/ri';

import { contactHref, contactText, type ContactItem } from '@/lib/contact';
import { decode } from '@/lib/obfuscate';
import { useLocale } from '@/lib/use-locale';

import Reveal from './Reveal';

function IconButton({ onClick, label, children }: { onClick: () => void; label: string; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="grid place-items-center size-9 rounded-full border border-line text-muted transition-colors hover:text-fg hover:bg-surface-2"
    >
      {children}
    </button>
  );
}

function CopyButton({ value }: { value: string }) {
  const { t } = useLocale();
  const [state, setState] = useState<'idle' | 'copied' | 'failed'>('idle');
  const status = state === 'copied' ? t.contacts.copied : state === 'failed' ? t.contacts.copyFailed : '';

  const handleCopy = async () => {
    if (!value) {
      return;
    }
    try {
      // clipboard is unavailable without HTTPS or when permission is denied
      await navigator.clipboard.writeText(value);
      setState('copied');
    } catch {
      setState('failed');
    }
    setTimeout(() => setState('idle'), 1800);
  };

  return (
    <>
      <IconButton onClick={handleCopy} label={status || t.contacts.copy}>
        {state === 'copied' ? (
          <RiCheckLine size={18} className="text-emerald-400" />
        ) : state === 'failed' ? (
          <RiCloseLine size={18} className="text-red-400" />
        ) : (
          <RiFileCopyLine size={18} />
        )}
      </IconButton>
      {/* announce the result to screen readers */}
      <span role="status" className="sr-only">
        {status}
      </span>
    </>
  );
}

/**
 * One contact channel. The value is decoded only after mount, so the static
 * HTML never contains it; a masked channel (phone, Telegram) shows its
 * placeholder until the visitor reveals it.
 */
export default function ContactCard({ item, delay }: { item: ContactItem; delay: number }) {
  const { t } = useLocale();
  const [value, setValue] = useState('');
  const [revealed, setRevealed] = useState(false);

  useEffect(() => setValue(decode(item.encoded)), [item.encoded]);

  // an unmasked channel (e-mail) has nothing to show before it is decoded
  if (!item.masked && !value) {
    return null;
  }
  const visible = !item.masked || (revealed && value);
  const text = contactText(item.kind, value);

  return (
    <Reveal delay={delay} className="rounded-2xl border border-line bg-surface p-6 md:p-8">
      <div className="eyebrow mb-3">{t.contacts.labels[item.kind]}</div>
      <div className="flex flex-wrap items-center gap-3">
        {visible ? (
          <a
            href={contactHref(item.kind, value)}
            {...(item.kind === 'telegram' && { target: '_blank', rel: 'noopener noreferrer' })}
            className="text-xl md:text-2xl font-medium transition-colors hover:text-accent break-all"
          >
            {text}
          </a>
        ) : (
          <span className="text-xl md:text-2xl font-medium tabular-nums">{item.masked}</span>
        )}
        {item.masked && item.kind !== 'email' && (
          <IconButton
            onClick={() => setRevealed(v => !v)}
            label={revealed ? t.contacts.reveal[item.kind].hide : t.contacts.reveal[item.kind].show}
          >
            {revealed ? <RiEyeOffLine size={18} /> : <RiEyeLine size={18} />}
          </IconButton>
        )}
        <CopyButton value={value && text} />
      </div>
    </Reveal>
  );
}
