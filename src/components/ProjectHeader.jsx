import React from "react";
import { Link } from "react-router-dom";
import useReveal from "../hooks/useReveal";
import "./../css/components/ProjectHeader.css";


export default function Home({ projects }) {
  const reveal = useReveal();

  return (
    <main className="wrap">
      <div className="bg">
        <span className="blob b1" />
        <span className="blob b2" />
      </div>

      {/* Hero */}
      <header className="hero" ref={reveal}>
        <div className="avatar-ring pulse">
          <img className="avatar" src="/images/profile.jpg"/>
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
          <Link to="/" className="more">
            전체 보기 →
          </Link>
        </div>

        {projects.length === 0 ? (
          <p className="empty">아직 등록된 프로젝트가 없습니다.</p>
        ) : (
          <div className="grid">
            {projects.map((p, i) => (
              <article
                className="card glass hover-raise"
                key={p.id}
                ref={reveal}
              >
                <div className="card-body">
                  <h3 className="card-title">{p.title}</h3>

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
                    <Link className="btn tiny ghost" to={`/project/${i}`}>
                      상세
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
