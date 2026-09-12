import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

/**
 * A toolbar dropdown. The trigger sits in the bottom bar; the panel is portaled
 * to <body> and fixed just above the trigger, so nothing in the bar or the
 * field can clip it. It closes on a pointerdown outside, on Esc (which it
 * swallows, so Esc never also deselects on the sheet), or when an item calls
 * `close`. Children are a render prop: `(close) => contents`.
 */
export default function Menu({
  label, title, width = 240, maxHeight = 400, align = 'start', chevron = true,
  onOpen, style, className = 'td-word', children,
}) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState(null);
  const trigger = useRef(null);
  const panel = useRef(null);

  const place = () => {
    const t = trigger.current.getBoundingClientRect();
    const w = Math.min(width, window.innerWidth - 24);
    const left = Math.max(12, Math.min(align === 'end' ? t.right - w : t.left, window.innerWidth - w - 12));
    setPos({
      left, width: w,
      bottom: window.innerHeight - t.top + 8,
      maxHeight: Math.max(160, Math.min(maxHeight, t.top - 16)),
    });
  };

  useLayoutEffect(() => { if (open) place(); }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    const down = (e) => {
      if (panel.current && panel.current.contains(e.target)) return;
      if (trigger.current && trigger.current.contains(e.target)) return;
      setOpen(false);
    };
    const key = (e) => {
      if (e.key !== 'Escape') return;
      e.preventDefault();
      e.stopPropagation();
      setOpen(false);
      if (trigger.current) trigger.current.focus();
    };
    window.addEventListener('pointerdown', down, true);
    window.addEventListener('keydown', key, true);
    window.addEventListener('resize', place);
    return () => {
      window.removeEventListener('pointerdown', down, true);
      window.removeEventListener('keydown', key, true);
      window.removeEventListener('resize', place);
    };
  }, [open]);

  const toggle = () => {
    if (!open && onOpen) onOpen();
    setOpen(!open);
  };
  const close = () => setOpen(false);

  return (
    <>
      <button
        ref={trigger} type="button" aria-haspopup="true" aria-expanded={open}
        title={title} onClick={toggle} className={className} style={style}
      >
        {label}
        {chevron && (
          <svg
            width="9" height="9" viewBox="0 0 10 10" aria-hidden="true"
            style={{ flex: 'none', transition: 'transform 160ms ease', transform: open ? 'rotate(180deg)' : 'none' }}
          >
            <path d="M2 3.5 5 6.5l3-3" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>

      {open && pos && createPortal(
        <div
          ref={panel} role="group" aria-label={title}
          style={{
            position: 'fixed', left: pos.left, bottom: pos.bottom, width: pos.width, maxHeight: pos.maxHeight,
            overflowY: 'auto', overscrollBehavior: 'contain', zIndex: 100, padding: '8px',
            background: '#fbfaf8', color: '#201e1d', '--color-text': '#201e1d',
            border: '1px solid color-mix(in srgb, #201e1d 12%, transparent)',
            borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)',
            fontFamily: 'var(--font-ui)', fontSize: '13px', lineHeight: 1.35,
            animation: 'tdMenu 160ms cubic-bezier(.2,.7,.2,1) both',
          }}
        >
          {children(close)}
        </div>,
        document.body,
      )}
    </>
  );
}
