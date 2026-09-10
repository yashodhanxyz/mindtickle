import { Building2 } from "lucide-react";
import { EntityPreview } from "./EntityPreview";
import { entities, splitEntityMentions, type EntityId } from "./entities";

export function EntityMention({ entityId, label, inline = false }: { entityId: EntityId; label?: string; inline?: boolean }) {
  const entity = entities[entityId];
  return <EntityPreview name={entity.name} inline={inline} label={<>
    {!inline && <span className={entity.kind === "person" ? "avatar cool" : "mark"} aria-hidden="true">{entity.kind === "person" ? entity.initials : <Building2 size={12} />}</span>}
    {label ?? entity.name}
  </>}>
    <span className="hover-card-head"><span className={entity.kind === "person" ? "avatar cool lg" : "mark large"} aria-hidden="true">{entity.kind === "person" ? entity.initials : <Building2 size={17} />}</span><span><strong>{entity.name}</strong><small>{entity.subtitle}</small></span></span>
    <span className="preview-grid">{entity.facts.map((fact) => <span key={fact.label}><small>{fact.label}</small><strong>{fact.value}</strong></span>)}</span>
    <span className="preview-note"><b>{entity.contextLabel}</b> {entity.context}</span>
    <span className="preview-next"><b>Suggested next step</b><span>{entity.nextStep}</span></span>
    <small className="preview-provenance">Fictional workspace · Demo context</small>
  </EntityPreview>;
}
export function EntityText({ text }: { text: string }) {
  return <>{splitEntityMentions(text).map((part, index) => part.entityId
    ? <EntityMention key={`${index}-${part.entityId}`} entityId={part.entityId} label={part.text} inline /> : part.text)}</>;
}
