import React, { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import WorkFilters from "./WorkFilters";
import WorkCard from "./WorkCard";

export default function WorksBoard({
  limit = 9,                 // 프리뷰: 9개
  all = false,               // 전체 페이지: true 로 주면 전체 조회
  hideFilters = false,
  showMoreHref = "#/works",
}) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const [q, setQ] = useState("");
  const [categories, setCategories] = useState([]);
  const [stack, setStack] = useState("");
  const [company, setCompany] = useState("");
  const [sort, setSort] = useState("recent");

  const buildQuery = useCallback(() => {
    let query = supabase
      .from("portfolio_works")
      .select("id, title, description, category, stack, work_company, department, impact, work_at");

    // 정렬
    if (sort === "title") query = query.order("title", { ascending: true });
    else query = query.order("id", { ascending: false });

    // 검색/필터
    if (q && q.trim() !== "") query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%`);
    if (categories.length > 0) query = query.in("category", categories);
    if (stack) query = query.eq("stack", stack);
    if (company) query = query.eq("work_company", company);

    if (!all) query = query.limit(limit);

    return query;
  }, [q, categories, stack, company, sort, all, limit]);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await buildQuery();
    if (error) {
      console.error("works fetch error:", error);
      setItems([]);
    } else {
      setItems(data || []);
    }
    setLoading(false);
  }, [buildQuery]);

  // 필터/정렬 바뀔 때마다 재조회
  useEffect(() => { load(); }, [load]);

  // select 옵션용 메타
  const meta = useMemo(() => {
    const stacks = Array.from(new Set(items.map(v => v.stack).filter(Boolean)));
    const companies = Array.from(new Set(items.map(v => v.work_company).filter(Boolean)));
    return { stacks, companies };
  }, [items]);

  return (
    <section className="works-board">
      {!hideFilters && (
        <WorkFilters
          q={q} setQ={setQ}
          categories={categories} setCategories={setCategories}
          stack={stack} setStack={setStack}
          company={company} setCompany={setCompany}
          sort={sort} setSort={setSort}
          meta={meta}
        />
      )}

      <div className="works-grid">
        {items.map(it => <WorkCard key={it.id} item={it} />)}
      </div>

      {/* 프리뷰일 때만 더보기 버튼 */}
      {/* {!all && (
        <div style={{ display: "flex", justifyContent: "center", marginTop: 16 }}>
          <a className="btn" href={showMoreHref}>전체 보기</a>
        </div>
      )} */}

      {!loading && items.length === 0 && <div className="empty">조건에 맞는 작업이 없습니다.</div>}
    </section>
  );
}
