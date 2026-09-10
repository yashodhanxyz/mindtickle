import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import { ArrowDown, ArrowUp, ChevronDown, LoaderCircle, Maximize2, Minus, PanelRight, PanelsTopLeft, X } from "lucide-react";
import type { CoachingCard as CoachingCardData } from "../mock/types";
import { DEMO_FOLLOWUP_NOTICE } from "./conversation";
import type { useConversation } from "./useConversation";
import type { useAssistantViewport } from "./useAssistantViewport";

type Props = {
  conversation: ReturnType<typeof useConversation>;
  active: boolean;
  layout: "floating" | "column";
  onLayoutChange: (layout: "floating" | "column") => void;
  onDismiss: () => void;
  onMinimize: () => void;
  viewport: ReturnType<typeof useAssistantViewport>;
  focusRequest: { sequence: number; target: "heading" | "composer" };
};

function CoachingCard({ card, expanded, onToggle }: { card: CoachingCardData; expanded: boolean; onToggle: () => void }) {
  return <article className="coaching-card" aria-labelledby="coaching-card-title">
    <h3 id="coaching-card-title">{card.rep}</h3>
    <p className="card-period">{card.period}</p>
    <p className="card-summary">{card.summary}</p>
    <dl className="coaching-skills">
      {card.rows.map((row) => <div className="coaching-skill" key={row.id}>
        <dt>{row.skill}</dt><dd className="skill-score">{row.score.toFixed(1)}</dd>
        <dd id={`evidence-${row.id}`} className="skill-evidence" hidden={!expanded}>{row.evidence}</dd>
      </div>)}
    </dl>
    <p className="coaching-next-step"><strong>Next step:</strong> {card.nextStep}</p>
    <button className="evidence-toggle" type="button" aria-expanded={expanded}
      aria-controls={card.rows.map((row) => `evidence-${row.id}`).join(" ")} onClick={onToggle}>
      <span>{expanded ? "Hide supporting evidence" : "Show supporting evidence"}</span>
      <ChevronDown size={16} aria-hidden="true" />
    </button>
  </article>;
}

export function AssistantExperience({ conversation, active, layout, onLayoutChange, onDismiss, onMinimize, viewport, focusRequest }: Props) {
  const { messages, draft, setDraft, busy, status, evidenceOpen, setEvidenceOpen, send } = conversation;
  const surfaceRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const composerRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const followsLatest = useRef(true);
  const scrollPosition = useRef(0);
  const anchor = useRef<{ id: string; offset: number } | null>(null);
  const lastVisibleMessages = useRef(messages);
  const [hasNewReply, setHasNewReply] = useState(false);
  const canSwitchLayout = viewport.width > 760;
  const layoutSwitchLabel = layout === "column" ? "Use floating chat" : viewport.width < 1100 ? "Expand conversation" : "Use integrated third column";

  const rememberPosition = () => {
    const scroll = scrollRef.current;
    if (!scroll || !active) return;
    scrollPosition.current = scroll.scrollTop;
    followsLatest.current = scroll.scrollHeight - scroll.clientHeight - scroll.scrollTop < 40;
    if (followsLatest.current) setHasNewReply(false);
    const top = scroll.getBoundingClientRect().top;
    const message = Array.from(scroll.querySelectorAll<HTMLElement>("[data-message-id]")).find((item) => item.getBoundingClientRect().bottom > top);
    if (message) anchor.current = { id: message.dataset.messageId!, offset: message.getBoundingClientRect().top - top };
  };

  useLayoutEffect(() => {
    if (!active) return;
    const scroll = scrollRef.current;
    if (scroll) scroll.scrollTop = scrollPosition.current;
    (focusRequest.target === "heading" ? headingRef.current : composerRef.current)?.focus({ preventScroll: true });
  }, [active, focusRequest.sequence, focusRequest.target]);

  const restoreReadingPosition = () => {
    const scroll = scrollRef.current;
    if (!scroll) return;
    if (followsLatest.current) scroll.scrollTop = scroll.scrollHeight;
    else if (anchor.current) {
      const item = Array.from(scroll.querySelectorAll<HTMLElement>("[data-message-id]")).find((element) => element.dataset.messageId === anchor.current?.id);
      if (item) scroll.scrollTop += item.getBoundingClientRect().top - scroll.getBoundingClientRect().top - anchor.current.offset;
    }
  };

  useLayoutEffect(() => {
    if (!active) return;
    restoreReadingPosition();
    if (viewport.isMobile && !surfaceRef.current?.contains(document.activeElement)) headingRef.current?.focus({ preventScroll: true });
  }, [active, layout, viewport.isMobile, viewport.height, canSwitchLayout, messages, evidenceOpen]);

  useEffect(() => {
    if (!active) return;
    if (messages !== lastVisibleMessages.current && !followsLatest.current) setHasNewReply(true);
    lastVisibleMessages.current = messages;
  }, [messages, active]);

  useLayoutEffect(() => {
    const input = composerRef.current;
    if (!input || !active) return;
    input.style.height = "auto";
    input.style.height = `${Math.min(input.scrollHeight, 128)}px`;
  }, [draft, active, layout, viewport.isMobile, viewport.width]);

  useEffect(() => {
    const input = composerRef.current;
    if (!active || !input) return;
    let previousWidth = 0;
    const observer = new ResizeObserver(() => {
      if (input.clientWidth === previousWidth) return;
      previousWidth = input.clientWidth;
      input.style.height = "auto";
      input.style.height = `${Math.min(input.scrollHeight, 128)}px`;
    });
    observer.observe(input);
    return () => observer.disconnect();
  }, [active]);

  useEffect(() => {
    if (!active) return;
    const closeOnEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape" && !event.defaultPrevented && !event.isComposing) {
        event.preventDefault();
        onDismiss();
      }
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [active, onDismiss]);

  useEffect(() => {
    if (!active || !viewport.isMobile) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previous; };
  }, [active, viewport.isMobile]);

  useEffect(() => {
    if (!active || !contentRef.current) return;
    const observer = new ResizeObserver(restoreReadingPosition);
    observer.observe(contentRef.current);
    if (scrollRef.current) observer.observe(scrollRef.current);
    return () => observer.disconnect();
  }, [active]);

  const containMobileFocus = (event: KeyboardEvent<HTMLElement>) => {
    if (!viewport.isMobile || event.key !== "Tab") return;
    const items = Array.from(surfaceRef.current?.querySelectorAll<HTMLElement>('button:not(:disabled), textarea, [tabindex="0"]') ?? []).filter((item) => item.getClientRects().length > 0);
    const first = items[0];
    const last = items[items.length - 1];
    if (event.shiftKey && (document.activeElement === first || document.activeElement === headingRef.current)) {
      event.preventDefault(); last?.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault(); first?.focus();
    }
  };

  const submit = () => {
    if (send()) {
      followsLatest.current = true;
      setHasNewReply(false);
      composerRef.current?.focus({ preventScroll: true });
    }
  };

  return <section ref={surfaceRef} id="assistant-conversation" hidden={!active}
    className={`assistant-surface assistant-${layout}${viewport.isMobile ? " assistant-mobile" : ""}`}
    role={viewport.isMobile ? "dialog" : "region"} aria-modal={viewport.isMobile ? true : undefined}
    aria-labelledby="assistant-title" onKeyDown={containMobileFocus}
    style={viewport.isMobile ? { "--visual-height": `${viewport.height}px`, "--visual-top": `${viewport.top}px` } as CSSProperties : undefined}>
    <header className="chat-header">
      <img className="chat-brand" src="/aria-logo.png" alt="" width="32" height="32" />
      <div className="chat-heading"><h2 ref={headingRef} tabIndex={-1} id="assistant-title">AI Assistant</h2><p>Marcus · Discovery calls</p></div>
      <div className="chat-actions">
        {canSwitchLayout && <button className="chat-icon-button" type="button" onClick={() => onLayoutChange(layout === "floating" ? "column" : "floating")}
          aria-label={layoutSwitchLabel} title={layoutSwitchLabel}>
          {layout === "column" ? <PanelsTopLeft size={18} aria-hidden="true" /> : viewport.width < 1100 ? <Maximize2 size={18} aria-hidden="true" /> : <PanelRight size={18} aria-hidden="true" />}
        </button>}
        {(layout === "floating" || !canSwitchLayout) && <button className="chat-icon-button" type="button" aria-label="Minimize conversation" title="Minimize conversation" onClick={onMinimize}><Minus size={18} aria-hidden="true" /></button>}
        <button className="chat-icon-button" type="button" aria-label="Close conversation" title="Close conversation (Escape)" onClick={onDismiss}><X size={18} aria-hidden="true" /></button>
      </div>
    </header>
    <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">{active ? status : ""}</div>
    <div className="transcript-wrap">
      <div ref={scrollRef} className="chat-transcript" role="region" aria-label="Conversation messages" tabIndex={0} onScroll={rememberPosition}>
        <div ref={contentRef} className="chat-messages">
          {messages.map((message) => <div key={message.id} data-message-id={message.id} className={`chat-message message-${message.role}`}>
            {message.role === "user" ? <><span className="sr-only">You: </span><p>{message.text}</p></> : <>
              <img className="answer-avatar" src="/aria-logo.png" alt="" width="26" height="26" />
              <div className="answer-copy"><span className="sr-only">AI Assistant: </span>
                {message.label && <p className="answer-label">{message.label}</p>}
                {message.text && <p>{message.text}</p>}
                {!message.text && !message.complete && busy && <p className="answer-progress"><LoaderCircle size={16} aria-hidden="true" />{status || "Preparing your answer…"}</p>}
              </div>
              {message.card && <CoachingCard card={message.card} expanded={evidenceOpen} onToggle={() => setEvidenceOpen(!evidenceOpen)} />}
            </>}
          </div>)}
        </div>
      </div>
      {hasNewReply && <button className="new-reply" type="button" onClick={() => { followsLatest.current = true; if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; setHasNewReply(false); }}><ArrowDown size={14} aria-hidden="true" /> Latest reply</button>}
    </div>
    <footer className="chat-footer">
      <form className="chat-composer" onSubmit={(event) => { event.preventDefault(); submit(); }}>
        <label className="sr-only" htmlFor="chat-draft">Ask a follow-up</label>
        <textarea ref={composerRef} id="chat-draft" rows={1} value={draft} placeholder="Ask a follow-up…" onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing && event.nativeEvent.keyCode !== 229) { event.preventDefault(); submit(); } }} />
        <button className="chat-send" type="submit" disabled={busy || !draft.trim()} aria-label={busy ? "Waiting for reply" : "Send follow-up"}>
          {busy ? <LoaderCircle size={18} aria-hidden="true" /> : <ArrowUp size={20} aria-hidden="true" />}
        </button>
      </form>
      <p className="demo-notice" title={DEMO_FOLLOWUP_NOTICE}>Follow-ups are demo replies based on this assessment.</p>
    </footer>
  </section>;
}
