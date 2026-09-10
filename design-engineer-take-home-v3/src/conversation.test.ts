import { describe, expect, it, vi } from "vitest";
import { streamAnswer } from "../mock/streamAnswer";
import type { StreamEvent } from "../mock/types";
import { createConversationController, FOLLOWUP_PROMPTS, getDemoReply } from "./conversation";

const initialQuestion = "How is Marcus doing on discovery calls this quarter?";
const instantStream = (prompt: string) => streamAnswer(prompt, { speed: 0 });
type Controller = ReturnType<typeof createConversationController>;

function finished(controller: Controller) {
  if (!controller.getSnapshot().busy) return Promise.resolve();
  return new Promise<void>((resolve) => {
    const unsubscribe = controller.subscribe(() => {
      if (!controller.getSnapshot().busy) {
        unsubscribe();
        resolve();
      }
    });
  });
}

describe("conversation lifecycle", () => {
  it("consumes all original deltas and one card even when the stream is instant", async () => {
    const controller = createConversationController(instantStream);
    const statuses: string[] = [];
    controller.subscribe(() => statuses.push(controller.getSnapshot().status));
    expect(controller.send(initialQuestion)).toBe(true);
    expect(controller.send(initialQuestion)).toBe(false);
    await finished(controller);
    const { messages, status, busy } = controller.getSnapshot();
    expect(messages).toHaveLength(2);
    expect(messages[1].text).toBe("Marcus is improving at discovery, especially when he slows down and follows the buyer's language. His strongest recent moment was turning a vague security concern into a concrete success measure. The next coaching opportunity is to involve more stakeholders before proposing a solution.");
    expect(messages[1].card?.rows.map((row) => row.score)).toEqual([4.1, 3.8, 2.9]);
    expect(messages[1].complete).toBe(true);
    expect(statuses).toContain("Reviewing 6 discovery calls");
    expect(status).toBe("Answer ready. Coaching card available.");
    expect(busy).toBe(false);
  });

  it("continues a hidden response and retains the draft and evidence across subscribers", async () => {
    let continueStream!: () => void;
    const gate = new Promise<void>((resolve) => { continueStream = resolve; });
    async function* delayedStream(prompt: string) {
      await gate;
      yield* instantStream(prompt);
    }
    const controller = createConversationController(delayedStream);
    const visibleListener = vi.fn();
    const hideSurface = controller.subscribe(visibleListener);
    controller.send(initialQuestion);
    controller.setDraft("Make that a little more conversational.");
    controller.setEvidenceOpen(true);
    hideSurface();
    const callsWhileVisible = visibleListener.mock.calls.length;
    continueStream();
    await finished(controller);
    expect(visibleListener).toHaveBeenCalledTimes(callsWhileVisible);
    expect(controller.getSnapshot()).toMatchObject({
      busy: false, draft: "Make that a little more conversational.", evidenceOpen: true,
    });
    expect(controller.getSnapshot().messages[1].card?.rep).toBe("Marcus Bell");
  });

  it("appends the storyboard follow-ups and a contextual rewrite without replaying the mock", async () => {
    const mock = vi.fn(instantStream);
    const controller = createConversationController(mock);
    controller.send(initialQuestion);
    await finished(controller);
    controller.send(FOLLOWUP_PROMPTS[0]);
    await finished(controller);
    expect(controller.getSnapshot().messages.at(-1)?.text).toBe("Three calls ended without confirming who else shapes the decision. The coaching opportunity is to make stakeholder discovery explicit before proposing a solution.");
    controller.send(FOLLOWUP_PROMPTS[1]);
    await finished(controller);
    expect(controller.getSnapshot().messages.at(-1)).toMatchObject({ label: "Suggested wording", text: "Who else needs to validate the operational and legal readiness of this project?" });
    controller.setDraft("Make that a little more conversational.");
    expect(controller.getSnapshot().messages).toHaveLength(6);
    expect(controller.send()).toBe(true);
    expect(controller.send()).toBe(false);
    await finished(controller);
    expect(controller.getSnapshot().messages.at(-1)?.text).toBe("Who else should we bring in to make sure the operational and legal side is covered?");
    expect(controller.getSnapshot().messages.filter((message) => message.card)).toHaveLength(1);
    expect(controller.getSnapshot().draft).toBe("");
    expect(mock).toHaveBeenCalledTimes(1);
  });

  it("preserves partial content on an interrupted stream without a false completion", async () => {
    async function* interrupted(): AsyncGenerator<StreamEvent> {
      yield { type: "text", delta: "A partial answer." };
      throw new Error("Network or provider failure");
    }
    const controller = createConversationController(interrupted);
    controller.send(initialQuestion);
    controller.setDraft("A draft worth keeping");
    await finished(controller);
    expect(controller.getSnapshot()).toMatchObject({ busy: false, draft: "A draft worth keeping" });
    expect(controller.getSnapshot().messages[1]).toMatchObject({ complete: false, label: "Response interrupted" });
    expect(controller.getSnapshot().messages[1].text).toContain("A partial answer.");
  });

  it("rejects blank prompts and preserves a draft when a different suggestion is submitted", async () => {
    const controller = createConversationController(instantStream);
    expect(controller.send(" \n ")).toBe(false);
    controller.setDraft("My unsent draft");
    controller.send(initialQuestion);
    await finished(controller);
    expect(controller.getSnapshot().draft).toBe("My unsent draft");
  });
});

describe("bounded demo replies", () => {
  it("uses the supplied evidence and admits unavailable data and unsupported topics", async () => {
    const controller = createConversationController(instantStream);
    controller.send(initialQuestion);
    await finished(controller);
    const { messages } = controller.getSnapshot();
    expect(getDemoReply("Explain active listening", messages).text).toContain("Marcus reflected Omar's compliance concern");
    expect(getDemoReply("Show question-depth evidence", messages).text).toContain("“What would need to be true");
    expect(getDemoReply("Which three calls? Show transcripts", messages).text).toContain("no individual call records");
    expect(getDemoReply("Are these scores out of 5?", messages).text).toContain("does not provide a scoring scale");
    expect(getDemoReply("What is the weather tomorrow?", messages).text).toContain("does not generate replies outside those topics");
  });
});

it('rewrites Brookfield wording in a fresh conversation without a Marcus assessment', async () => {
  const controller = createConversationController(instantStream);
  controller.send('Suggest wording for Brookfield'); await finished(controller);
  controller.send('Make that more conversational'); await finished(controller);
  expect(controller.getSnapshot().messages.at(-1)?.text).toContain('Who else should we bring in');
  expect(controller.getSnapshot().messages.some(m=>m.card)).toBe(false);
});
