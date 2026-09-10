export type AssistantLayout = "floating" | "column";

/** Each URL owns a fixed presentation and a fresh conversation session. */
export function getOptionPage(pathname: string): { layout: AssistantLayout; title: string } {
  return pathname.replace(/\/+$/, "") === "/column"
    ? { layout: "column", title: "Integrated column" }
    : { layout: "floating", title: "Floating chat" };
}
