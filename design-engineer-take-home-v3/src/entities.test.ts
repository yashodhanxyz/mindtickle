import { describe, expect, it } from "vitest";
import { streamAnswer } from "../mock/streamAnswer";
import { entities, describeEntity, splitEntityMentions } from "./entities";
import { getDemoReply, type ChatMessage } from "./conversation";
import { getOptionPage } from "./pages";

describe("shared entity context", () => {
  it("preserves the supplied stream text exactly while annotating names", async () => {
    let answer = "";
    for await (const event of streamAnswer("", { speed: 0 })) {
      if (event.type === "text") {
        answer += event.delta;
        expect(splitEntityMentions(answer).map((part) => part.text).join("")).toBe(answer);
      }
    }
    const text = "Marcus Bell, Marcus’s Brookfield call; Lena Ortiz, Didi Rao and Percepto. Marcusson is not Marcus.";
    expect(splitEntityMentions(text).map((part) => part.text).join("")).toBe(text);
    expect(splitEntityMentions("Marcusson")).toEqual([{ text: "Marcusson", entityId: undefined }]);
  });

  it("uses the same fields for peers without adding unsupported skill scores", () => {
    for (const id of ["lena", "didi"] as const) {
      expect(entities[id].facts.map((fact) => fact.label)).toEqual(entities.marcus.facts.map((fact) => fact.label));
    }
    expect(entities.percepto.facts.map((fact) => fact.label)).toEqual(entities.brookfield.facts.map((fact) => fact.label));
    expect(entities.marcus.facts[0].value).toBe("6 this quarter");
  });

  it("keeps chat entity descriptions aligned with the single shared registry", async () => {
    const history: ChatMessage[] = [];
    for await (const event of streamAnswer("", { speed: 0 })) {
      if (event.type === "artifact") history.push({ id: "assessment", role: "assistant", text: "", complete: true, card: event.data });
    }
    for (const entity of Object.values(entities)) {
      expect(getDemoReply(`Tell me about ${entity.name}`, history)).toEqual({ label: "Demo context", text: describeEntity(entity) });
    }
    expect(getDemoReply("Show Lena’s call transcript", history).text).toContain("no individual call records");
    const reply = getDemoReply("How is Lena doing? Show her scores.", history);
    expect(reply.text).toContain("no scored assessment or call evidence");
    expect(reply.text).not.toMatch(/4\.1|3\.8|2\.9/);
  });
});

describe("separate option pages", () => {
  it("fixes each direct URL to its own presentation, including trailing slashes", () => {
    expect(getOptionPage("/floating").layout).toBe("floating");
    expect(getOptionPage("/column").layout).toBe("column");
    expect(getOptionPage("/column/").layout).toBe("column");
    expect(getOptionPage("/").layout).toBe("floating");
  });
});
