import React, { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";

export default function WorkCard({ item = {} }) {
  const [open, setOpen] = useState(false);

  const uid = useId();
  const titleId = `work-title-${uid}`;
  const descId = `work-desc-${uid}`;

  const dialogRef = useRef(null);
  const closeBtnRef = useRef(null);
  const lastFocusedRef = useRef(null);

  const openModal = () => setOpen(true);
  const closeModal = () => setOpen(false);

  // ===== Derived values: Year/Count =====
  const year = (() => {
    const s = (item?.work_at ?? "").toString();
    if (s.length >= 4 && /^\d{4}/.test(s)) return s.slice(0, 4);
    const d = new Date(item?.work_at);
    return Number.isFinite(d.getTime()) ? String(d.getFullYear()) : "—";
  })();

  const impactCount = (() => {
    const n = Number(item?.impact);
    return Number.isFinite(n) && n >= 0 ? n : 0;
  })();
  const impactLabel = new Intl.NumberFormat("ko-KR").format(impactCount);

  // ===== Accessibility/Focus Lock =====
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
          e.preventDefault(); first.focus();
        } else if (e.shiftKey && document.activeElement === first) {
          e.preventDefault(); last.focus();
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
        <div className="meta-line">
          <span className={`badge ${colorKey(item.category)}`}>{item.category}</span>
          <span className="sub">{item.stack}</span>
        </div>

        <h3 className="ttl">{item.title}</h3>
        <p className="desc">{item.description}</p>

        {/* ===== Metric Blocks (Card) ===== */}
        <div className="meta-stats blocks">
          <StatBlock value={year} label="YEAR" ariaLabel={`연도 ${year}`} />
          <StatBlock value={impactLabel} label="건수" ariaLabel={`건수 ${impactLabel}건`} />
        </div>
      </article>

      {open && createPortal(
        <div className="work-modal" role="presentation"
             onMouseDown={(e) => { if (e.target === e.currentTarget) closeModal(); }}>
          <div
            ref={dialogRef}
            className="work-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={descId}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <header className="work-dialog-head">
              <div className="work-dialog-left">
                <span className={`badge ${colorKey(item.category)}`}>{item.category}</span>
                <h3 id={titleId}>{item.title}</h3>
                <p className="sub">{item.stack}</p>
              </div>
            </header>

            <section>
              <p id={descId} className="desc-lg">{item.description}</p>
            </section>

            <footer>
              {/* ===== Metric Blocks (Modal - bigger) ===== */}
              <div className="meta-stats blocks lg">
                <StatBlock value={year} label="YEAR" ariaLabel={`연도 ${year}`} />
                <StatBlock value={impactLabel} label="건수" ariaLabel={`건수 ${impactLabel}건`} />
              </div>

              <button type="button" ref={closeBtnRef} onClick={closeModal} className="close-btn">
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

/* ===== New Mini Component: Metric Block ===== */
function StatBlock({ value, label, ariaLabel }) {
  return (
    <div className="stat-block" role="group" aria-label={ariaLabel}>
      <div className="stat-block-num" aria-hidden="true">{value}</div>
      <div className="stat-block-label">{label}</div>
    </div>
  );
}

function CalendarIcon(){return(<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M7 2a1 1 0 0 0 0 2h1V2H7Zm9 0v2h1a1 1 0 1 0 0-2h-1ZM3 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v11a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V7Zm2 2v9a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9H5Z"/></svg>);}
function BoltIcon(){return(<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M13 2 3 14h6l-2 8 10-12h-6l2-8z"/></svg>);}

function colorKey(c){
  switch(c){
    case "bugfix": return "k-red";
    case "datafix": return "k-amber";
    case "feature": return "k-cyan";
    case "ops": return "k-violet";
    case "policy": return "k-emerald";
    case "maintenance": return "k-blue";
    default: return "k-gray";
  }
}
