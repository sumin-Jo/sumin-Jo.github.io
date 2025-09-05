import React from "react";
import WorksBoard from "./WorksBoard";
import "../../css/components/pages/works.css";

export default function WorksPage({ reveal }) {
  return (
    <section className="wrap works-sec" ref={reveal}>
      <div className="section-head">
        <h2 className="k-grad">Work Experience</h2>
      </div>
      <p className="works-sub">버그 픽스 · 데이터 수정 · 정책 반영 · 운영 자동화 등</p>

      <WorksBoard limit={9} all={false} hideFilters={false} showMoreHref="#/works" />

    </section>
  );
}
