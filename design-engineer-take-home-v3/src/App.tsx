/**
 * Aria Sales Hub: coded host shell.
 *
 * This responsive shell gives your AI Assistant a realistic product context.
 * Most candidate work belongs in the post-invocation experience rendered by
 * <AssistantExperience />. Small shell integration changes are welcome when
 * they help the proposed experience feel coherent.
 */
import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { CommandMenu, commandKey } from "./CommandMenu";
import { ChevronUp, Menu, X } from "lucide-react";
import { ConversationHistory, HistoryDialog, HistoryButton } from "./ConversationHistory";
import { AssistantExperience } from "./AssistantExperience";
import { useConversation } from "./useConversation";
import { useAssistantViewport } from "./useAssistantViewport";
import { dismissEntityPreviews } from "./EntityPreview";
import { EntityMention, EntityText } from "./EntityMention";
import type { AssistantLayout } from "./pages";
import { Icons } from "./icons";

const overviewSignals = [
  { label: "Calls reviewed", value: "18", context: "this week", trend: [42, 54, 48, 68, 74, 100], note: "Five reps have new moments ready to review." },
  { label: "Coaching follow-ups", value: "4", context: "open", trend: [56, 72, 62, 78, 70, 88], note: "Lena and Didi have check-ins scheduled today." },
  { label: "Deals needing attention", value: "3", context: "active", trend: [88, 76, 82, 68, 58, 52], note: "Brookfield and Percepto have follow-ups this week." },
] as const;

export function App({ layout }: { layout: AssistantLayout }) {
  const [presentation, setPresentation] = useState<"closed" | "open" | "minimized">("closed");
  const [focusRequest, setFocusRequest] = useState({ sequence: 0, target: "heading" as "heading" | "composer" });
  const [sidebarIsCompact, setSidebarIsCompact] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDialogElement>(null);
  const mobileMenuButtonRef = useRef<HTMLButtonElement>(null);
  const minimizedChatRef = useRef<HTMLButtonElement>(null);
  const conversation = useConversation(layout);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [commandsOpen, setCommandsOpen] = useState(false);
  const [workspaceNotice, setWorkspaceNotice] = useState('');
  const viewport = useAssistantViewport();
  const conversationViewport = { ...viewport, isMobile: viewport.isMobile || (layout === "column" && viewport.width < 1100) };
  const assistantIsOpen = presentation === "open";
  const modalIsOpen = assistantIsOpen && conversationViewport.isMobile;

  const closeMobileMenu = () => {
    mobileMenuRef.current?.close();
    setMobileMenuOpen(false);
  };
  useEffect(() => {
    const dialog = mobileMenuRef.current;
    if (!viewport.isMobile || !mobileMenuOpen) { dialog?.close(); return; }
    dismissEntityPreviews();
    dialog?.showModal();
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { dialog?.close(); document.body.style.overflow = previous; };
  }, [mobileMenuOpen, viewport.isMobile]);
  useEffect(() => { if (!viewport.isMobile) setMobileMenuOpen(false); }, [viewport.isMobile]);

  const focusChatNavigation = useCallback(() => {
    window.requestAnimationFrame(() => {
      if (viewport.isMobile) mobileMenuButtonRef.current?.focus();
      else (document.querySelector<HTMLButtonElement>('.conversation-history .history-row.selected .history-select')
        ?? document.querySelector<HTMLButtonElement>('.conversation-history .history-new'))?.focus();
    });
  }, [viewport.isMobile]);

  const dismissAssistant = useCallback(() => {
    const focused = document.activeElement as HTMLElement | null;
    const keepWorkspaceFocus = !!focused?.closest('main, .sidebar');
    dismissEntityPreviews();
    setPresentation("closed");
    if (!keepWorkspaceFocus) focusChatNavigation();
  }, [focusChatNavigation]);

  useEffect(() => {
    if (!assistantIsOpen || layout !== 'floating' || conversationViewport.isMobile) return;
    let keyboardNavigation = false;
    const keydown = (event: KeyboardEvent) => { if (event.key === 'Tab') keyboardNavigation = true; };
    const pointerdown = () => { keyboardNavigation = false; };
    const focusin = (event: FocusEvent) => {
      const target = event.target as HTMLElement;
      if (!keyboardNavigation || !target.closest('main, .sidebar')) return;
      const surface = document.querySelector<HTMLElement>('#assistant-conversation');
      if (!surface) return;
      const a = target.getBoundingClientRect(), b = surface.getBoundingClientRect();
      if (a.right > b.left && a.left < b.right && a.bottom > b.top && a.top < b.bottom) {
        dismissEntityPreviews();
        setPresentation('minimized');
        setWorkspaceNotice('Conversation minimized to keep the focused workspace control visible.');
      }
    };
    document.addEventListener('keydown', keydown, true);
    document.addEventListener('pointerdown', pointerdown, true);
    document.addEventListener('focusin', focusin, true);
    return () => {
      document.removeEventListener('keydown', keydown, true);
      document.removeEventListener('pointerdown', pointerdown, true);
      document.removeEventListener('focusin', focusin, true);
    };
  }, [assistantIsOpen, layout, conversationViewport.isMobile]);

  const minimizeAssistant = () => {
    dismissEntityPreviews();
    setPresentation("minimized");
    requestAnimationFrame(() => minimizedChatRef.current?.focus());
  };

  const restoreAssistant = () => {
    dismissEntityPreviews();
    setPresentation("open");
    setFocusRequest(request => ({ sequence: request.sequence + 1, target: "composer" }));
  };

  const openThread = (id?: string) => {
    closeMobileMenu();
    dismissEntityPreviews();
    if (id) conversation.library.select(id); else conversation.library.create();
    setHistoryOpen(false); setPresentation("open");
    setFocusRequest(request => ({ sequence: request.sequence + 1, target: "composer" }));
  };
  const openHistory = () => { dismissEntityPreviews(); setHistoryOpen(true); };
  const openCommands = () => { dismissEntityPreviews(); setHistoryOpen(false); setCommandsOpen(true); };
  useEffect(() => {
    const shortcut = (event: KeyboardEvent) => {
      if (event.isComposing || event.repeat || event.altKey || event.shiftKey || !(event.metaKey || event.ctrlKey) || event.key.toLowerCase() !== 'k') return;
      // Do not interrupt a pending rename or delete confirmation.
      if (document.querySelector('.history-edit[open]')) return;
      event.preventDefault(); event.stopPropagation();
      dismissEntityPreviews(); setHistoryOpen(false); setCommandsOpen(open => !open);
    };
    document.addEventListener('keydown', shortcut, true);
    return () => document.removeEventListener('keydown', shortcut, true);
  }, []);
  const historyProps = {
    conversation,
    onCommands: openCommands,
    onSelect: (id: string) => openThread(id),
    onNew: () => openThread(),
    onDeleted: (active: boolean) => {
      if (!active) return;
      closeMobileMenu();
      setHistoryOpen(false);
      setPresentation("open");
      setFocusRequest(request => ({ sequence: request.sequence + 1, target: "composer" }));
      requestAnimationFrame(() => document.querySelector<HTMLTextAreaElement>("#chat-draft")?.focus());
    },
  };

  const sidebarContent = <>
        <div className="brand-row">
          <a className="brand" href="#top" aria-label="Aria Sales Hub home" onClick={closeMobileMenu}>
            <img src="/aria-logo.png" alt="" width={26} height={26} />
            <span className="nav-label">Aria</span>
          </a>
          {viewport.isMobile ? <button type="button" className="chat-icon-button mobile-menu-close" aria-label="Close menu" onClick={closeMobileMenu}><X size={20} /></button> : <button
            className="sidebar-toggle"
            type="button"
            aria-label={sidebarIsCompact ? "Expand sidebar" : "Compact sidebar"}
            aria-expanded={!sidebarIsCompact}
            aria-controls="primary-navigation"
            onClick={() => setSidebarIsCompact((compact) => !compact)}
          >
            {sidebarIsCompact ? <Icons.panelOpen data-icon="inline-only" /> : <Icons.panelClose data-icon="inline-only" />}
          </button>}
        </div>

        <button className="sidebar-search" type="button" aria-label="Search commands and conversations" aria-keyshortcuts="Meta+K Control+K" onClick={openCommands}>
          <Icons.search data-icon="inline-start" />
          <span className="nav-label">Search</span>
          <span className="kbd" aria-hidden="true">{commandKey()}</span>
        </button>

        <nav className="nav-group" id="primary-navigation" aria-label="Main">
          <span className="nav-item shell-context" aria-current="page" data-label="Home"><Icons.home data-icon="inline-start" /><span className="nav-label">Home</span></span>
          <span className="nav-item shell-context" data-label="Team"><Icons.users data-icon="inline-start" /><span className="nav-label">Team</span></span>
          <span className="nav-item shell-context" data-label="Coaching"><Icons.target data-icon="inline-start" /><span className="nav-label">Coaching</span></span>
          <span className="nav-item shell-context" data-label="Deals"><Icons.briefcase data-icon="inline-start" /><span className="nav-label">Deals</span></span>
          <span className="nav-item shell-context" data-label="Library"><Icons.library data-icon="inline-start" /><span className="nav-label">Library</span></span>
        </nav>

        <ConversationHistory {...historyProps} />
        <div className="history-launcher"><HistoryButton onClick={openHistory} /></div>

        <div className="sidebar-foot">
          <span className="nav-item shell-context" data-label="Help"><Icons.help data-icon="inline-start" /><span className="nav-label">Help</span></span>
          <span className="nav-item shell-context" data-label="Settings"><Icons.settings data-icon="inline-start" /><span className="nav-label">Settings</span></span>
          <div className="user-row shell-context" data-label="Jordan Ashby">
            <span className="avatar">JA</span>
            <span className="who">
              <strong>Jordan Ashby</strong>
              <small>Sales manager · North America</small>
            </span>
          </div>
        </div>
  </>;

  return (
    <div className={`app-shell${sidebarIsCompact && !viewport.isMobile ? " sidebar-compact" : ""}${assistantIsOpen && layout === "column" && !conversationViewport.isMobile ? " column-open" : ""}`}
      style={{ '--visual-height': `${viewport.height}px`, '--visual-top': `${viewport.top}px` } as CSSProperties}>
      <span className="sr-only" role="status">{workspaceNotice}</span>
      {viewport.isMobile ? <>
        <header className="mobile-topbar" inert={modalIsOpen}>
          <button ref={mobileMenuButtonRef} type="button" className="chat-icon-button" aria-label="Open menu" aria-haspopup="dialog" aria-expanded={mobileMenuOpen} aria-controls="mobile-navigation" onClick={() => setMobileMenuOpen(true)}><Menu size={22} /></button>
          <a className="brand" href="#top" aria-label="Aria Sales Hub home"><img src="/aria-logo.png" alt="" width={26} height={26}/><span>Aria</span></a>
        </header>
        <dialog ref={mobileMenuRef} id="mobile-navigation" className="mobile-navigation" aria-label="Navigation and conversations"
          onCancel={event => {event.preventDefault(); event.stopPropagation(); closeMobileMenu();}}
          onClick={event => {if (event.target === event.currentTarget) {const rect=event.currentTarget.getBoundingClientRect(); if(event.clientX > rect.right || event.clientX < rect.left || event.clientY < rect.top || event.clientY > rect.bottom) closeMobileMenu();}}}
          onKeyDown={event => {
            if (event.key === 'Escape') {event.preventDefault();event.stopPropagation();closeMobileMenu();}
            if (event.key !== 'Tab') return;
            const items=Array.from(event.currentTarget.querySelectorAll<HTMLElement>('a[href],button:not(:disabled),input')).filter(el=>el.getClientRects().length>0 && !el.closest('dialog:not([open])'));
            if(event.shiftKey && document.activeElement===items[0]) {event.preventDefault();items.at(-1)?.focus();}
            else if(!event.shiftKey && document.activeElement===items.at(-1)) {event.preventDefault();items[0]?.focus();}
          }}>
          <div className="sidebar mobile-sidebar">{sidebarContent}</div>
        </dialog>
      </> : <aside className="sidebar" aria-label="Primary" inert={modalIsOpen}>{sidebarContent}</aside>}

      <main className="main" id="top" inert={modalIsOpen}>
        <div className="main-inner">
          <div className="greeting-row">
            <h1 className="greeting">Good to see you, Jordan.</h1>
            <p className="date-eyebrow">Today · Friday, September 4</p>
          </div>

          <div className="content">
            <section className="brief" aria-labelledby="brief-title">
              <h2 id="brief-title" className="sr-only">Today's brief</h2>
              <p className="brief-lead">
                Your morning brief has <strong>three coaching moments</strong> and <strong>two deal follow-ups</strong> across the team.
              </p>
              <ul className="brief-points">
                <li>
                  <b>Coaching.</b>{" "}
                  <EntityMention entityId="marcus" />{", "}<EntityMention entityId="lena" />{", and "}<EntityMention entityId="didi" /> each have recent calls ready for review.
                </li>
                <li>
                  <b>Deals.</b>{" "}
                  <EntityMention entityId="brookfield" /> enters security review today; <EntityMention entityId="percepto" /> has a pricing follow-up Friday.
                </li>
              </ul>
            </section>

            <section className="section" aria-labelledby="signals-title">
              <div className="section-head">
                <h2 id="signals-title" className="section-title">Team overview</h2>
                <span className="section-meta">Today · 6 reps · 12 active deals</span>
              </div>
              <div className="stat-grid">
                {overviewSignals.map((signal) => (
                  <article className="stat" key={signal.label} aria-label={`${signal.label}: ${signal.value} ${signal.context}`}>
                    <div className="stat-head"><span className="stat-skill">{signal.label}</span></div>
                    <div className="stat-value-row">
                      <span className="stat-value">{signal.value}</span>
                      <span className="stat-context">{signal.context}</span>
                    </div>
                    <div className="bars" aria-hidden="true">
                      {signal.trend.map((height, index) => <span key={index} style={{ "--h": `${height}%` } as CSSProperties} />)}
                    </div>
                    <p className="stat-note"><EntityText text={signal.note} /></p>
                  </article>
                ))}
              </div>
            </section>
          </div>
        </div>

      </main>

      <AssistantExperience key={conversation.id} conversation={conversation} active={assistantIsOpen} layout={layout}
        onDismiss={dismissAssistant} onMinimize={minimizeAssistant} viewport={conversationViewport} focusRequest={focusRequest} />

      {layout === "floating" && presentation === "minimized" && <div className="assistant-minimized" role="group" aria-label="Minimized chat">
        <button ref={minimizedChatRef} className="assistant-minimized-open" type="button" aria-controls="assistant-conversation" aria-expanded="false" onClick={restoreAssistant}>
          <span>Chat</span><span className="assistant-minimized-hint">Resume</span><ChevronUp size={18} aria-hidden="true" />
        </button>
        <button className="chat-icon-button" type="button" aria-label="Close minimized chat" title="Close chat" onClick={dismissAssistant}><X size={18} aria-hidden="true" /></button>
      </div>}

      <HistoryDialog {...historyProps} open={historyOpen} onClose={() => setHistoryOpen(false)} />
      <CommandMenu open={commandsOpen} onClose={() => setCommandsOpen(false)} onNew={() => openThread()}
        onResume={() => openThread(conversation.id)} onHistory={openHistory}
        sidebarCompact={sidebarIsCompact} onToggleSidebar={() => setSidebarIsCompact(value => !value)}
        showSidebarControls={!viewport.isMobile} threads={conversation.history.threads} onSelect={openThread} />
    </div>
  );
}
