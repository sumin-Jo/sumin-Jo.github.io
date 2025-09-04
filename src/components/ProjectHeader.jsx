import React from "react";
import { Link } from "react-router-dom";
import useReveal from "../hooks/useReveal";
import "./../css/components/ProjectHeader.css";

export default function Home({ projects = [] }) {
  const reveal = useReveal();

  // 홈에서는 상위 6개만 노출
  const top6 = Array.isArray(projects) ? projects.slice(0, 6) : [];
  const hasMore = Array.isArray(projects) && projects.length > 6;

  return (
    <main className="wrap">
      <div className="bg">
        <span className="blob b1" />
        <span className="blob b2" />
      </div>

      <header className="hero" ref={reveal}>
        <div className="avatar-ring pulse">
          <div className="avatar-text-container">
            <span className="name-line" id="line1">
              <span className="char">S</span>
              <span className="char">u</span>
              <span className="char">m</span>
              <span className="char">i</span>
              <span className="char">n</span>
            </span>

            <span className="name-line" id="line2">
              <span className="char">J</span>
              <span className="char">o</span>
            </span>
          </div>
        </div>

        <div className="content">
          <h1 className="title">
            <span className="typing">
              <span className="grad">비즈니스 가치를 구현하는 개발자</span>
            </span>
          </h1>
          <p className="subtitle">조수민</p>

          <div className="badges">
            <span className="badge">Open to opportunities</span>
            <span className="badge alt">Seoul · KR</span>
          </div>

          <nav className="cta">
            <a href="mailto:suminjo725@gmail.com" className="btn ghost">Email</a>
            <a href="https://github.com/sumin-Jo" target="_blank" rel="noreferrer" className="btn ghost">GitHub</a>
            <button
              className="theme-toggle"
              onClick={() => document.body.classList.toggle("light")}
              aria-label="테마 전환"
              title="테마 전환"
            >
              🌙 / ☀️
            </button>
          </nav>
        </div>
      </header>

      {/* Projects */}
      <section ref={reveal}>
        <div className="section-head">
          <h2>프로젝트</h2>

          {/* 6개 초과 시에만 '더보기' 노출 */}
          {hasMore && (
            <Link to="/projects" className="more" aria-label="프로젝트 전체 보기">
              더보기 →
            </Link>
          )}
        </div>

        {top6.length === 0 ? (
          <p className="empty">아직 등록된 프로젝트가 없습니다.</p>
        ) : (
          <div className="grid">
            {top6.map((p, i) => (
              <article
                className="card glass hover-raise"
                key={p.id ?? `proj-${i}`}
                ref={reveal}
              >
                <div className="card-body">
                  <h3 className="card-title">{p.title}</h3>

                  {/* 회사명 + 기간 */}
                  {(p.work_company || p.work_period) && (
                    <div className="meta">
                      {p.work_company && (
                        <span className="badge company-badge">{p.work_company}</span>
                      )}
                      {p.work_period && (
                        <span className="period">{p.work_period}</span>
                      )}
                    </div>
                  )}
                  
                  {/* 기술 스택 */}
                  {p.stack && (
                    <div className="stack">
                      {p.stack.split(",").map((tech) => (
                        <span key={tech.trim()} className="badge tech">
                          {tech.trim()}
                        </span>
                      ))}
                    </div>
                  )}

                  {p.description && <p className="desc">{p.description}</p>}

                  <div className="links">
                    {p.repo && (
                      <a
                        className="btn tiny"
                        href={p.repo}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Repo ↗
                      </a>
                    )}
                    {p.demo && (
                      <a
                        className="btn tiny"
                        href={p.demo}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Demo ↗
                      </a>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* 하단에도 '더보기' 버튼 (모바일 고려) */}
        {hasMore && (
          <div className="section-foot">
            <Link to="/projects" className="btn ghost">
              프로젝트 전체 보기
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}
