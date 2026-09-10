import { streamAnswer } from "../mock/streamAnswer";
import type { CoachingCard, StreamEvent } from "../mock/types";
import { describeEntity, entities } from "./entities";

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
  card?: CoachingCard;
  label?: string;
  complete: boolean;
};

export type ConversationState = {
  messages: ChatMessage[];
  draft: string;
  busy: boolean;
  status: string;
  hasStarted: boolean;
  evidenceOpen: boolean;
};

export const DEMO_FOLLOWUP_NOTICE =
  "Follow-ups use guided demo responses from this assessment and fictional workspace context.";

export const FOLLOWUP_PROMPTS = [
  "What supports the stakeholder-discovery concern?",
  "Help me phrase the question for the next Brookfield call.",
] as const;

type DemoReply = Pick<ChatMessage, "text" | "label">;
type AnswerStream = (prompt: string) => AsyncIterable<StreamEvent>;

/** A deliberately bounded prototype provider, separate from the fixed first answer. */
export function getDemoReply(prompt: string, messages: ChatMessage[]): DemoReply {
  const card = messages.find((message) => message.card)?.card;
  if (!card) {
    return { text: "The assessment did not finish, so I don't have its coaching card to use for a follow-up. Reopen the page to try the initial assessment again." };
  }

  const question = prompt.toLowerCase().replace(/[-–—]/g, " ");
  const lastReply = [...messages].reverse().find((message) => message.role === "assistant" && message.complete);
  const scoreSummary = card.rows.map((row) => `${row.skill}: ${row.score}`).join("; ");

  if (/transcript|recording|playback|timestamp|which (three |3 )?calls|call (link|id)|full (call|source)/.test(question)) {
    return { text: "This demo includes three evidence snippets from the six-call assessment, but no individual call records, transcripts, recordings, or timestamps. I can explain the supplied evidence or help phrase the next coaching question." };
  }

  const mentionedEntity = Object.values(entities).find((entity) => question.includes(entity.name.toLowerCase()) || question.includes(entity.name.split(" ")[0].toLowerCase()));
  if (mentionedEntity && /details|tell me about|who is|what about|context|profile|overview of|lena|didi|percepto/.test(question)) {
    if (/score|evidence|performance|how is|how.*doing|compare/.test(question) && mentionedEntity.id !== "marcus") {
      return { label: "Demo context", text: `The supplied assessment only scores Marcus Bell. I can show ${mentionedEntity.name}'s workspace context, but there is no scored assessment or call evidence for them in this demo.\n\n${describeEntity(mentionedEntity)}` };
    }
    return { label: "Demo context", text: describeEntity(mentionedEntity) };
  }



  if (/rubric|out of|score.*(calculated|mean)|scoring|scale|benchmark|trend|compared|previous quarter/.test(question)) {
    return { text: `The supplied card gives these scores: ${scoreSummary}. It does not provide a scoring scale, calculation method, benchmark, or prior-period data. I can explain the evidence alongside each score.` };
  }

  if (/more conversational|less formal|more natural|rephrase that|rewrite that/.test(question)) {
    return lastReply?.label === "Suggested wording"
      ? { label: "Suggested wording", text: "Who else should we bring in to make sure the operational and legal side is covered?" }
      : { text: "I can help make a suggested coaching question more conversational. First, ask me to phrase the question for the next Brookfield call." };
  }

  if (/phrase|wording|how should|what should.*ask|suggest.*question|draft.*question|brookfield/.test(question)) {
    return { label: "Suggested wording", text: "Who else needs to validate the operational and legal readiness of this project?" };
  }

  const stakeholder = card.rows.find((row) => row.id === "multithreading");
  if (/stakeholder|who else|decision maker/.test(question) && stakeholder) {
    return { text: `${stakeholder.evidence} The coaching opportunity is to make stakeholder discovery explicit before proposing a solution.` };
  }

  const skill = /listen|omar|compliance/.test(question)
    ? card.rows.find((row) => row.id === "active-listening")
    : /question depth|success (measure|criteria)|autonomous patrol|security concern/.test(question)
      ? card.rows.find((row) => row.id === "question-depth")
      : undefined;
  if (skill) {
    return { label: "Supporting evidence", text: `${skill.evidence} The supplied ${skill.skill.toLowerCase()} score is ${skill.score}.` };
  }

  if (/evidence|support|why.*(marcus|concern|gap|assessment)/.test(question)) {
    return { label: "Supporting evidence", text: card.rows.map((row) => `${row.skill}: ${row.evidence}`).join("\n\n") };
  }

  if (/coach|next step|improve|work on|opportunity|focus/.test(question)) {
    return { text: `${card.summary} ${card.nextStep}` };
  }

  if (/scores|skill ratings/.test(question)) {
    return { text: `${card.period}. ${scoreSummary}. I can explain the supporting evidence for any of these skills.` };
  }

  if (/summary|summari|overview|how is marcus|doing well|strength/.test(question)) {
    const originalAnswer = messages.find((message) => message.card)?.text;
    return { text: originalAnswer || card.summary };
  }

  return { text: "I can help with Marcus's supplied six-call assessment: the three skills, supporting evidence, or a question for the next Brookfield call. I can also show workspace context for Lena Ortiz, Didi Rao, Brookfield, and Percepto. This guided demo does not generate replies outside those topics." };
}

/** Owned by App, independently of whether either conversation surface is visible. */
export function createConversationController(answerStream: AnswerStream = streamAnswer) {
  let state: ConversationState = {
    messages: [], draft: "", busy: false, status: "", hasStarted: false, evidenceOpen: false,
  };
  let nextId = 0;
  const listeners = new Set<() => void>();
  const update = (patch: Partial<ConversationState>) => {
    state = { ...state, ...patch };
    listeners.forEach((listener) => listener());
  };
  const updateMessage = (id: string, patch: Partial<ChatMessage>) => {
    update({ messages: state.messages.map((message) => message.id === id ? { ...message, ...patch } : message) });
  };

  async function respond(prompt: string, id: string, firstAnswer: boolean, history: ChatMessage[]) {
    try {
      if (firstAnswer) {
        let text = "";
        let done = false;
        for await (const event of answerStream(prompt)) {
          if (event.type === "status") update({ status: event.label });
          if (event.type === "text") {
            text += event.delta;
            updateMessage(id, { text });
          }
          if (event.type === "artifact") updateMessage(id, { card: event.data });
          if (event.type === "done") {
            done = true;
            updateMessage(id, { complete: true });
            update({ busy: false, status: "Answer ready. Coaching card available." });
            break;
          }
        }
        if (!done) throw new Error("The answer stream ended before done.");
      } else {
        // Yield once so send() has the same synchronous in-flight guard for both providers.
        await Promise.resolve();
        updateMessage(id, { ...getDemoReply(prompt, history), complete: true });
        update({ busy: false, status: "Reply ready." });
      }
    } catch {
      const partial = state.messages.find((message) => message.id === id)?.text;
      updateMessage(id, {
        text: `${partial ? `${partial}\n\n` : ""}This response could not finish. Your conversation and draft have been kept.`,
        label: "Response interrupted",
        complete: false,
      });
      update({ busy: false, status: "Response interrupted. Your conversation has been kept." });
    }
  }

  return {
    getSnapshot: () => state,
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => { listeners.delete(listener); };
    },
    setDraft(draft: string) { update({ draft }); },
    setEvidenceOpen(evidenceOpen: boolean) { update({ evidenceOpen }); },
    send(text?: string): boolean {
      const prompt = (text ?? state.draft).trim();
      if (!prompt || state.busy) return false;
      const history = state.messages;
      const firstAnswer = !state.hasStarted;
      const id = `message-${++nextId}`;
      const assistantId = `message-${++nextId}`;
      update({
        messages: [
          ...history,
          { id, role: "user", text: prompt, complete: true },
          { id: assistantId, role: "assistant", text: "", complete: false },
        ],
        draft: text === undefined || prompt === state.draft.trim() ? "" : state.draft,
        busy: true,
        hasStarted: true,
        status: firstAnswer ? "" : "Preparing a demo reply…",
      });
      void respond(prompt, assistantId, firstAnswer, history);
      return true;
    },
  };
}
