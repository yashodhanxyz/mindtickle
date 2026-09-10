import { useEffect, useState } from "react";

const MOBILE_QUERY = "(max-width: 760px)";

function readViewport() {
  return {
    isMobile: window.matchMedia(MOBILE_QUERY).matches,
    width: window.visualViewport?.width ?? window.innerWidth,
    height: window.visualViewport?.height ?? window.innerHeight,
    top: window.visualViewport?.offsetTop ?? 0,
  };
}

/** The visual viewport shrinks when a mobile keyboard covers the layout viewport. */
export function useAssistantViewport() {
  const [viewport, setViewport] = useState(readViewport);
  useEffect(() => {
    const update = () => setViewport(readViewport());
    const media = window.matchMedia(MOBILE_QUERY);
    media.addEventListener("change", update);
    window.addEventListener("resize", update);
    window.visualViewport?.addEventListener("resize", update);
    window.visualViewport?.addEventListener("scroll", update);
    return () => {
      media.removeEventListener("change", update);
      window.removeEventListener("resize", update);
      window.visualViewport?.removeEventListener("resize", update);
      window.visualViewport?.removeEventListener("scroll", update);
    };
  }, []);
  return viewport;
}
