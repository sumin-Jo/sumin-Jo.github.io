import React, { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import "./../css/components/ProjectModal.css";

export default function ProjectModal({ project, onClose }) {
  const dialogRef = useRef(null);
  const closeBtnRef = useRef(null);
  const lastFocusedRef = useRef(null);

  const uid = useId();
  const titleId = `pm-title-${uid}`;
  const descId  = `pm-desc-${uid}`;

  // 열릴 때: ESC, 포커스 트랩, 스크롤 잠금
  useEffect(() => {
    if (!project) return;

    lastFocusedRef.current = document.activeElement;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    (closeBtnRef.current ||
      dialogRef.current?.querySelector(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      ))?.focus();

    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose?.();
      }
      if (e.key === "Tab" && dialogRef.current) {
        const focusables = Array.from(
          dialogRef.current.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          )
        ).filter((el) => !el.hasAttribute("disabled"));
        if (!focusables.length) return;
        const first = focusables[0];
        const last  = focusables[focusables.length - 1];
        if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
        if ( e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus();  }
      }
    };
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKeyDown);
      lastFocusedRef.current && lastFocusedRef.current.focus?.();
    };
  }, [project, onClose]);

  if (!project) return null;

  // 데이터 파싱 ('/' 또는 ',' 구분)
  const techs = String(project.stack || "")
    .split(/[\/,]/)
    .map((t) => t.trim())
    .filter(Boolean);

  const tools = String(project.dev_tools || "")
    .split(/[\/,]/)
    .map((t) => t.trim())
    .filter(Boolean);

  const cover = project.cover_url;

  const dialogProps = {
    className: "pm-dialog",
    ref: dialogRef,
    role: "dialog",
    "aria-modal": "true",
    "aria-labelledby": titleId,
    ...(project.description ? { "aria-describedby": descId } : null),
    onMouseDown: (e) => e.stopPropagation(),
  };

return createPortal(
    <div
      className="pm-backdrop"
      role="presentation"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose?.(); }}
    >
      <div {...dialogProps}>
        <div className="pm-accent" aria-hidden="true" />

        <header className="pm-header">
          <div className="pm-titles">
            <h3 id={titleId} className="pm-title">{project.title}</h3>
            {project.work_period && (
              <p className="pm-sub"><span className="pm-period">{project.work_period}</span></p>
            )}
          </div>
          <button ref={closeBtnRef} className="pm-close" type="button" aria-label="닫기" onClick={onClose}>✕</button>
        </header>

        {cover && (
          <div className="pm-cover">
            <img src={cover} alt="" loading="lazy" />
          </div>
        )}

        <div className="pm-body">
          {/* ===== 본문 ===== */}
          <main className="pm-main">
          {project.description && (
            <section className="pm-block">
              <h4 className="pm-h4">개요</h4>
              <p id={descId}>{project.description}</p>
            </section>
          )}

          {!!project.role_contribution && (
            <section className="pm-block">
              <h4 className="pm-h4">역할</h4>
              <p>{project.role_contribution}</p>
            </section>
          )}

          {project.work_result && (
            <section className="pm-block">
              <h4 className="pm-h4">결과</h4>
              <p>{project.work_result}</p>
            </section>
          )}

          {(project.repo || project.demo) && (
            <section className="pm-block">
              <h4 className="pm-h4">링크</h4>
              <div className="pm-links">
                {project.repo && (
                  <a className="pm-btn" href={project.repo} target="_blank" rel="noreferrer">Repo ↗</a>
                )}
                {project.demo && (
                  <a className="pm-btn ghost" href={project.demo} target="_blank" rel="noreferrer">Demo ↗</a>
                )}
              </div>
            </section>
          )}
        </main>

        {/* 우측 패널: 타이틀 스타일만 단정하게 */}
        <aside className="pm-aside">
          {techs.length > 0 && (
            <section className="pm-panel">
              <h5 className="pm-h5">기술</h5>
              <div className="pm-chip-list">
                {techs.map((t) => <span key={`tech-${t}`} className="pm-chip">{t}</span>)}
              </div>
            </section>
          )}
          {tools.length > 0 && (
            <section className="pm-panel">
              <h5 className="pm-h5">Tools</h5>
              <div className="pm-chip-list">
                {tools.map((t) => <span key={`tool-${t}`} className="pm-chip alt">{t}</span>)}
              </div>
            </section>
          )}
        </aside>
        </div>
      </div>
    </div>,
    document.body
  );
}
