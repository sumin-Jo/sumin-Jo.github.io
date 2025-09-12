import React, { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import "../../css/components/pages/work_card.css";

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

  // ===== Derived values =====
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

  const accent = accentColor(item?.category);
  const badgeKey = colorKey(item?.category);

  // ===== Accessibility / Focus lock =====
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
      <article
        className="work-card v2"
        data-year={year}
        style={{ "--accent": accent }}
        onClick={openModal}
        aria-labelledby={titleId}
      >
        {/* Year ribbon (always visible) */}
        <div className="wc-year-ribbon" aria-hidden="true">
          <span className="wc-year-text">{item.year}</span>
        </div>

        {/* Category tag (top-left) */}
        <div className="wc-topline">
          <span className={`badge ${badgeKey}`}>{item.category}</span>
        </div>

        {/* Title & desc */}
        <h3 id={titleId} className="wc-title">
          {item.title}
        </h3>
        <p className="wc-desc">{item.description}</p>

        {/* Footer summary row */}
        <div className="wc-footer">
          <div className="wc-metric">
            <span className="wc-metric-label">건수</span>
            <span
              className="wc-metric-num"
              aria-label={`건수 ${impactLabel}건`}
            >
              {impactLabel}
            </span>
          </div>
          <div className="wc-stack" title={item.stack}>
            {item.stack}
          </div>
        </div>
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
              className="work-dialog v4"
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              aria-describedby={`${descId}-v4`}
              onMouseDown={(e) => e.stopPropagation()}
              style={{ "--accent": accent }}
            >
              <header className="work-dialog-head-v4">
                <div className="work-dialog-meta">
                  <span className={`badge ${badgeKey}`}>{item.category}</span>

                  {/* 기존 year-impact-combined 대신 */}
                  <div
                    className="year-impact"
                    aria-label={`연도 ${year}, 총 ${impactLabel}건`}
                  >
                    <span className="yi-chip">
                      <span className="yi-year">{year}</span>
                      <span className="yi-sep" aria-hidden="true">
                        ·
                      </span>
                      <span className="yi-impact">
                        <strong className="num">{impactLabel}</strong>
                        <span className="unit">건</span>
                      </span>
                    </span>
                  </div>

                  {(item?.work_company || item?.work_period) && (
                    <div className="meta-chips-v4" aria-hidden="true">
                      {item?.work_company && (
                        <span className="meta-chip-v4">
                          {item.work_company}
                        </span>
                      )}
                      {item?.work_period && (
                        <span className="meta-chip-v4">{item.work_period}</span>
                      )}
                    </div>
                  )}
                </div>

                <h3 id={titleId} className="title-v4">
                  {item.title}
                </h3>
                {item?.stack && <p className="sub-v4">{item.stack}</p>}
              </header>

              <section className="work-dialog-body-v4">
                <p id={`${descId}-v4`} className="desc-lg">
                  {item.description}
                </p>
              </section>

              <footer className="work-dialog-footer-v4">
                <button
                  type="button"
                  ref={closeBtnRef}
                  onClick={closeModal}
                  className="close-btn-v4"
                  aria-label="모달 닫기"
                  title="닫기"
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

/* ===== Utils (keep same as before) ===== */
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

function accentColor(c) {
  switch (c) {
    case "bugfix":
      return "#ef4444";
    case "datafix":
      return "#f59e0b";
    case "feature":
      return "#06b6d4";
    case "ops":
      return "#8b5cf6";
    case "policy":
      return "#10b981";
    case "maintenance":
      return "#3b82f6";
    default:
      return "#6b7280";
  }
}
