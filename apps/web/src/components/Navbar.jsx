"use client";

import React, { useEffect, useState } from "react";
import {
  BookOpen,
  Plus,
  HelpCircle,
  Calendar,
  Play,
  Menu,
  X,
  Settings,
} from "lucide-react";
import { useTeacher } from "@/app/client-layout";
import { getLastOrRecentSession, setLastSessionId } from "@/utils/localStore";

export function Navbar({ theme }) {
  const { teacher } = useTeacher();
  const [menuOpen, setMenuOpen] = useState(false);
  const [classModeHref, setClassModeHref] = useState("/sessions");
  const [classModeSessionId, setClassModeSessionId] = useState("");

  useEffect(() => {
    const refreshClassModeHref = () => {
      const session = getLastOrRecentSession();
      setClassModeHref(session?.id ? `/class-mode/${session.id}` : "/sessions");
      setClassModeSessionId(session?.id || "");
    };

    refreshClassModeHref();
    window.addEventListener("storage", refreshClassModeHref);
    window.addEventListener("focus", refreshClassModeHref);
    return () => {
      window.removeEventListener("storage", refreshClassModeHref);
      window.removeEventListener("focus", refreshClassModeHref);
    };
  }, []);

  // Use CSS vars so theme applies automatically
  const navStyle = {
    backgroundColor: "var(--ca-nav-bg, rgba(7, 11, 19, 0.92))",
    borderBottomColor: "var(--ca-nav-border, rgba(255,255,255,0.1))",
    color: "var(--ca-nav-text, #f8fafc)",
    backdropFilter: "blur(18px)",
  };

  const linkCls =
    "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold transition-colors hover:bg-white/10";

  const navLinks = [
    { href: "/create", label: "Crear sesión", icon: <Plus size={15} /> },
    { href: "/sessions", label: "Mis sesiones", icon: <BookOpen size={15} /> },
    { href: "/agenda", label: "Agenda", icon: <Calendar size={15} /> },
    { href: "/tutorial", label: "Ayuda", icon: <HelpCircle size={15} /> },
  ];

  return (
    <nav
      className="sticky top-0 z-50 w-full border-b shadow-sm"
      style={navStyle}
    >
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-5">
          <a href="/" className="flex items-center gap-2.5 shrink-0">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center shadow-sm"
              style={{ backgroundColor: "var(--ca-primary, #2563EB)" }}
            >
              <span className="text-white font-black text-sm">CA</span>
            </div>
            <span
              className="font-bold text-base tracking-tight"
              style={{ color: "var(--ca-nav-text, #1e293b)" }}
            >
              CronoAula
            </span>
          </a>

          <div className="hidden md:flex items-center gap-0.5">
            {navLinks.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className={linkCls}
                style={{ color: "var(--ca-nav-text)" }}
              >
                {l.icon} {l.label}
              </a>
            ))}
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2">
          <a
            href={classModeHref}
            onClick={() => classModeSessionId && setLastSessionId(classModeSessionId)}
            className="hidden sm:flex items-center gap-2 px-4 py-2 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm hover:opacity-90"
            style={{ backgroundColor: "var(--ca-primary, #2563EB)" }}
          >
            <Play size={14} fill="white" /> Modo clase
          </a>

          <a
            href="/settings"
              className="p-2 rounded-full hover:bg-white/10 transition-colors"
            title="Configuración"
            style={{ color: "var(--ca-text-muted)" }}
          >
            <Settings size={18} />
          </a>

          {teacher ? (
            <a
              href="/settings"
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-full hover:bg-white/10 transition-colors text-sm font-medium"
            >
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-white font-bold text-xs"
                style={{ backgroundColor: "var(--ca-primary, #2563EB)" }}
              >
                {teacher.name?.charAt(0) || "D"}
              </div>
              <span
                className="hidden sm:inline"
                style={{ color: "var(--ca-nav-text)" }}
              >
                {teacher.name?.split(" ")[0]}
              </span>
            </a>
          ) : (
            <a
              href="/settings"
              className="px-3 py-1.5 text-white rounded-lg text-sm font-semibold transition-colors hover:opacity-90"
              style={{ backgroundColor: "var(--ca-text, #1e293b)" }}
            >
              Empezar
            </a>
          )}

          <button
            onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 rounded-full hover:bg-white/10 transition-colors"
            style={{ color: "var(--ca-text-muted)" }}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div
          className="md:hidden border-t px-4 py-3 space-y-1"
          style={{
            backgroundColor: "var(--ca-nav-bg)",
            borderColor: "var(--ca-nav-border)",
          }}
        >
          {navLinks.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors hover:bg-white/10"
              style={{ color: "var(--ca-nav-text)" }}
            >
              {l.icon} {l.label}
            </a>
          ))}
          <a
            href={classModeHref}
            onClick={() => {
              if (classModeSessionId) setLastSessionId(classModeSessionId);
              setMenuOpen(false);
            }}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-white mt-2"
            style={{ backgroundColor: "var(--ca-primary, #2563EB)" }}
          >
            <Play size={15} /> Iniciar modo clase
          </a>
          <a
            href="/settings"
            onClick={() => setMenuOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors hover:bg-white/10"
            style={{ color: "var(--ca-text-muted)" }}
          >
            <Settings size={15} /> Configuración
          </a>
        </div>
      )}
    </nav>
  );
}
