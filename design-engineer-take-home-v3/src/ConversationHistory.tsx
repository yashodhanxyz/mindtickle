import { useEffect, useId, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from 'react';
import { MoreHorizontal, Pin, Plus, X, MessagesSquare } from 'lucide-react';
import type { SavedConversation } from './conversationLibrary';
import type { useConversation } from './useConversation';

type Conversation = ReturnType<typeof useConversation>;
type Props = { conversation: Conversation; onSelect: (id: string) => void; onNew: () => void; onDeleted: (active: boolean) => void; onCommands: () => void; overlay?: boolean; onClose?: () => void };

function containDialogFocus(event: ReactKeyboardEvent<HTMLDialogElement>) {
  if (event.key !== 'Tab') return;
  const items = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('button:not(:disabled), input')).filter(el => el.getClientRects().length > 0);
  const first = items[0], last = items[items.length - 1];
  if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
  else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
}

function RowMenu({ thread, onAction }: { thread: SavedConversation; onAction: (action: 'rename' | 'pin' | 'delete') => void }) {
  const id = useId();
  const trigger = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState(false);
  const position = () => {
    const r = trigger.current!.getBoundingClientRect();
    Object.assign(menu.current!.style, { left: `${Math.min(r.left, innerWidth - 180)}px`, top: `${Math.min(r.bottom + 4, innerHeight - 150)}px` });
  };
  const hide = () => { menu.current?.hidePopover(); trigger.current?.focus(); };
  const show = () => { position(); menu.current?.showPopover(); menu.current?.querySelector<HTMLButtonElement>('button')?.focus(); };
  useEffect(() => {
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && menu.current?.matches(':popover-open')) { event.preventDefault(); event.stopPropagation(); menu.current.hidePopover(); trigger.current?.focus(); }
    };
    document.addEventListener('keydown', escape, true);
    return () => document.removeEventListener('keydown', escape, true);
  }, []);
  return <>
    <button ref={trigger} className="history-more" type="button" aria-label={`Options for ${thread.title}`} aria-haspopup="menu" aria-expanded={expanded} aria-controls={id}
      onClick={() => menu.current?.matches(':popover-open') ? hide() : show()} onKeyDown={e => { if (e.key === 'ArrowDown') { e.preventDefault(); show(); } }}><MoreHorizontal size={17} aria-hidden="true" /></button>
    <div ref={menu} id={id} popover="auto" role="menu" className="history-menu" aria-label={`Actions for ${thread.title}`}
      onToggle={e => { const open = (e.nativeEvent as ToggleEvent).newState === 'open'; setExpanded(open); }}
      onKeyDown={e => {
        if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); hide(); }
        const items = Array.from(menu.current?.querySelectorAll<HTMLButtonElement>('button') ?? []);
        const index = items.indexOf(document.activeElement as HTMLButtonElement);
        if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(e.key)) { e.preventDefault(); items[e.key === 'Home' ? 0 : e.key === 'End' ? items.length - 1 : (index + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length]?.focus(); }
        if (e.key === 'Tab') menu.current?.hidePopover();
      }}>
      {(['rename', 'pin', 'delete'] as const).map(action => <button type="button" role="menuitem" key={action} className={action === 'delete' ? 'danger-text' : ''} onClick={() => { hide(); onAction(action); }}>{action === 'pin' ? thread.pinned ? 'Unpin' : 'Pin' : action === 'rename' ? 'Rename' : 'Delete'}</button>)}
    </div>
  </>;
}

export function ConversationHistory({ conversation, onSelect, onNew, onDeleted, onCommands, overlay, onClose }: Props) {
  const { history, library } = conversation;
  const editTitleId = useId();
  const [editing, setEditing] = useState<{ id: string; action: 'rename' | 'delete' } | null>(null);
  const [title, setTitle] = useState('');
  const [notice, setNotice] = useState('');
  const dialog = useRef<HTMLDialogElement>(null);
  const newButton = useRef<HTMLButtonElement>(null);
  const editThread = history.threads.find(t => t.id === editing?.id);
  useEffect(() => { if (editing) dialog.current?.showModal(); else dialog.current?.close(); }, [editing]);
  const closeEdit = () => { dialog.current?.close(); setEditing(null); };
  const threads = history.threads.filter(t => t.state.hasStarted || t.state.draft.trim()).sort((a, b) => b.updatedAt - a.updatedAt);
  return <section className={`conversation-history${overlay ? ' history-overlay-content' : ''}`} aria-label="Conversations">
    {overlay && <div className="history-heading"><h2>Conversations</h2><button className="chat-icon-button" type="button" aria-label="Close conversation history" onClick={onClose}><X size={18} aria-hidden="true" /></button></div>}
    <button ref={newButton} className="history-new" type="button" onClick={onNew}><Plus size={17} aria-hidden="true" />New conversation</button>
    {overlay && <button className="history-command-link" type="button" onClick={onCommands}>Search commands and shortcuts</button>}
    <div className="history-list">
      {threads.length === 0 && <p className="history-empty">Your conversations will appear here after you send a message.</p>}
      {[true, false].map(pinned => {
        const group = threads.filter(t => t.pinned === pinned);
        return group.length > 0 && <div className="history-group" key={String(pinned)}><h3>{pinned ? 'Pinned' : 'Recent'}</h3>
          {group.map(thread => <div className={`history-row${thread.id === history.activeId ? ' selected' : ''}`} key={thread.id}>
            <button className="history-select" type="button" aria-current={thread.id === history.activeId ? 'true' : undefined} onClick={() => onSelect(thread.id)} title={thread.title}>
              {thread.pinned && <Pin size={13} aria-hidden="true" />}<span>{thread.title}</span>{thread.state.busy ? <small aria-label="Reply in progress">•••</small> : !thread.state.hasStarted ? <small>Draft</small> : null}
            </button>
            <RowMenu thread={thread} onAction={action => {
              if (action === 'pin') { library.pin(thread.id, !thread.pinned); setNotice(`${thread.title} ${thread.pinned ? 'unpinned' : 'pinned'}.`); }
              else { setTitle(thread.title); setEditing({id: thread.id, action}); }
            }} />
          </div>)}
        </div>;
      })}
    </div>
    {history.storageError && <p className="history-storage">Storage unavailable · Kept for this session</p>}
    <span role="status" className="sr-only">{notice}</span>
    <dialog ref={dialog} className="history-edit" onCancel={e => { e.preventDefault(); e.stopPropagation(); closeEdit(); }} onKeyDown={e => { containDialogFocus(e); e.stopPropagation(); }} aria-labelledby={editTitleId}>
      <form onSubmit={e => {
        e.preventDefault(); if (!editing || !editThread) return;
        if (editing.action === 'rename') { library.rename(editing.id, title); setNotice('Conversation renamed.'); closeEdit(); }
        else { const active = history.activeId === editing.id; library.remove(editing.id); closeEdit(); setNotice('Conversation deleted.'); onDeleted(active); if (!active) requestAnimationFrame(() => newButton.current?.focus()); }
      }}>
        <h2 id={editTitleId}>{editing?.action === 'rename' ? 'Rename conversation' : 'Delete conversation?'}</h2>
        {editing?.action === 'rename' ? <label>Conversation name<input autoFocus value={title} onChange={e => setTitle(e.target.value)} maxLength={80} required /></label> : <p>Delete “{editThread?.title}” from conversation history? This cannot be undone.</p>}
        <div className="history-edit-actions"><button autoFocus={editing?.action === 'delete'} type="button" onClick={closeEdit}>Cancel</button><button type="submit" className={editing?.action === 'delete' ? 'danger-button' : 'save-button'} disabled={editing?.action === 'rename' && !title.trim()}>{editing?.action === 'rename' ? 'Save name' : 'Delete conversation'}</button></div>
      </form>
    </dialog>
  </section>;
}

export function HistoryDialog({ open, onClose, ...props }: Props & { open: boolean; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => { if (open) ref.current?.showModal(); else ref.current?.close(); }, [open]);
  return <dialog ref={ref} className="history-dialog" aria-label="Conversation history" onCancel={e => {e.preventDefault(); e.stopPropagation(); onClose();}} onKeyDown={e => {containDialogFocus(e); if (e.key === 'Escape') e.stopPropagation();}}>
    <ConversationHistory {...props} overlay onClose={onClose} />
  </dialog>;
}
export function HistoryButton({ onClick }: { onClick: () => void }) {
  return <button type="button" className="chat-icon-button" aria-label="Conversations" title="Conversations" onClick={onClick}><MessagesSquare size={19} aria-hidden="true" /></button>;
}
