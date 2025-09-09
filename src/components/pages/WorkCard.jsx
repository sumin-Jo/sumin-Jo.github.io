import React, { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";

export default function WorkCard({ item }) {
  const [open, setOpen] = useState(false);

  const uid = useId();
  const titleId = `work-title-${uid}`;
  const descId  = `work-desc-${uid}`;

  const dialogRef = useRef(null);
  const closeBtnRef = useRef(null);
  const lastFocusedRef = useRef(null);

  const openModal = () => setOpen(true);
  const closeModal = () => setOpen(false);

  useEffect(() => {
    if (!open) return;

    lastFocusedRef.current = document.activeElement;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const focusTarget =
      closeBtnRef.current ||
      dialogRef.current?.querySelector(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
    focusTarget?.focus();

    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        closeModal();
      }
      if (e.key === "Tab" && dialogRef.current) {
        const focusables = Array.from(
          dialogRef.current.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          )
        ).filter((el) => !el.hasAttribute("disabled"));
        if (focusables.length === 0) return;

        const first = focusables[0];
        const last = focusables[focusables.length - 1];

        if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        } else if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      }
    };

    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKeyDown);
      lastFocusedRef.current && lastFocusedRef.current.focus?.();
    };
  }, [open]);

  return (
    <>
      <article className="work-card" onClick={openModal}>
        <div className={`dot ${colorKey(item.category)}`} />
        <div className="meta-line">
          <span className={`badge ${colorKey(item.category)}`}>{item.category}</span>
          <span className="sub">
            {item.stack} · {item.work_company}
          </span>
        </div>
        <h3 className="ttl">{item.title}</h3>
        <p className="desc">{item.description}</p>
      </article>

      {open &&
        createPortal(
          <div
            className="work-modal"
            role="presentation"
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) closeModal();
            }}
          >
            <div
              ref={dialogRef}
              className="work-dialog"
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              aria-describedby={descId}
              onMouseDown={(e) => e.stopPropagation()}
            >
              <header>
                <span className={`badge ${colorKey(item.category)}`}>{item.category}</span>
                <h3 id={titleId}>{item.title}</h3>
                <p className="sub">
                  {item.stack} · {item.work_company}
                </p>
              </header>

              <section>
                <p id={descId} className="desc-lg">
                  {item.description}
                </p>
              </section>

              <footer>
                <button
                  type="button"
                  ref={closeBtnRef}
                  onClick={closeModal}
                  className="close-btn"
                >
                  닫기
                </button>
              </footer>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}

function colorKey(c) {
  switch (c) {
    case "bugfix":
      return "k-red";
    case "datafix":
      return "k-amber";
    case "feature":
      return "k-cyan";
    case "ops":
      return "k-violet";
    case "policy":
      return "k-emerald";
    case "maintenance":
      return "k-blue";
    default:
      return "k-gray";
  }
}
