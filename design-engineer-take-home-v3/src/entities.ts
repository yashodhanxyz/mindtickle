export type EntityId = "marcus" | "lena" | "didi" | "brookfield" | "percepto";
export type Entity = {
  id: EntityId; kind: "person" | "deal"; name: string; initials?: string; subtitle: string;
  facts: { label: string; value: string }[];
  contextLabel: string; context: string; nextStep: string;
};

// Fictional fixtures shared by host previews and demo chat replies. Added
// coaching prompts are authored examples, not additional call evidence.
export const entities: Record<EntityId, Entity> = {
  marcus: {
    id: "marcus", kind: "person", name: "Marcus Bell", initials: "MB", subtitle: "Account executive · Mid-market",
    facts: [{ label: "Calls available", value: "6 this quarter" }, { label: "Coaching moments", value: "2 ready" }],
    contextLabel: "Active deal", context: "Brookfield is in evaluation.",
    nextStep: "In the next Brookfield call, ask who must validate operational and legal readiness.",
  },
  lena: {
    id: "lena", kind: "person", name: "Lena Ortiz", initials: "LO", subtitle: "Account executive · North America",
    facts: [{ label: "Calls available", value: "Recent calls ready" }, { label: "Coaching moments", value: "Check-in today" }],
    contextLabel: "Suggested coaching focus", context: "Turn the buyer’s desired outcome into a clear success measure.",
    nextStep: "Ask what a successful security pilot would need to demonstrate, and how the buyer would measure it.",
  },
  didi: {
    id: "didi", kind: "person", name: "Didi Rao", initials: "DR", subtitle: "Account executive · North America",
    facts: [{ label: "Calls available", value: "Recent calls ready" }, { label: "Coaching moments", value: "Check-in today" }],
    contextLabel: "Suggested coaching focus", context: "Connect the operational problem to the buyer’s reason for acting now.",
    nextStep: "Ask how gaps in current site coverage affect the team, and agree who owns the next step.",
  },
  brookfield: {
    id: "brookfield", kind: "deal", name: "Brookfield", subtitle: "Enterprise opportunity",
    facts: [{ label: "Stage", value: "Evaluation" }, { label: "Next meeting", value: "September 9" }],
    contextLabel: "Latest update", context: "Security review is scheduled.",
    nextStep: "Confirm who must validate operational and legal readiness with Marcus Bell.",
  },
  percepto: {
    id: "percepto", kind: "deal", name: "Percepto", subtitle: "Enterprise opportunity",
    facts: [{ label: "Stage", value: "Pricing discussion" }, { label: "Next meeting", value: "Friday · Pricing follow-up" }],
    contextLabel: "Latest update", context: "A pricing follow-up is scheduled for Friday.",
    nextStep: "Confirm the deployment scope, budget owner, and approval process before revising the proposal.",
  },
};
const aliases: Record<string, EntityId> = {
  "Marcus Bell": "marcus", Marcus: "marcus", "Lena Ortiz": "lena", Lena: "lena",
  "Didi Rao": "didi", Didi: "didi", Brookfield: "brookfield", Percepto: "percepto",
};
const names = new RegExp(`\\b(${Object.keys(aliases).join("|")})\\b`, "g");

/** Preserve every character of the supplied stream; only annotate known names. */
export function splitEntityMentions(text: string): { text: string; entityId?: EntityId }[] {
  return text.split(names).filter(Boolean).map((part) => ({ text: part, entityId: aliases[part] }));
}
export function describeEntity(entity: Entity) {
  return `${entity.name} · ${entity.subtitle}.\n\n${entity.facts.map((fact) => `${fact.label}: ${fact.value}.`).join(" ")}\n\n${entity.contextLabel}: ${entity.context}\n\nSuggested next step: ${entity.nextStep}`;
}
