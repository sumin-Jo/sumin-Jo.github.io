import React from "react";

const CATE = ["bugfix", "datafix", "feature", "ops", "policy", "maintenance"];

export default function WorkFilters({
  q, setQ,
  categories, setCategories,
  stack, setStack,
  sort, setSort,
  meta
}) {
  const toggleCat = (c) => {
    if (categories.includes(c)) setCategories(categories.filter(v => v !== c));
    else setCategories([...categories, c]);
  };

  return (
    <div className="works-filters">
      <div className="row search-row">
        <input
          className="search-input"
          placeholder="검색: 제목·설명"
          value={q}
          onChange={e => setQ(e.target.value)}
        />
        <select className="sort-select" value={sort} onChange={e => setSort(e.target.value)}>
          <option value="recent">최신순</option>
          <option value="title">제목순</option>
        </select>
      </div>

      <div className="row chips-row">
        {CATE.map(c => (
          <button
            key={c}
            className={`chip ${categories.includes(c) ? "on" : ""}`}
            onClick={() => toggleCat(c)}
          >
            {iconFor(c)} {c}
          </button>
        ))}
      </div>

      <div className="row selects-row">
        <select value={stack} onChange={e => setStack(e.target.value)}>
          <option value="">전체 스택</option>
          {meta.stacks.map(s => <option key={s} value={s}>{s}</option>)}
        </select>

        {(categories.length > 0 || stack || q) && (
          <button
            className="reset-btn"
            onClick={() => { setQ(""); setCategories([]); setStack("");  }}
          >
            초기화
          </button>
        )}
      </div>
    </div>
  );
}

function iconFor(c) {
  switch (c) {
    case "bugfix": return "🐞";
    case "datafix": return "🧮";
    case "feature": return "✨";
    case "ops": return "⚙️";
    case "policy": return "📜";
    case "maintenance": return "🧰";
    default: return "🔹";
  }
}
