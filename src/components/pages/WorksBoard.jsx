import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import WorkFilters from "./WorkFilters";
import WorkCard from "./WorkCard";

export default function WorksBoard({
  limit = 9,                 // 프리뷰: 9개
  all = false,               // 전체 페이지: true
  hideFilters = false,
  page = 1,                  // 전체보기 모드 현재 페이지
  pageSize = 12,             // 전체보기 페이지 사이즈
  onPageChange               // (num:number)=>void
}) {
  const [items, setItems] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const [q, setQ] = useState("");
  const [categories, setCategories] = useState([]);
  const [stack, setStack] = useState("");
  const [sort, setSort] = useState("recent");

  // 전역 옵션용 스택(토큰) 메타
  const [metaStacks, setMetaStacks] = useState([]);

  const tokenizeStacks = (v) =>
    String(v || "")
      .split("/")
      .map(s => s.trim().toLowerCase())
      .filter(Boolean);

  // 전역 메타 스택 로드 (옵션 안정화)
  const loadStacksMeta = useCallback(async () => {
    const { data, error } = await supabase
      .from("portfolio_works")
      .select("stack"); 

    if (error) {
      console.error("stacks meta fetch error:", error);
      setMetaStacks([]);
      return;
    }
    const tok = new Set();
    (data || []).forEach(row => tokenizeStacks(row.stack).forEach(t => tok.add(t.toUpperCase())));
    setMetaStacks(Array.from(tok)); // 보기엔 대문자
  }, []);

  useEffect(() => { loadStacksMeta(); }, [loadStacksMeta]);

  // 전체보기 모드에서 필터가 바뀌면 1페이지로
  useEffect(() => {
    if (all && onPageChange) onPageChange(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, categories, stack, sort]);

  const buildStackOrExpr = (s) => {
    const esc = s; // 필요시 특수문자 escape 추가 고려
    return [
      `stack.eq.${esc}`,
      `stack.ilike.${esc}`,
      `stack.ilike.${esc}/%`,
      `stack.ilike.${esc} /%`,
      `stack.ilike.%/${esc}`,
      `stack.ilike.%/ ${esc}`,
      `stack.ilike.%/${esc}/%`,
      `stack.ilike.%/ ${esc} /%`
    ].join(",");
  };

  const buildQuery = useCallback(() => {
    let query = supabase
      .from("portfolio_works")
      .select(
        "id, title, description, category, stack, impact, work_at, created_at",
        { count: "exact" }
      );

    // 정렬
    if (sort === "title") query = query.order("title", { ascending: true });
    else query = query.order("id", { ascending: false });

    // 검색/필터
    if (q && q.trim() !== "") {
      const kw = q.trim();
      query = query.or(`title.ilike.%${kw}%,description.ilike.%${kw}%`);
    }
    if (categories.length > 0) query = query.in("category", categories);

    if (stack) {
      query = query.ilike("stack", `%${stack}%`);
    }

    // 프리뷰 vs 전체보기
    if (!all) {
      query = query.limit(limit);
    } else {
      const p = Math.max(1, page || 1);
      const offset = (p - 1) * pageSize;
      query = query.range(offset, offset + pageSize - 1);
    }

    return query;
  }, [q, categories, stack, sort, all, limit, page, pageSize]);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, count, error } = await buildQuery();
    if (error) {
      console.error("works fetch error:", error);
      setItems([]);
      setTotalCount(0);
      setLoading(false);
      return;
    }

    const filtered = (() => {
      if (!stack) return data || [];
      const s = stack.toLowerCase();
      return (data || []).filter(it => tokenizeStacks(it.stack).includes(s));
    })();

    setItems(filtered);
    setTotalCount(typeof count === "number" ? count : (data?.length || 0));
    setLoading(false);
  }, [buildQuery, stack]);

  // 필터/정렬/페이지 바뀔 때마다 재조회
  useEffect(() => { load(); }, [load]);

  const totalPages = useMemo(() => {
    if (!all) return 1;
    return Math.max(1, Math.ceil(totalCount / pageSize));
  }, [all, totalCount, pageSize]);

  return (
    <section className="works-board">
      {!hideFilters && (
        <WorkFilters
          q={q} setQ={setQ}
          categories={categories} setCategories={setCategories}
          stack={stack} setStack={setStack}
          sort={sort} setSort={setSort}
          meta={{ stacks: metaStacks }}
        />
      )}

      <div className="works-grid">
        {items.map(it => <WorkCard key={it.id} item={it} />)}
      </div>

      {/* 프리뷰일 때만 더보기 버튼 */}
      {!all && (
        <div style={{ display: "flex", justifyContent: "center", marginTop: 16 }}>
          <Link className="btn" to="/works">전체 보기</Link>
        </div>
      )}

      {/* 전체보기일 때 페이지네이션 */}
      {all && totalPages > 1 && (
        <nav className="pagination" style={{ display:"flex", gap:8, justifyContent:"center" }}>
          <button
            className="btn"
            disabled={page <= 1}
            onClick={() => onPageChange?.(page - 1)}
          >
            이전
          </button>
          <span style={{ alignSelf: "center" }}>
            {page} / {totalPages}
          </span>
          <button
            className="btn"
            disabled={page >= totalPages}
            onClick={() => onPageChange?.(page + 1)}
          >
            다음
          </button>
        </nav>
      )}

      {!loading && items.length === 0 && <div className="empty">조건에 맞는 작업이 없습니다.</div>}
    </section>
  );
}
