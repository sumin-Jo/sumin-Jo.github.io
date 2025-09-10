// src/components/pages/WorksAll.jsx
import React, { useEffect, useMemo, useRef, useState, useLayoutEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import WorksBoard from "./WorksBoard";
import "../../css/components/pages/works_all.css";

const PAGE_SIZE = 12;
const SCROLL_OFFSET = 88;

export default function WorksAll() {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const titleRef = useRef(null);
  const wrapRef = useRef(null);        // CSS 변수 주입용

  const page = useMemo(() => {
    const n = parseInt(params.get("page") || "1", 10);
    return Number.isNaN(n) || n < 1 ? 1 : n;
  }, [params]);

  const [totalCount, setTotalCount] = useState(0);
  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(totalCount / PAGE_SIZE)),
    [totalCount]
  );

  // 총 개수
  useEffect(() => {
    let mounted = true;
    (async () => {
      const { count, error } = await supabase
        .from("portfolio_works")
        .select("*", { count: "exact", head: true });
      if (!mounted) return;
      setTotalCount(error ? 0 : (count || 0));
    })();
    return () => { mounted = false; };
  }, []);

  // 필터 높이 측정 → CSS 변수(--filters-h) 주입
  useEffect(() => {
    const applyFilterHeight = () => {
      const wrap = wrapRef.current;
      if (!wrap) return;
      const filtersEl = document.querySelector(".works-filters");
      const h = filtersEl ? filtersEl.getBoundingClientRect().height : 0;
      wrap.style.setProperty("--filters-h", `${Math.max(0, Math.round(h))}px`);
    };
    applyFilterHeight();

    // 윈도우 리사이즈 시 재계산
    window.addEventListener("resize", applyFilterHeight);
    // 폰트 로드/이미지 로드 등 레이아웃 변동에도 한번 더
    window.addEventListener("load", applyFilterHeight);

    // 필터 내부 변화 감지(옵션)
    const filtersEl = document.querySelector(".works-filters");
    let obs;
    if (filtersEl && "MutationObserver" in window) {
      obs = new MutationObserver(applyFilterHeight);
      obs.observe(filtersEl, { childList: true, subtree: true, attributes: true });
    }

    return () => {
      window.removeEventListener("resize", applyFilterHeight);
      window.removeEventListener("load", applyFilterHeight);
      if (obs) obs.disconnect();
    };
  }, []);

  // 페이지 변경 시 스크롤을 제목으로 이동(상단 여백 고려)
  useLayoutEffect(() => {
    if (titleRef.current) {
      const y = titleRef.current.getBoundingClientRect().top + window.scrollY - SCROLL_OFFSET;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  }, [page]);

  const onPageChange = (next) => {
    setParams(prev => { prev.set("page", String(next)); return prev; }, { replace: false });
    if (titleRef.current) {
      const y = titleRef.current.getBoundingClientRect().top + window.scrollY - SCROLL_OFFSET;
      window.scrollTo({ top: y, behavior: "auto" });
    }
  };

  return (
    <section ref={wrapRef} className="works-wrap">
      <div className="works-inner">
        <header className="worksall-hero">
          <div>
            <h1 ref={titleRef} className="worksall-title">Work Experience</h1>
            <div className="worksall-sub">총 {totalCount}건 · 페이지 {page}/{totalPages}</div>
          </div>

          {/* ← ProjectsAll 스타일 이식: 고정 액션버튼 */}
          <div className="worksall-actions" role="toolbar" aria-label="페이지 액션">
            <button
              type="button"
              className="btn tiny ghost"
              onClick={() => navigate(-1)}
              aria-label="뒤로가기"
            >
              ← 뒤로
            </button>
            <Link className="btn tiny" to="/" aria-label="메인으로">메인으로</Link>
          </div>
        </header>

        <WorksBoard
          all
          hideFilters={false}
          page={page}
          pageSize={PAGE_SIZE}
          onPageChange={onPageChange}
        />
      </div>
    </section>
  );
}
