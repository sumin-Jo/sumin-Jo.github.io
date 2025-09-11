import React from "react";
import { Link } from "react-router-dom";
import useReveal from "../hooks/useReveal";
import ProjectModal from "../components/ProjectModal";
import "./../css/components/ProjectHeader.css";

export default function Home({ projects = [] }) {
  const reveal = useReveal();

  // 모달 상태
  const [selected, setSelected] = React.useState(null);
  React.useEffect(() => {
    document.body.style.overflow = selected ? "hidden" : "";
  }, [selected]);

  const onClose = React.useCallback(() => setSelected(null), []);
  const onCardClick = React.useCallback((p) => setSelected(p), []);

  // 서버 정렬 결과에서 상위 6개만
  const top6 = React.useMemo(() => {
    const arr = Array.isArray(projects) ? projects : [];
    return arr.slice(0, 6);
  }, [projects]);

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
          </div>

          <div className="contact-bar">
            <a href="mailto:suminjo725@gmail.com" className="chip" aria-label="이메일 보내기">
              <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                <path d="M4 6h16a2 2 0 0 1 2 2v.35l-10 6.25L2 8.35V8a2 2 0 0 1 2-2zm18 4.2V16a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-5.8l10 6.25 10-6.25z" />
              </svg>
              <span>suminjo725@gmail.com</span>
            </a>

            <a
              href="https://github.com/sumin-Jo"
              target="_blank"
              rel="noreferrer"
              className="chip"
              aria-label="GitHub 열기"
            >
              <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                <path d="M12 0a12 12 0 0 0-3.79 23.4c.6.11.82-.26.82-.58v-2.1c-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.09-.76.08-.75.08-.75 1.2.09 1.83 1.23 1.83 1.23 1.07 1.83 2.8 1.3 3.48.99.11-.78.42-1.3.76-1.6-2.67-.3-5.47-1.34-5.47-5.96 0-1.32.47-2.39 1.23-3.24-.12-.3-.54-1.52.12-3.17 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.3-1.55 3.3-1.23 3.3-1.23.66 1.65.24 2.87.12 3.17.77.85 1.23 1.92 1.23 3.24 0 4.63-2.8 5.66-5.48 5.96.43.37.81 1.1.81 2.22v3.29c0 .32.21.7.82.58A12 12 0 0 0 12 0z" />
              </svg>
              <span>GitHub</span>
            </a>

            <span className="chip" aria-label="위치">
              <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                <path d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z" />
              </svg>
              <span>Gwangjin-gu, Seoul</span>
            </span>
          </div>

          <nav className="cta">
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
        </div>

        {top6.length === 0 ? (
          <p className="empty">아직 등록된 프로젝트가 없습니다.</p>
        ) : (
          <div className="works-board home-wide">
            {top6.map((p, i) => {
              const techs = (p.stack || "")
                .split("/")
                .map((t) => t.trim())
                .filter(Boolean);

              return (
                <article
                  className="card glass hover-raise"
                  key={p.id ?? `proj-${i}`}
                  ref={reveal}
                  aria-label={p.title}
                  role="button"
                  tabIndex={0}
                  onClick={() => onCardClick(p)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") onCardClick(p);
                  }}
                >
                  {p.cover_url && (
                    <div
                      className="card-cover"
                      style={{
                        aspectRatio: "21 / 9",
                        overflow: "hidden",
                        borderTopLeftRadius: 16,
                        borderTopRightRadius: 16,
                      }}
                    >
                      <img
                        src={p.cover_url}
                        alt=""
                        loading="lazy"
                        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                      />
                    </div>
                  )}

                  <div className="card-body">
                    <h3 className="card-title">{p.title}</h3>

                    {p.work_period && (
                      <div className="meta">
                        <span className="period">{p.work_period}</span>
                      </div>
                    )}

                    {techs.length > 0 && (
                      <div className="stack" aria-label="사용 기술">
                        {techs.map((t) => (
                          <span key={t} className="badge tech">{t}</span>
                        ))}
                      </div>
                    )}

                    {p.role_contribution && <p className="desc">{p.role_contribution}</p>}

                    {p.work_result && (
                      <p className="desc" style={{ marginTop: 6 }}>
                        <strong>결과</strong> · {p.work_result}
                      </p>
                    )}

                    {(p.repo || p.demo) && (
                      <div className="links" onClick={(e) => e.stopPropagation()}>
                        {p.repo && (
                          <a className="btn tiny" href={p.repo} target="_blank" rel="noreferrer">Repo ↗</a>
                        )}
                        {p.demo && (
                          <a className="btn tiny" href={p.demo} target="_blank" rel="noreferrer">Demo ↗</a>
                        )}
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {hasMore && (
          <div className="section-foot">
            <Link to="/projects" className="btn ghost" aria-label="프로젝트 전체 보기">
              프로젝트 전체 보기
            </Link>
          </div>
        )}
      </section>

      {/* 외부 모달 컴포넌트 사용 */}
      <ProjectModal project={selected} onClose={onClose} />
    </main>
  );
}
