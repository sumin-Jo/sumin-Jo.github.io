import React from "react";
import { Link, useParams } from "react-router-dom";
import useReveal from "../hooks/useReveal";
import "./../css/components/ProjectDetail.css";

function getImg(p) {
  return p?.image_url || p?.image_path || "/images/profile.jpg";
}

export default function ProjectDetail({ projects }) {
  const { idx } = useParams();
  const p = projects[Number(idx)];
  const reveal = useReveal();

  if (!p)
    return (
      <main className="wrap">
        <p className="empty">프로젝트를 찾을 수 없습니다.</p>
      </main>
    );

  return (
    <main className="wrap">
      <Link to="/" className="back">
        ← 목록으로
      </Link>

      <div className="detail" ref={reveal}>
        <img className="detail-hero" src={getImg(p)} alt={p.title} />
        <h1 className="title">{p.title}</h1>
        {p.stack && <p className="meta">{p.stack}</p>}
        {p.description && <p className="desc">{p.description}</p>}

        <div className="links">
          {p.repo && (
            <a className="btn" href={p.repo} target="_blank" rel="noreferrer">
              GitHub ↗
            </a>
          )}
          {p.demo && (
            <a className="btn" href={p.demo} target="_blank" rel="noreferrer">
              Demo ↗
            </a>
          )}
        </div>
      </div>
    </main>
  );
}
