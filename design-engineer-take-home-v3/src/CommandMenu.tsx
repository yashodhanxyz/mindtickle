import { useEffect, useId, useRef, useState } from 'react';
import { ArrowLeft, Keyboard, MessagesSquare, PanelLeft, Plus, Search, Sparkles, X, type LucideIcon } from 'lucide-react';
import type { SavedConversation } from './conversationLibrary';

export const commandKey = () => /Mac|iPhone|iPad/.test(navigator.platform) ? '⌘ K' : 'Ctrl K';
type Command = { id: string; label: string; detail: string; icon: LucideIcon; run: () => void };
type Props = {
  open: boolean; onClose: () => void; onNew: () => void; onResume: () => void;
  onHistory: () => void; onToggleSidebar: () => void; sidebarCompact: boolean; showSidebarControls: boolean;
  threads: SavedConversation[]; onSelect: (id: string) => void;
};

/** Searchable actions keep input focus; arrow selection is exposed through aria-activedescendant. */
export function CommandMenu(props: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(0);
  const [help, setHelp] = useState(false);
  const listId = useId();
  const run = (action: () => void) => {
    dialog.current?.close();
    props.onClose();
    requestAnimationFrame(action);
  };
  const actions: Command[] = [
    {id: 'new', label: 'New conversation', detail: 'Start a fresh chat', icon: Plus, run: props.onNew},
    {id: 'resume', label: 'Open current conversation', detail: 'Continue where you left off', icon: Sparkles, run: props.onResume},
    {id: 'history', label: 'Conversation history', detail: 'Revisit, rename, pin or delete chats', icon: MessagesSquare, run: props.onHistory},
    {id: 'sidebar', label: props.sidebarCompact ? 'Expand sidebar' : 'Compact sidebar', detail: 'Adjust your workspace', icon: PanelLeft, run: props.onToggleSidebar},
    {id: 'shortcuts', label: 'Keyboard shortcuts', detail: 'See the available keys', icon: Keyboard, run: () => setHelp(true)},
    ...props.threads.filter(t => t.state.hasStarted || t.state.draft.trim()).sort((a,b) => b.updatedAt - a.updatedAt).map(t => ({
      id: t.id, label: t.title, detail: t.state.hasStarted ? 'Saved conversation' : 'Unsent draft', icon: MessagesSquare, run: () => props.onSelect(t.id),
    })),
  ];
  const results = actions.filter(item => (item.id !== 'sidebar' || props.showSidebarControls) && `${item.label} ${item.detail}`.toLowerCase().includes(query.trim().toLowerCase()));
  const index = Math.min(selected, Math.max(0, results.length - 1));
  const choose = (item: Command) => item.id === 'shortcuts' ? setHelp(true) : run(item.run);
  useEffect(() => {
    if (props.open) {
      setQuery(''); setSelected(0); setHelp(false);
      dialog.current?.showModal(); input.current?.focus();
    } else dialog.current?.close();
  }, [props.open]);
  useEffect(() => {
    if (props.open && !help) input.current?.focus();
    if (help) dialog.current?.querySelector<HTMLButtonElement>('.command-back')?.focus();
  }, [help, props.open]);
  useEffect(() => {
    dialog.current?.querySelector('[aria-selected="true"]')?.scrollIntoView({block: 'nearest'});
  }, [index, query]);
  const close = () => { dialog.current?.close(); props.onClose(); };
  return <dialog ref={dialog} className="command-dialog" aria-label={help ? 'Keyboard shortcuts' : 'Search commands and conversations'}
    onCancel={e => {e.preventDefault(); e.stopPropagation(); close();}}
    onClick={e => {if (e.target === e.currentTarget) {const r=e.currentTarget.getBoundingClientRect(); if(e.clientX<r.left || e.clientX>r.right || e.clientY<r.top || e.clientY>r.bottom) close();}}}
    onKeyDown={e => {
      e.stopPropagation();
      if (e.key === 'Escape') {e.preventDefault(); close();}
      if (e.key === 'Tab') {
        const items=Array.from(e.currentTarget.querySelectorAll<HTMLElement>('input,button:not(:disabled)')).filter(el=>el.getClientRects().length>0);
        if(e.shiftKey && document.activeElement===items[0]) {e.preventDefault();items.at(-1)?.focus();}
        else if(!e.shiftKey && document.activeElement===items.at(-1)) {e.preventDefault();items[0]?.focus();}
      }
    }}>
    {help ? <>
      <div className="command-help-heading"><button className="chat-icon-button command-back" aria-label="Back to commands" onClick={()=>setHelp(false)}><ArrowLeft size={18}/></button><h2>Keyboard shortcuts</h2><button className="chat-icon-button" aria-label="Close command menu" onClick={close}><X size={18}/></button></div>
      <dl className="shortcut-list">
        {[['Open command menu',commandKey()],['Choose a command','↑ / ↓ then Enter'],['Close menu or active dialog','Esc'],['Move between controls','Tab / Shift Tab'],['Send a chat message','Enter'],['New line in a message','Shift Enter']].map(([label,keys])=><div key={label}><dt>{label}</dt><dd><kbd>{keys}</kbd></dd></div>)}
      </dl>
    </> : <>
      <div className="command-search"><Search size={19} aria-hidden="true"/>
        <input ref={input} role="combobox" aria-label="Search commands and conversations" aria-autocomplete="list" aria-expanded="true" aria-controls={listId}
          aria-activedescendant={results[index] ? `${listId}-${index}` : undefined} value={query} placeholder="Search…"
          onChange={e=>{setQuery(e.target.value);setSelected(0);}}
          onKeyDown={e=>{
            if(e.nativeEvent.isComposing) return;
            if ((e.key==='ArrowDown'||e.key==='ArrowUp') && results.length) {e.preventDefault();setSelected((index+(e.key==='ArrowDown'?1:-1)+results.length)%results.length);}
            if(e.key==='Enter') {e.preventDefault();if(results[index]) choose(results[index]);}
          }}/>
        <button className="chat-icon-button" aria-label="Close command menu" onClick={close}><X size={18} aria-hidden="true"/></button>
      </div>
      <div className="command-results" role="listbox" aria-label="Commands and conversations" id={listId}>
        {results.map((item,i)=><div role="option" id={`${listId}-${i}`} aria-selected={i===index} key={item.id} className="command-option" onPointerMove={()=>setSelected(i)} onClick={()=>choose(item)}>
          <item.icon size={18} aria-hidden="true"/><span><strong>{item.label}</strong><small>{item.detail}</small></span>
        </div>)}
      </div>
      {results.length===0 && <p className="command-empty" role="status">No matches. Try “new”, “history”, or a conversation name.</p>}
      <div className="command-footer"><span><kbd>↑</kbd> <kbd>↓</kbd> Navigate · <kbd>Enter</kbd> Open</span><button onClick={()=>setHelp(true)}><Keyboard size={15} aria-hidden="true"/>Shortcuts</button></div>
    </>}
  </dialog>;
}
