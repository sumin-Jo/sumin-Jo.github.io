// src/hooks/useReveal.js
import { useCallback } from "react";

export default function useReveal() {
  const attach = useCallback((el) => {
    if (!el) return;
    el.classList.add("reveal");

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("is-visible");
        } else {
          el.classList.remove("is-visible");
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -10% 0px" }
    );

    obs.observe(el);
  }, []);

  return attach;
}
