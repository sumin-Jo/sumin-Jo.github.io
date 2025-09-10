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

  // ===== Accent color (category -> HEX) =====
  const accent = accentColor(item?.category);

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
          <StatBlock value={year} label="YEAR" ariaLabel={`연도 ${year}`} accent={accent} />
          <StatBlock value={impactLabel} label="건수" ariaLabel={`건수 ${impactLabel}건`} accent={accent} />
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
                <StatBlock value={year} label="YEAR" ariaLabel={`연도 ${year}`} accent={accent} />
                <StatBlock value={impactLabel} label="건수" ariaLabel={`건수 ${impactLabel}건`} accent={accent} />
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
function StatBlock({ value, label, ariaLabel, accent }) {
  return (
    <div
      className="stat-block"
      role="group"
      aria-label={ariaLabel}
      style={{ '--accent': accent }}
    >
      <div className="stat-block-num" aria-hidden="true">{value}</div>
      <div className="stat-block-label">{label}</div>
    </div>
  );
}

/* 카테고리 -> 배지 클래스 */
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

/* 카테고리 -> 포인트 색(배지와 동일 팔레트) */
function accentColor(c){
  switch(c){
    case "bugfix": return "#ef4444";
    case "datafix": return "#f59e0b";
    case "feature": return "#06b6d4";
    case "ops": return "#8b5cf6";
    case "policy": return "#10b981";
    case "maintenance": return "#3b82f6";
    default: return "#6b7280";
  }
}
