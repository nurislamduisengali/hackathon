import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import StatCard from "@/components/StatCard";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import { useDistrict } from "@/context/DistrictContext";
import { getTransportData } from "@/data/mockData";
import CityMap from "@/components/CityMap";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  Bus,
  Car,
  Clock3,
  RefreshCw,
  Sparkles,
  TrainFront,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type LlmChoice = {
  message?: {
    content?: string;
  };
};

type LlmResponse = {
  choices?: LlmChoice[];
};

const incidents = [
  {
    icon: AlertTriangle,
    title: "ДТП на Аль-Фараби",
    description: "Столкновение двух авто, движение затруднено в направлении центра.",
    color: "text-destructive",
  },
  {
    icon: Car,
    title: "Пробка на Саина",
    description: "Ремонт полосы снизил пропускную способность в утреннем коридоре.",
    color: "text-warning",
  },
  {
    icon: Bus,
    title: "Задержка маршрута 65",
    description: "Интервал движения вырос на 15 минут из-за перегрузки узла.",
    color: "text-info",
  },
];

function normalizeAiText(value: string) {
  return value.replace(/\s+/g, " ").replace(/^\s*[-*]\s*/, "").trim();
}

async function fetchTrafficRecommendation(input: {
  districtLabel: string;
  peakLoad: number;
  peakTime: string;
  overloadedRoads: number;
  topRoads: string[];
  incidentsCount: number;
}) {
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      'Authorization': `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama-3.1-8b-instant",
      temperature: 0.4,
      messages: [
        {
          role: "system",
          content:
            "Ты транспортный аналитик умного города. Дай 1 короткую практическую рекомендацию на русском языке, 2-3 предложения, без markdown и списков.",
        },
        {
          role: "user",
          content: [
            `Район: ${input.districtLabel}.`,
            `Пиковая нагрузка: ${input.peakLoad}% в ${input.peakTime}.`,
            `Перегруженных магистралей: ${input.overloadedRoads}.`,
            `Ключевые дороги: ${input.topRoads.join(", ")}.`,
            `Активных инцидентов: ${input.incidentsCount}.`,
            "Предложи конкретное краткое действие для транспортного штаба на ближайший час.",
          ].join(" "),
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`LLM request failed with status ${response.status}`);
  }

  const payload = (await response.json()) as LlmResponse;
  const content = payload.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("LLM response did not include recommendation text");
  }

  return normalizeAiText(content);
}

export default function TransportPage() {
  const { district, loading } = useDistrict();
  const data = useMemo(() => getTransportData(district), [district]);

  const peakTrafficSlot = useMemo(
    () => data.trafficData.reduce((peak, current) => (current.load > peak.load ? current : peak), data.trafficData[0]),
    [data.trafficData],
  );

  const overloadedRoads = useMemo(
    () => data.flowData.filter((row) => parseInt(row.load, 10) >= 75).length,
    [data.flowData],
  );

  const districtLabel = district === "Весь город" ? "Алматы" : district;
  const topRoads = useMemo(() => data.flowData.slice(0, 3).map((row) => row.road), [data.flowData]);

  const {
    data: aiRecommendation,
    isLoading: isAiLoading,
    isFetching: isAiFetching,
    isError: isAiError,
    refetch: refetchAiRecommendation,
  } = useQuery({
    queryKey: ["transport-ai-recommendation", districtLabel, peakTrafficSlot.time, peakTrafficSlot.load, overloadedRoads],
    queryFn: () =>
      fetchTrafficRecommendation({
        districtLabel,
        peakLoad: peakTrafficSlot.load,
        peakTime: peakTrafficSlot.time,
        overloadedRoads,
        topRoads,
        incidentsCount: data.stats.incidents,
      }),
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

  if (loading) return <LoadingSkeleton />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">Транспорт и мобильность</h1>
        <p className="text-sm text-muted-foreground">
          Мониторинг транспортной системы {district === "Весь город" ? "Алматы" : `района ${district}`} в реальном времени
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard title="ПОЕЗДКИ В ДЕНЬ" value={data.stats.trips} change={data.stats.tripsChange} changeType="positive" icon={Car} />
        <StatCard title="АВТОБУСЫ" value={data.stats.buses} subtitle="на маршрутах" icon={Bus} />
        <StatCard title="МЕТРО" value={data.stats.metro} subtitle="пассажиров/день" icon={TrainFront} />
        <StatCard title="ИНЦИДЕНТЫ" value={String(data.stats.incidents)} subtitle="за сегодня" change={data.stats.incidentsChange} changeType="positive" icon={AlertTriangle} />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.7fr)_360px]">
        <div className="rounded-xl border border-border bg-card p-4">
          <h3 className="mb-1 text-sm font-semibold text-foreground">Обзор дорожных табло (24ч)</h3>
          <div className="mb-4 flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="h-2.5 w-2.5 rounded-sm bg-destructive" />
              Пиковый диапазон нагрузки
            </span>
          </div>
          <div className="h-[420px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.trafficData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="time" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip />
                <Bar dataKey="load" radius={[3, 3, 0, 0]} fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-[28px] border border-primary/10 bg-[linear-gradient(180deg,rgba(109,40,217,0.10)_0%,rgba(255,255,255,0.96)_100%)] p-6 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <Sparkles size={18} />
            </div>
            <div className="min-w-0">
              <h3 className="text-xl font-semibold tracking-tight text-primary">Рекомендации ИИ</h3>
              <p className="text-xs uppercase tracking-[0.18em] text-primary/70">Оперативное реагирование города</p>
            </div>
          </div>

          <p className="text-md leading-9 text-foreground">
            {isAiLoading
              ? "Отправляем транспортные показатели в ИИ и формируем рекомендацию для диспетчерского штаба..."
              : isAiError
                ? `Не удалось получить ответ от ИИ. Пока ориентируйтесь на пик ${peakTrafficSlot.load}% в ${peakTrafficSlot.time} и проверьте ${overloadedRoads} перегруженных магистрали вручную.`
                : aiRecommendation}
          </p>

          <Button
            className="mt-8 h-14 w-full rounded-2xl text-base font-semibold"
            onClick={() => {
              void refetchAiRecommendation();
            }}
            disabled={isAiFetching}
          >
            {isAiFetching ? "Обновляем рекомендацию" : "Обновить рекомендацию"}
            <RefreshCw size={18} className={isAiFetching ? "animate-spin" : ""} />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card">
          <div className="border-b border-border p-4">
            <h3 className="text-sm font-semibold text-foreground">Эффективность распределения потоков в районе</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border">
                  <th className="p-3 text-left font-medium text-muted-foreground">ДОРОГА</th>
                  <th className="p-3 text-left font-medium text-muted-foreground">СР. СКОРОСТЬ</th>
                  <th className="p-3 text-left font-medium text-muted-foreground">ПОТОК</th>
                  <th className="p-3 text-left font-medium text-muted-foreground">НАГРУЗКА</th>
                </tr>
              </thead>
              <tbody>
                {data.flowData.map((row, i) => (
                  <tr key={i} className="border-b border-border last:border-0">
                    <td className="p-3 font-medium text-foreground">{row.road}</td>
                    <td className="p-3 text-foreground">{row.avgSpeed}</td>
                    <td className="p-3 text-foreground">{row.flow}</td>
                    <td className="p-3">
                      <span
                        className={`font-medium ${
                          parseInt(row.load, 10) > 75
                            ? "text-destructive"
                            : parseInt(row.load, 10) > 50
                              ? "text-warning"
                              : "text-stat-green"
                        }`}
                      >
                        {row.load}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <CityMap
            district={district}
            height="300px"
            circles={[
              { lat: 43.255, lng: 76.94, radius: 500, color: "#ef4444", label: "ДТП на Толе-би" },
              { lat: 43.24, lng: 76.9, radius: 400, color: "#f59e0b", label: "Пробка на Абая" },
              { lat: 43.27, lng: 76.96, radius: 300, color: "#3b82f6", label: "Задержка маршрута 2" },
            ]}
          />
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">Активные дорожно-транспортные происшествия</h3>
          <span className="cursor-pointer text-xs text-primary">Посмотреть все прямые трансляции →</span>
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {incidents.map((item, i) => (
            <div key={i} className="flex items-start gap-3 rounded-lg bg-muted p-3">
              <item.icon size={16} className={`${item.color} mt-0.5 flex-shrink-0`} />
              <div>
                <p className="text-xs font-medium text-foreground">{item.title}</p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
