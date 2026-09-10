import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { X } from "lucide-react";
import { createPortal } from "react-dom";

// Explicit dismissal may uncover another trigger beneath a stationary pointer.
// Re-arm hover on real pointer movement, never with a global timed lockout.
let hoverNeedsMovement = false;
let changingPopover = false;

export function dismissEntityPreviews() {
  changingPopover = true;
  try { document.querySelectorAll<HTMLElement>(".entity-card:popover-open").forEach((card) => card.hidePopover()); }
  finally { changingPopover = false; }
}

/** Native top-layer popovers retain their place in the owning dialog's accessible tree. */
export function EntityPreview({ name, label, children, inline = false }: { name: string; label: ReactNode; children: ReactNode; inline?: boolean }) {
  const id = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const previewRef = useRef<HTMLSpanElement>(null);
  const wrapperRef = useRef<HTMLSpanElement>(null);
  const pinned = useRef(false);
  const pointerDown = useRef(false);
  const suppressFocus = useRef(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [isOpen, setIsOpen] = useState(false);
  const [portalRoot, setPortalRoot] = useState<Element | null>(null);
  const [position, setPosition] = useState({ left: 16, top: 16, maxHeight: 400, ready: false });
  useLayoutEffect(() => {
    setPortalRoot(triggerRef.current?.closest("#assistant-conversation") ?? document.body);
  }, []);

  const cancelClose = useCallback(() => clearTimeout(closeTimer.current), []);
  const close = useCallback((restoreFocus = false, explicit = true) => {
    if (changingPopover) return;
    cancelClose();
    if (!previewRef.current?.matches(":popover-open")) return;
    if (explicit) hoverNeedsMovement = true;
    pinned.current = false;
    changingPopover = true;
    try { previewRef.current?.hidePopover(); } finally { changingPopover = false; }
    setIsOpen(false);
    if (restoreFocus) {
      suppressFocus.current = true;
      triggerRef.current?.focus({ preventScroll: true });
      suppressFocus.current = false;
    }
  }, [cancelClose]);
  const open = () => {
    cancelClose();
    if (changingPopover) return;
    if (previewRef.current?.matches(":popover-open")) return;
    setPosition((current) => ({ ...current, ready: false }));
    // Keep one card open and guard focus restoration during native transitions.
    dismissEntityPreviews();
    changingPopover = true;
    try { previewRef.current?.showPopover(); } finally { changingPopover = false; }
    setIsOpen(true);
  };
  const scheduleClose = () => {
    cancelClose();
    closeTimer.current = setTimeout(() => {
      if (!pinned.current && !wrapperRef.current?.contains(document.activeElement) && !previewRef.current?.contains(document.activeElement)) close(false, false);
    }, 180);
  };

  useLayoutEffect(() => {
    if (!isOpen) return;
    const positionPreview = () => {
      const trigger = triggerRef.current;
      const card = previewRef.current;
      if (!trigger || !card) return;
      const viewport = window.visualViewport;
      const width = viewport?.width ?? window.innerWidth;
      const height = viewport?.height ?? window.innerHeight;
      const originTop = viewport?.offsetTop ?? 0;
      const originLeft = viewport?.offsetLeft ?? 0;
      const rect = trigger.getBoundingClientRect();
      const cardHeight = Math.min(card.scrollHeight + 2, height - 32);
      const left = Math.max(originLeft + 16, Math.min(rect.left, originLeft + width - card.offsetWidth - 16));
      const below = rect.bottom + 8;
      const top = below + cardHeight <= originTop + height - 16 ? below : Math.max(originTop + 16, rect.top - cardHeight - 8);
      setPosition({ left, top, maxHeight: height - 32, ready: true });
    };
    positionPreview();
    const observer = new ResizeObserver(positionPreview);
    if (previewRef.current) observer.observe(previewRef.current);
    window.addEventListener("resize", positionPreview);
    const onScroll = (event: Event) => { if (!previewRef.current?.contains(event.target as Node)) positionPreview(); };
    window.addEventListener("scroll", onScroll, true);
    window.visualViewport?.addEventListener("resize", positionPreview);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", positionPreview);
      window.removeEventListener("scroll", onScroll, true);
      window.visualViewport?.removeEventListener("resize", positionPreview);
    };
  }, [isOpen, close]);

  useEffect(() => {
    if (!isOpen) return;
    const escape = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || event.isComposing) return;
      event.preventDefault(); event.stopPropagation();
      close(!!previewRef.current?.contains(document.activeElement));
    };
    const outside = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!wrapperRef.current?.contains(target) && !previewRef.current?.contains(target)) close();
    };
    document.addEventListener("keydown", escape, true);
    document.addEventListener("pointerdown", outside, true);
    return () => {
      document.removeEventListener("keydown", escape, true);
      document.removeEventListener("pointerdown", outside, true);
    };
  }, [isOpen, close]);
  useEffect(() => () => cancelClose(), [cancelClose]);

  return <span ref={wrapperRef} className={`entity-preview${inline ? " entity-inline" : ""}`}
    onPointerEnter={(event) => { if (event.pointerType === "mouse" && !hoverNeedsMovement) open(); }}
    onPointerMove={(event) => {
      if (event.pointerType === "mouse" && (event.movementX !== 0 || event.movementY !== 0)) {
        hoverNeedsMovement = false; open();
      }
    }} onPointerLeave={scheduleClose}
    onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget) && !previewRef.current?.contains(event.relatedTarget)) close(false, false); }}>
    <button ref={triggerRef} className={inline ? "entity-text-trigger" : "chip"} type="button"
      aria-label={`${name} details`} aria-haspopup="dialog" aria-expanded={isOpen} aria-controls={id}
      onPointerDown={() => { pointerDown.current = true; }}
      onFocus={() => { if (!pointerDown.current && !suppressFocus.current && !changingPopover) {
        window.requestAnimationFrame(() => { if (document.activeElement === triggerRef.current) open(); });
      } }}
      onClick={() => {
        pointerDown.current = false;
        if (pinned.current && isOpen) { close(); return; }
        pinned.current = true; open(); window.requestAnimationFrame(() => { if (previewRef.current?.matches(":popover-open")) previewRef.current.focus({ preventScroll: true }); });
      }}
      onKeyDown={(event) => { if (event.key === "ArrowDown") { event.preventDefault(); pinned.current = true; open(); window.requestAnimationFrame(() => { if (previewRef.current?.matches(":popover-open")) previewRef.current.focus({ preventScroll: true }); }); } }}>
      {label}
    </button>
    {portalRoot && createPortal(<span ref={previewRef} id={id} className="hover-card entity-card" popover="manual" role="dialog" tabIndex={-1}
      aria-label={`${name} details`} aria-describedby={`${id}-content`} data-ready={position.ready}
      style={{ left: position.left, top: position.top, maxHeight: position.maxHeight }}
      onToggle={(event) => { const openNow = (event.nativeEvent as ToggleEvent).newState === "open"; setIsOpen(openNow); if (!openNow) { pinned.current = false; cancelClose(); } }}
      onPointerEnter={cancelClose} onPointerLeave={scheduleClose}>
      <button type="button" className="preview-close" aria-label={`Close ${name} details`} onClick={() => close(true)}><X size={16} aria-hidden="true" /></button>
      <span id={`${id}-content`} className="preview-content">{children}</span>
    </span>, portalRoot)}
  </span>;
}
