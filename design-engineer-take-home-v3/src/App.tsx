/**
 * Aria Sales Hub: coded host shell.
 *
 * This responsive shell gives your AI Assistant a realistic product context.
 * Most candidate work belongs in the post-invocation experience rendered by
 * <AssistantExperience />. Small shell integration changes are welcome when
 * they help the proposed experience feel coherent.
 */
import { useCallback, useRef, useState, type CSSProperties } from "react";
import { MessageSquare, PanelRight, Sparkles, X } from "lucide-react";
import { AssistantExperience } from "./AssistantExperience";
import { useConversation } from "./useConversation";
import { useAssistantViewport } from "./useAssistantViewport";
import { EntityPreview } from "./EntityPreview";
import { Icons } from "./icons";

export const DEFAULT_PROMPT = "How is Marcus doing on discovery calls this quarter?";

const overviewSignals = [
  { label: "Calls reviewed", value: "18", context: "this week", trend: [42, 54, 48, 68, 74, 100], note: "Five reps have new moments ready to review." },
  { label: "Coaching follow-ups", value: "4", context: "open", trend: [56, 72, 62, 78, 70, 88], note: "Lena and Didi have check-ins scheduled today." },
  { label: "Deals needing attention", value: "3", context: "active", trend: [88, 76, 82, 68, 58, 52], note: "Brookfield and Percepto have follow-ups this week." },
] as const;

export function App() {
  const [presentation, setPresentation] = useState<"closed" | "open" | "minimized">("closed");
  const [layout, setLayout] = useState<"floating" | "column">(() => new URLSearchParams(window.location.search).get("layout") === "column" ? "column" : "floating");
  const [focusRequest, setFocusRequest] = useState({ sequence: 0, target: "heading" as "heading" | "composer" });
  const [sidebarIsCompact, setSidebarIsCompact] = useState(false);
  const triggerRef = useRef<HTMLInputElement>(null);
  const resumeRef = useRef<HTMLButtonElement>(null);
  const minimizedRef = useRef<HTMLButtonElement>(null);
  const conversation = useConversation();
  const viewport = useAssistantViewport();
  const conversationViewport = { ...viewport, isMobile: viewport.isMobile || (layout === "column" && viewport.width < 1100) };
  const assistantIsOpen = presentation === "open";
  const modalIsOpen = assistantIsOpen && conversationViewport.isMobile;

  const invokeAssistant = () => {
    const target = conversation.hasStarted ? "composer" : "heading";
    if (!conversation.hasStarted) conversation.send(DEFAULT_PROMPT);
    setPresentation("open");
    setFocusRequest((request) => ({ sequence: request.sequence + 1, target }));
  };

  const dismissAssistant = useCallback(() => {
    setPresentation("closed");
    window.requestAnimationFrame(() => (resumeRef.current ?? triggerRef.current)?.focus());
  }, []);

  const minimizeAssistant = () => {
    setPresentation("minimized");
    window.requestAnimationFrame(() => minimizedRef.current?.focus());
  };

  return (
    <div className={`app-shell${sidebarIsCompact ? " sidebar-compact" : ""}${assistantIsOpen && layout === "column" && !conversationViewport.isMobile ? " column-open" : ""}`}>
      <aside className="sidebar" aria-label="Primary" inert={modalIsOpen}>
        <div className="brand-row">
          <a className="brand" href="#top" aria-label="Aria Sales Hub home">
            <img src="/aria-logo.png" alt="" width={26} height={26} />
            <span className="nav-label">Aria</span>
          </a>
          <button
            className="sidebar-toggle"
            type="button"
            aria-label={sidebarIsCompact ? "Expand sidebar" : "Compact sidebar"}
            aria-expanded={!sidebarIsCompact}
            aria-controls="primary-navigation"
            onClick={() => setSidebarIsCompact((compact) => !compact)}
          >
            {sidebarIsCompact ? <Icons.panelOpen data-icon="inline-only" /> : <Icons.panelClose data-icon="inline-only" />}
          </button>
        </div>

        <div className="sidebar-search shell-context" data-label="Search" aria-hidden="true">
          <Icons.search data-icon="inline-start" />
          <span className="nav-label">Search</span>
          <span className="kbd">⌘K</span>
        </div>

        <nav className="nav-group" id="primary-navigation" aria-label="Main">
          <span className="nav-item shell-context" aria-current="page" data-label="Home"><Icons.home data-icon="inline-start" /><span className="nav-label">Home</span></span>
          <span className="nav-item shell-context" data-label="Team"><Icons.users data-icon="inline-start" /><span className="nav-label">Team</span></span>
          <span className="nav-item shell-context" data-label="Coaching"><Icons.target data-icon="inline-start" /><span className="nav-label">Coaching</span></span>
          <span className="nav-item shell-context" data-label="Deals"><Icons.briefcase data-icon="inline-start" /><span className="nav-label">Deals</span></span>
          <span className="nav-item shell-context" data-label="Library"><Icons.library data-icon="inline-start" /><span className="nav-label">Library</span></span>
        </nav>

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
      </aside>

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
                  <EntityPreview id="marcus-preview" label={<><span className="avatar cool">MB</span>Marcus Bell</>}>
                    <span className="hover-card-head">
                      <span className="avatar cool lg">MB</span>
                      <span><strong>Marcus Bell</strong><small>Account executive · Mid-market</small></span>
                    </span>
                    <span className="preview-grid">
                      <span><small>Calls available</small><strong>6 this quarter</strong></span>
                      <span><small>Coaching moments</small><strong>2 ready</strong></span>
                    </span>
                    <span className="preview-note"><b>Active deal</b> Brookfield is in evaluation.</span>
                  </EntityPreview>{", Lena Ortiz, and Didi Rao each have recent calls ready for review."}
                </li>
                <li>
                  <b>Deals.</b>{" "}
                  <EntityPreview id="brookfield-preview" label={<><span className="mark"><Icons.shield data-icon="inline-start" /></span>Brookfield</>}>
                    <span className="hover-card-head">
                      <span className="mark large"><Icons.shield data-icon="inline-start" /></span>
                      <span><strong>Brookfield</strong><small>Enterprise opportunity</small></span>
                    </span>
                    <span className="preview-grid">
                      <span><small>Stage</small><strong>Evaluation</strong></span>
                      <span><small>Next meeting</small><strong>September 9</strong></span>
                    </span>
                    <span className="preview-note"><b>Latest update</b> Security review is scheduled.</span>
                  </EntityPreview>
                  {" "}enters security review today; Percepto has a pricing follow-up Friday.
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
                    <p className="stat-note">{signal.note}</p>
                  </article>
                ))}
              </div>
            </section>
          </div>
        </div>

      <div className="assistant-entry" hidden={viewport.width < 1100 && (presentation === "minimized" || (assistantIsOpen && layout === "floating"))}>
        {!conversation.hasStarted && <div className="layout-picker" role="group" aria-label="Conversation layout">
          <button type="button" aria-pressed={layout === "floating"} onClick={() => setLayout("floating")}><MessageSquare size={14} aria-hidden="true" /> Floating chat</button>
          <button type="button" aria-pressed={layout === "column"} onClick={() => setLayout("column")}><PanelRight size={14} aria-hidden="true" /> Third column</button>
        </div>}
      {conversation.hasStarted ? <button ref={resumeRef} className="resume-conversation" type="button" onClick={invokeAssistant} aria-controls="assistant-conversation" aria-expanded={assistantIsOpen}>
        <Sparkles size={19} aria-hidden="true" />{assistantIsOpen ? "Focus conversation" : "Resume conversation"}
      </button> : <form
        className="assistant-trigger"
        aria-label="Ask AI Assistant"
        onSubmit={(event) => {
          event.preventDefault();
          invokeAssistant();
        }}
      >
        <label className="sr-only" htmlFor="assistant-prompt">Initial coaching question</label>
        <input ref={triggerRef} id="assistant-prompt" value={DEFAULT_PROMPT} readOnly />
        <button className="icon-button optional-action" type="button" aria-label="Voice input" disabled><Icons.mic data-icon="inline-only" /></button>
        <button className="icon-button primary" type="submit" aria-label="Ask AI Assistant"><Icons.arrowUp data-icon="inline-only" /></button>
      </form>}
      </div>
      </main>

      <AssistantExperience conversation={conversation} active={assistantIsOpen} layout={layout} onLayoutChange={setLayout}
        onDismiss={dismissAssistant} onMinimize={minimizeAssistant} viewport={conversationViewport} focusRequest={focusRequest} />

      {presentation === "minimized" && <div className="minimized-chat" onKeyDown={(event) => { if (event.key === "Escape") dismissAssistant(); }}>
        <button ref={minimizedRef} className="minimized-restore" type="button" onClick={invokeAssistant} aria-label="Restore AI Assistant conversation" aria-controls="assistant-conversation" aria-expanded={false}>
          <img src="/aria-logo.png" alt="" width="28" height="28" /><span><strong>AI Assistant</strong><small>{conversation.busy ? "Preparing reply…" : "Marcus · Discovery calls"}</small></span>
        </button>
        <button className="chat-icon-button" type="button" aria-label="Close AI Assistant" onClick={dismissAssistant}><X size={18} aria-hidden="true" /></button>
      </div>}
    </div>
  );
}
