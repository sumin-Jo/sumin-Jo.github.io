// src/components/pages/WorkHistory.jsx
import React, { useEffect, useMemo, useState } from "react";
import "../../css/components/pages/work_history.css";
import { supabase } from "../../lib/supabaseClient";

/** 연도 계산 */
function resolveYear(item) {
  const s = String(item?.work_at ?? "");
  const m = s.match(/^(\d{4})/);
  if (m) return Number(m[1]);
  const d = new Date(s);
  if (!Number.isNaN(d.getTime())) return d.getFullYear();
  const cd = new Date(item?.created_at ?? Date.now());
  return cd.getFullYear();
}

/** 팔레트 키 매핑 (CSS .k-* 와 1:1 대응) */
function colorKey(c) {
  switch ((c || "").toLowerCase()) {
    case "bugfix":      return "k-red";
    case "datafix":     return "k-amber";
    case "feature":     return "k-cyan";
    case "ops":         return "k-violet";
    case "policy":      return "k-emerald";
    case "maintenance": return "k-blue";
    default:            return "k-gray";
  }
}

/** 안전 스크롤 (고정 헤더/필터 높이 보정) */
function smoothScrollTo(el, offset = 100) {
  if (!el) return;
  const y = el.getBoundingClientRect().top + window.pageYOffset - offset;
  window.scrollTo({ top: Math.max(0, y), behavior: "smooth" });
  // 접근성: 시각 포커스 이동(필요 없으면 주석 처리)
  if (typeof el.focus === "function") el.focus({ preventScroll: true });
}

export default function WorkHistory({ showMoreHref, all = false, limit = 9 }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  // 데이터 로드
  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setErr(null);

      const cols =
        "id, title, description, category, stack, impact, work_at, work_period, visibility, created_at";

      let query = supabase
        .from("portfolio_works")
        .select(cols, { count: "exact" })
        .or("visibility.is.true,visibility.eq.true,visibility.eq.Y,visibility.eq.1")
        .order("work_at", { ascending: false, nullsFirst: false })
        .order("id", { ascending: false });

      if (!all) query = query.limit(limit);

      const { data, error } = await query;

      if (!mounted) return;

      if (error) {
        console.log("[WorkHistory] fetch error:", error);
        setErr(error.message || "fetch error");
        setItems([]);
      } else {
        console.log("[WorkHistory] rows:", data?.length ?? 0, "sample:", data?.[0]);
        setItems(data || []);
      }
      setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, [all, limit]);

  // 연도별 그룹화
  const { years, grouped } = useMemo(() => {
    const g = (items || []).reduce((acc, it) => {
      const y = resolveYear(it);
      if (!acc[y]) acc[y] = [];
      acc[y].push(it);
      return acc;
    }, {});
    const ys = Object.keys(g)
      .map(Number)
      .sort((a, b) => b - a);
    return { years: ys, grouped: g };
  }, [items]);

  // 스크롤 스파이
  useEffect(() => {
    const onScroll = () => {
      const sections = document.querySelectorAll('[id^="year-"]');
      const links = document.querySelectorAll(".wh-nav a");
      let current = "";
      sections.forEach((sec) => {
        const top = sec.getBoundingClientRect().top + window.scrollY;
        if (window.scrollY >= top - 100) current = sec.id;
      });
      links.forEach((a) => {
        a.classList.remove("is-active");
        if (current && a.getAttribute("data-target") === current) {
          a.classList.add("is-active");
        }
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [years]);

  // 왼쪽 메뉴 클릭 → 부드러운 스크롤 (해시 라우터 충돌 방지)
  const onNavClick = (y, e) => {
    if (e) e.preventDefault();
    const id = `year-${y}`;
    const el = document.getElementById(id);
    if (el) smoothScrollTo(el, 100);
    if (history && history.replaceState) {
      history.replaceState(null, "", `#${id}`);
    }
  };

  // 초기 진입/해시 변경 시 해당 연도로 이동
  useEffect(() => {
    const handleHash = () => {
      const h = (window.location.hash || "").replace(/^#/, "");
      if (!h) return;
      const el = document.getElementById(h);
      if (el) {
        // 목록/섹션 렌더 완료 보장 후 스크롤
        requestAnimationFrame(() => smoothScrollTo(el, 100));
      }
    };
    // 데이터 그룹 렌더링이 끝난 뒤에 처리
    if (!loading) handleHash();
    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
  }, [loading, years]);

  return (
    <div className="wh-root">
      <div className="wh-container">
        {/* 사이드바 */}
        <aside className="wh-sidebar">
          <div className="wh-side-title">연도별 보기</div>
          <ul className="wh-nav" id="year-nav-menu">
            {years.map((y) => (
              <li key={y}>
                <a
                  href={`#year-${y}`}
                  data-target={`year-${y}`}
                  onClick={(e) => onNavClick(y, e)}
                  role="button"
                  aria-label={`${y}년으로 이동`}
                >
                  {y}년
                </a>
              </li>
            ))}
            {!loading && years.length === 0 && <li className="wh-meta">표시할 항목이 없습니다.</li>}
          </ul>
        </aside>

        {/* 메인 */}
        <main className="wh-main">
          <div className="wh-timeline">
            {/* 로딩 스켈레톤 */}
            {loading && (
              <>
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="wh-card">
                    <div className="wh-dot" />
                    <div className="wh-card-inner">
                      <div className="wh-skel-row">
                        <div className="wh-skel lg wh-w-120" />
                        <div className="wh-skel wh-w-60p" />
                        <div className="wh-skel wh-w-85p" />
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}

            {/* 본문 */}
            {!loading &&
              years.map((y) => (
                <section key={y}>
                  {/* 포커스 가능 + 스크롤 고정 헤더 피하도록 JS에서 오프셋 처리 */}
                  <h3 id={`year-${y}`} className="wh-year" tabIndex="-1">
                    {y}
                  </h3>
                  {(grouped[y] || []).map((item) => {
                    const palette = colorKey(item.category);
                    return (
                      <article key={item.id} className={`wh-card ${palette}`}>
                        <div className="wh-dot" />
                        <div className="wh-card-inner">
                          <div className="wh-row">
                            <span className={`wh-badge ${palette}`}>
                              {(item.category || "").toUpperCase()}
                            </span>
                            <span className="wh-period">{item.work_period || ""}</span>
                          </div>

                          <h4 className="wh-card-title">{item.title}</h4>
                          <p className="wh-desc">{item.description}</p>

                          <div className="wh-tags">
                            {String(item.stack || "")
                              .split("/")
                              .map((s, i) => (
                                <span key={i} className="wh-tag">
                                  {s.trim()}
                                </span>
                              ))}
                          </div>

                          <div className="wh-impact">실행 건수: {item.impact ?? "—"}</div>
                        </div>
                      </article>
                    );
                  })}
                </section>
              ))}

            {!loading && years.length === 0 && (
              <div className="wh-meta">표시할 항목이 없습니다.</div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
