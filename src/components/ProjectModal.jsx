// src/components/ProjectModal.jsx
import React, { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import "./../css/components/ProjectModal.css";

export default function ProjectModal({ project, onClose }) {
  const dialogRef = useRef(null);
  const closeBtnRef = useRef(null);
  const lastFocusedRef = useRef(null);

  // a11y: 제목/설명 라벨링 id
  const uid = useId();
  const titleId = `pm-title-${uid}`;
  const descId  = `pm-desc-${uid}`;

  // 모달이 열릴 때: ESC 닫기, 포커스 이동/트랩, 바디 스크롤 잠금, 포커스 복원
  useEffect(() => {
    if (!project) return;

    // 열기 직전 포커스 요소 저장
    lastFocusedRef.current = document.activeElement;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // 최초 포커스: 닫기 버튼 → 없으면 첫 포커서블
    const focusTarget =
      closeBtnRef.current ||
      dialogRef.current?.querySelector(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
    focusTarget?.focus();

    const onKeyDown = (e) => {
      // ESC 닫기
      if (e.key === "Escape") {
        e.preventDefault();
        onClose?.();
        return;
      }

      // Tab 포커스 트랩
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
      // 바디 스크롤 복원 & 핸들러 해제 & 포커스 복귀
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKeyDown);
      lastFocusedRef.current && lastFocusedRef.current.focus?.();
    };
  }, [project, onClose]);

  if (!project) return null;

  // 스택 파싱('/' 기준)
  const techs = String(project.stack || "")
    .split("/")
    .map((t) => t.trim())
    .filter(Boolean);

  // tools 파싱('/' 기준)
  const tools = String(project.dev_tools || "")
    .split("/")
    .map((t) => t.trim())
    .filter(Boolean);   

  const cover = project.cover_url;

  // aria-describedby는 설명이 있을 때만 부여
  const dialogProps = {
    className: "pm-dialog",
    ref: dialogRef,
    role: "dialog",
    "aria-modal": "true",
    "aria-labelledby": titleId,
    ...(project.description ? { "aria-describedby": descId } : null),
    onMouseDown: (e) => e.stopPropagation(), // 내부 클릭은 닫힘 방지
  };

  return createPortal(
    <div
        className="pm-backdrop"
        role="presentation"
        onMouseDown={(e) => { if (e.target === e.currentTarget) onClose?.(); }}
    >
        <div {...dialogProps}>
        {/* 🔹 상단 얇은 그라디언트 라인 */}
        <span className="pm-accent" aria-hidden="true" />

        <header className="pm-header">
            <div className="pm-titles">
            <h3 id={titleId} className="pm-title">{project.title}</h3>

            {/* 🔹 카드와 결 맞춘 서브 메타라인 */}
            {(project.work_period || typeof project.priority !== "undefined") && (
                <p className="pm-sub">
                {project.work_period && <span className="pm-period">{project.work_period}</span>}
                </p>
            )}
            </div>

            <button
            ref={closeBtnRef}
            className="pm-close"
            type="button"
            aria-label="닫기"
            onClick={onClose}
            >
            ✕
            </button>
        </header>

        {cover && (
            <div className="pm-cover">
            <img src={cover} alt="" loading="lazy" />
            </div>
        )}

        {/* 🔹 본문 랩퍼: 좌 내용 / 우 메타(회사, 스택, 링크) */}
        <div className="pm-body">
            <div className="pm-main">
            {project.description && (
                <section className="pm-block">
                <h4>개요</h4>
                <p id={descId}>{project.description}</p>
                </section>
            )}

            {project.work_result && (
                <section className="pm-block">
                <h4>결과</h4>
                <p>{project.work_result}</p>
                </section>
            )}

            {project.impact && (
                <section className="pm-block">
                <h4>임팩트</h4>
                <p>{project.impact}</p>
                </section>
            )}
            </div>

            {/* ▶ 기술/툴을 한 카드 안에, 두 그룹으로 분리 */}
            {(techs.length > 0 || tools.length > 0) && (
            <div className="pm-aside-card pm-stack-card">
                {/* 기술 그룹 */}
                {techs.length > 0 && (
                <div className="pm-chip-group">
                    <div className="pm-chip-group-head">
                    <span className="pm-chip-group-title">기술</span>
                    </div>
                    <div className="pm-chip-group-body">
                    {techs.map((t) => (
                        <span key={`tech-${t}`} className="pm-chip">{t}</span>
                    ))}
                    </div>
                </div>
                )}

                {/* 툴 그룹 */}
                {tools.length > 0 && (
                <>
                    {techs.length > 0 && <div className="pm-chip-group-sep" aria-hidden="true" />}
                    <div className="pm-chip-group">
                    <div className="pm-chip-group-head">
                        <span className="pm-chip-group-title">Tools</span>
                    </div>
                    <div className="pm-chip-group-body">
                        {tools.map((t) => (
                        <span key={`tool-${t}`} className="pm-chip tool-chip">{t}</span>
                        ))}
                    </div>
                    </div>
                </>
                )}
            </div>
            )}


            {(project.repo || project.demo) && (
                <div className="pm-aside-card">
                <div className="pm-aside-title">링크</div>
                <div className="pm-links">
                    {project.repo && (
                    <a className="pm-btn" href={project.repo} target="_blank" rel="noreferrer">
                        Repo ↗
                    </a>
                    )}
                    {project.demo && (
                    <a className="pm-btn" href={project.demo} target="_blank" rel="noreferrer">
                        Demo ↗
                    </a>
                    )}
                </div>
                </div>
            )}
        </div>
        </div>
    </div>,
    document.body
    );
}
