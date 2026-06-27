"use client";

import { useEffect, useRef, useState } from "react";
import { Award, Clock, TrendingUp, Users } from "lucide-react";
import { settingsService } from "@/services/settings.service";

export function StatsSection() {
  const [stats, setStats] = useState([
    { icon: Users, value: 500, suffix: "+", label: "Clientes satisfechos", color: "#FF7101", key: "stats_students" },
    { icon: TrendingUp, value: 98, suffix: "%", label: "Tasa de satisfacción", color: "#0740E4", key: null },
    { icon: Award, value: 150, suffix: "+", label: "Proyectos completados", color: "#34A853", key: "stats_projects" },
    { icon: Clock, value: 24, suffix: "/7", label: "Soporte disponible", color: "#FF7101", key: null },
  ]);

  const ref = useRef<HTMLElement>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const { data } = await settingsService.getAllSettings();
        setStats((prev) =>
          prev.map((s) => {
            const setting = data.find((item) => item.key === s.key);
            return setting ? { ...s, value: Number(setting.value) } : s;
          })
        );
      } catch (error) {
        console.error("Error loading stats:", error);
      }
    };

    loadStats();
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={ref} className="bg-gray-50 py-14 px-4">
      <div className="container mx-auto">
        <div className="mb-10 text-center">
          <span className="mb-4 inline-block rounded-full px-4 py-1.5 text-sm font-semibold" style={{ background: "#FF710115", color: "#FF7101" }}>
            Nuestros numeros
          </span>
          <h2 className="text-3xl font-bold text-[#01103B] lg:text-4xl">
            Resultados que respaldan nuestro trabajo
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-4">
          {stats.map((stat, i) => (
            <StatCard key={stat.label} stat={stat} delay={i * 150} started={started} />
          ))}
        </div>
      </div>
    </section>
  );
}

function useCountUp(target: number, duration = 2000, start = false) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!start) return;

    let startTime: number | null = null;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };

    requestAnimationFrame(step);
  }, [target, duration, start]);

  return count;
}

function StatCard({
  stat,
  delay,
  started,
}: {
  stat: { icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>; value: number; suffix: string; label: string; color: string; key?: string | null };
  delay: number;
  started: boolean;
}) {
  const Icon = stat.icon;
  const count = useCountUp(stat.value, 2000, started);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!started) return;
    const timeout = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(timeout);
  }, [started, delay]);

  return (
    <div
      className={`relative rounded-xl border border-gray-200 bg-white p-6 text-center shadow-sm transition-all duration-500 ${
        visible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg" style={{ background: `${stat.color}15` }}>
        <Icon className="h-6 w-6" style={{ color: stat.color }} />
      </div>
      <div className="mb-1 text-3xl font-black tabular-nums text-[#01103B]">
        {started ? count : 0}
        <span style={{ color: stat.color }}>{stat.suffix}</span>
      </div>
      <p className="text-sm font-medium text-gray-500">{stat.label}</p>
    </div>
  );
}
