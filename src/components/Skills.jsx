import React from "react";
import {
  CircularProgressbar,
  buildStyles,
} from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import "../css/components/Skills.css";

export default function Skills({ reveal }) {
  const skillsCircle = [
    { name: "Node.js", value: 90, class: "css" },
    { name: "Java", value: 80, class: "html" },
    { name: "React", value: 75, class: "jquery" },
    { name: "JavaScript", value: 85, class: "js" },
  ];

  const skillsBar = [
    { name: "PHP", value: 75, class: "php" },
    { name: "Python", value: 70, class: "python" },
    { name: "TypeScript", value: 70, class: "ts" },
    { name: "MSSQL", value: 85, class: "mssql" },
    { name: "MySQL", value: 75, class: "mysql" },
    { name: "AWS", value: 70, class: "aws" },
  ];

  return (
    <section className="skills" ref={reveal}>
      <div className="wrap">
        <div className="section-head" ref={reveal}>
          <h2>기술 스택</h2>
        </div>

        {/* 원형 게이지 */}
        <div className="circle-skills">
          {skillsCircle.map((s) => (
            <div key={s.name} className={`circle-card ${s.class}`} ref={reveal}>
              <div className="circle-wrapper">
                <CircularProgressbar
                  value={s.value}
                  styles={buildStyles({
                    pathColor: `var(--skill-${s.class})`,
                    trailColor: "var(--track)",
                  })}
                />
                <div className="circle-inner">
                  <div className="circle-value">{s.value}%</div>
                  <div className="circle-label">{s.name}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 바 형태 */}
        <div className="bar-skills">
          {skillsBar.map((s) => (
            <div key={s.name} className={`bar-card ${s.class}`} ref={reveal}>
              <div className="bar-label">
                <span>{s.name}</span>
                <span>{s.value}%</span>
              </div>
              <div className="bar-track">
                <div className="bar-fill" style={{ width: `${s.value}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
