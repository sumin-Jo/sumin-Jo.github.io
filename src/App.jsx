import React, { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { supabase } from "./lib/supabaseClient";
import ProjectHeader from "./components/ProjectHeader";
import ProjectDetail from "./components/ProjectDetail";
import Skills from "./components/Skills";
import useReveal from "./hooks/useReveal";

export default function App() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "dark";
  });

  const reveal = useReveal();

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("portfolio_projects")
        .select("*")
        .order("id", { ascending: true });

      if (error) console.error("DB fetch error:", error);
      setProjects(data || []);
      setLoading(false);
    })();
  }, []);

  // 테마 적용
  useEffect(() => {
    if (theme === "light") {
      document.documentElement.classList.add("light");
    } else {
      document.documentElement.classList.remove("light");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  if (loading) {
    return (
      <main className="wrap">
        <div className="skeleton hero-skel" />
        <div className="grid">
          <div className="skeleton card-skel" />
          <div className="skeleton card-skel" />
          <div className="skeleton card-skel" />
        </div>
      </main>
    );
  }

  return (
    <>
      <Routes>
        <Route
          path="/"
          element={
            <>
              <ProjectHeader projects={projects} />
              <Skills reveal={reveal} />
            </>
          }
        />
        <Route path="/project/:idx" element={<ProjectDetail projects={projects} />} />
        <Route path="/skills" element={<Skills reveal={reveal} />} />
      </Routes>
    </>
  );
}
