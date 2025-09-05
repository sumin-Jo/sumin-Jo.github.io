import React, { useState } from "react";

export default function WorkCard({ item }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <article className="work-card" onClick={() => setOpen(true)}>
        <div className={`dot ${colorKey(item.category)}`} />
        <div className="meta-line">
          <span className={`badge ${colorKey(item.category)}`}>{item.category}</span>
          <span className="sub">{item.stack} · {item.work_company}</span>
        </div>
        <h3 className="ttl">{item.title}</h3>
        <p className="desc">{item.description}</p>
      </article>

      {open && (
        <div className="work-modal" onClick={() => setOpen(false)}>
          <div className="work-dialog" onClick={(e) => e.stopPropagation()}>
            <header>
              <span className={`badge ${colorKey(item.category)}`}>{item.category}</span>
              <h3>{item.title}</h3>
              <p className="sub">{item.stack} · {item.work_company}</p>
            </header>
            <section>
              <p className="desc-lg">{item.description}</p>
            </section>
            <footer>
              <button onClick={() => setOpen(false)} className="close-btn">닫기</button>
            </footer>
          </div>
        </div>
      )}
    </>
  );
}

function colorKey(c) {
  switch (c) {
    case "bugfix": return "k-red";
    case "datafix": return "k-amber";
    case "feature": return "k-cyan";
    case "ops": return "k-violet";
    case "policy": return "k-emerald";
    case "maintenance": return "k-blue";
    default: return "k-gray";
  }
}
