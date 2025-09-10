import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import "../../css/components/pages/projects_all.css";

const PAGE_SIZE = 12;             // 한 페이지당 개수
const PAGE_WINDOW = 5;            // 페이지 번호 표시 개수(가운데 정렬)

export default function ProjectsAll() {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();

  // page는 1부터 시작
  const page = useMemo(() => {
    const n = parseInt(params.get("page") || "1", 10);
    return Number.isNaN(n) || n < 1 ? 1 : n;
  }, [params]);

  const [items, setItems] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(totalCount / PAGE_SIZE)), [totalCount]);

  // 총 개수 구하기
  useEffect(() => {
    (async () => {
      const { count, error } = await supabase
        .from("portfolio_projects")
        .select("id", { count: "exact", head: true }); // 데이터 없이 count만

      if (error) {
        console.error("count error:", error);
        setTotalCount(0);
        return;
      }
      setTotalCount(count || 0);
    })();
  }, []);

  // 현재 페이지 데이터 로드
  useEffect(() => {
    (async () => {
      setLoading(true);

      // 범위 계산
      const from = (page - 1) * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      const { data, error } = await supabase
        .from("portfolio_projects")
        .select("*")
        .order("created_at", { ascending: false })
        .range(from, to);

      if (error) {
        console.error("page load error:", error);
        setItems([]);
        setLoading(false);
        return;
      }

      // 스키마 → 뷰모델 매핑
      const mapped = (data || []).map((r) => ({
        id: r.id,
        title: r.title,
        description: r.description,
        stack: r.stack,
        work_company: r.work_company ?? "",
        work_period: r.work_period ?? "",
        work_result: r.work_result ?? "",
        cover_url: r.image_path ?? "",
        created_at: r.created_at,
      }));

      setItems(mapped);
      setLoading(false);

      // 페이지 전환 시 약간 올려주기
      window.scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" });
    })();
  }, [page]);

  // 페이지 변경 헬퍼
  const gotoPage = (p) => {
    const next = Math.min(Math.max(1, p), totalPages);
    const sp = new URLSearchParams(params);
    if (next === 1) sp.delete("page");
    else sp.set("page", String(next));
    setParams(sp, { replace: false });
  };

  // 표시할 페이지 번호 범위 계산
  const pageNumbers = useMemo(() => {
    const half = Math.floor(PAGE_WINDOW / 2);
    let start = Math.max(1, page - half);
    let end = start + PAGE_WINDOW - 1;
    if (end > totalPages) {
      end = totalPages;
      start = Math.max(1, end - PAGE_WINDOW + 1);
    }
    const arr = [];
    for (let i = start; i <= end; i++) arr.push(i);
    return arr;
  }, [page, totalPages]);

  return (
    <main className="wrap works-sec">
      {/* 상단 바 */}
      <div className="topbar">
        <button className="btn tiny ghost" onClick={() => navigate(-1)}>← 뒤로</button>
        <Link className="btn tiny" to="/">메인으로</Link>
      </div>

      <header className="works-hero">
        <h1 className="works-title">프로젝트</h1>
        <p className="works-sub">
          총 {totalCount}건 · 페이지 {page}/{totalPages}
        </p>
      </header>

      {/* 리스트 */}
      {loading ? (
        <div className="grid">
          <div className="skeleton card-skel" />
          <div className="skeleton card-skel" />
          <div className="skeleton card-skel" />
        </div>
      ) : items.length === 0 ? (
        <div style={{ textAlign: "center", padding: "2rem 0", color: "var(--muted)" }}>
          표시할 프로젝트가 없습니다.
          <div style={{ marginTop: 8 }}>
            <Link to="/" className="btn">메인으로</Link>
          </div>
        </div>
      ) : (
        <>
          <section
            className="works-board"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: 16,
            }}
          >
            {items.map((it) => (
              <article key={it.id} className="card glass hover-raise">
                <div className="card-body">
                  <h3 className="card-title">{it.title}</h3>

                  {(it.work_period) && (
                    <div className="meta">
                      {it.work_period && <span className="period">{it.work_period}</span>}
                    </div>
                  )}

                  {it.stack && (
                    <div className="stack">
                      {it.stack.split("/").map((t) => (
                        <span key={t.trim()} className="badge tech">
                          {t.trim()}
                        </span>
                      ))}
                    </div>
                  )}

                  {it.description && <p className="desc">{it.description}</p>}
                  {it.work_result && (
                    <p className="desc" style={{ marginTop: 8 }}>
                      <strong>결과</strong> · {it.work_result}
                    </p>
                  )}
                </div>
              </article>
            ))}
          </section>

          {/* 페이징 네비게이션 (하단) */}
          <nav className="pager">
            <div className="pager-side left">
              <button className="btn tiny ghost" onClick={() => gotoPage(1)} disabled={page <= 1} aria-label="처음">
                « <span className="txt">처음</span>
              </button>
              <button className="btn tiny ghost" onClick={() => gotoPage(page - 1)} disabled={page <= 1} aria-label="이전">
                ‹ <span className="txt">이전</span>
              </button>
            </div>

            <ul className="pager-list" role="listbox" aria-label="페이지 목록">
              {pageNumbers[0] > 1 && <li className="dots">…</li>}
              {pageNumbers.map((n) => (
                <li key={n}>
                  <button
                    className={`page-btn ${n === page ? "active" : ""}`}
                    onClick={() => gotoPage(n)}
                    aria-current={n === page ? "page" : undefined}
                  >
                    {n}
                  </button>
                </li>
              ))}
              {pageNumbers[pageNumbers.length - 1] < totalPages && <li className="dots">…</li>}
            </ul>

            <div className="pager-side right">
              <button className="btn tiny ghost" onClick={() => gotoPage(page + 1)} disabled={page >= totalPages} aria-label="다음">
                <span className="txt">다음</span> ›
              </button>
              <button className="btn tiny ghost" onClick={() => gotoPage(totalPages)} disabled={page >= totalPages} aria-label="마지막">
                <span className="txt">마지막</span> »
              </button>
            </div>
          </nav>

        </>
      )}

      {/* 하단 메인 버튼 */}
      <div className="section-foot" style={{ textAlign: "center", marginTop: 16 }}>
        <Link to="/" className="btn ghost">메인으로</Link>
      </div>
    </main>
  );
}
