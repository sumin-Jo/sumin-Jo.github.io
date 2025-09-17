import React, { useEffect, useMemo, useState, useRef } from "react";
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

/** 팔레트 키 매핑 */
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

/** 미디어 조건 */
const isReduced = () =>
  typeof window !== "undefined" &&
  window.matchMedia &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** 반응형 오프셋(고정 헤더 등 보정) */
function getScrollOffset() {
  if (typeof window === "undefined") return 100;
  const w = window.innerWidth || 1024;
  if (w <= 480) return 68;        // iPhone 14 Pro Max/세로 기준
  if (w <= 640) return 80;
  if (w <= 768) return 92;
  return 100;
}

/** 안전 스크롤 */
function smoothScrollTo(el, offset = 100) {
  if (!el) return;
  const y = el.getBoundingClientRect().top + window.pageYOffset - offset;
  window.scrollTo({
    top: Math.max(0, y),
    behavior: isReduced() ? "auto" : "smooth",
  });
  if (typeof el.focus === "function") el.focus({ preventScroll: true });
}

export default function WorkHistory({ showMoreHref, all = true, limit = 9 }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [scrollOffset, setScrollOffset] = useState(getScrollOffset());
  const tickingRef = useRef(false);

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
        .order("work_at", { ascending: false, nullsFirst: false })
        .order("id", { ascending: false });

      if (!all) query = query.limit(limit);

      const { data, error } = await query;

      if (!mounted) return;

      if (error) {
        setErr(error.message || "fetch error");
        setItems([]);
      } else {
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

  // 스크롤 스파이 (모바일에서 부하 낮춤)
  useEffect(() => {
    const onScroll = () => {
      if (tickingRef.current) return;
      tickingRef.current = true;
      requestAnimationFrame(() => {
        const sections = document.querySelectorAll('[id^="year-"]');
        const links = document.querySelectorAll(".wh-nav a");
        let current = "";
        const offset = getScrollOffset();
        sections.forEach((sec) => {
          const top = sec.getBoundingClientRect().top + window.scrollY;
          if (window.scrollY >= top - offset - 8) current = sec.id;
        });
        links.forEach((a) => {
          a.classList.remove("is-active");
          if (current && a.getAttribute("data-target") === current) {
            a.classList.add("is-active");
          }
        });
        tickingRef.current = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [years]);

  // 리사이즈 시 오프셋 갱신
  useEffect(() => {
    const onResize = () => setScrollOffset(getScrollOffset());
    window.addEventListener("resize", onResize, { passive: true });
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // 왼쪽 메뉴 클릭 → 부드러운 스크롤
  const onNavClick = (y, e) => {
    if (e) e.preventDefault();
    const id = `year-${y}`;
    const el = document.getElementById(id);
    if (el) smoothScrollTo(el, scrollOffset);
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
      if (el) requestAnimationFrame(() => smoothScrollTo(el, scrollOffset));
    };
    if (!loading) handleHash();
    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
  }, [loading, years, scrollOffset]);

  return (
    <div className="wh-root">
      <div className="wh-container">
        {/* 사이드바 */}
        <aside className="wh-sidebar" aria-label="연도별 보기 사이드바">
          <div className="wh-side-title">연도별 보기</div>
          <ul className="wh-nav" id="year-nav-menu" role="tablist">
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
                  <h3 id={`year-${y}`} className="wh-year" tabIndex="-1">
                    {y}
                  </h3>
                  {(grouped[y] || []).map((item) => {
                    const palette = colorKey(item.category);
                    const stacks = String(item.stack || "")
                      .split("/")
                      .map((s) => s.trim())
                      .filter(Boolean);
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

                          {!!stacks.length && (
                            <div className="wh-tags" aria-label="기술 스택 태그">
                              {stacks.map((s, i) => (
                                <span key={`${item.id}-tag-${i}`} className="wh-tag">
                                  {s}
                                </span>
                              ))}
                            </div>
                          )}

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
