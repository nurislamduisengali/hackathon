import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import StatCard from "@/components/StatCard";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import { useDistrict } from "@/context/DistrictContext";
import { getHousingData } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  Droplets,
  Flame,
  RefreshCw,
  Sparkles,
  TrendingUp,
  Wrench,
  Zap,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

type LlmChoice = {
  message?: {
    content?: string;
  };
};

type LlmResponse = {
  choices?: LlmChoice[];
};

function normalizeAiText(value: string) {
  return value.replace(/\s+/g, " ").replace(/^\s*[-*]\s*/, "").trim();
}

async function fetchHousingRecommendation(input: {
  districtLabel: string;
  waterCoverage: string;
  waterChange: string;
  electricity: string;
  heat: number;
  accidents: string;
  utilityLoads: string[];
  incidents: string[];
}) {
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama-3.1-8b-instant",
      temperature: 0.4,
      messages: [
        {
          role: "system",
          content:
            "Ты аналитик ЖКХ умного города. Дай 1 короткую практическую рекомендацию на русском языке, 2-3 предложения, без markdown и списков.",
        },
        {
          role: "user",
          content: [
            `Район: ${input.districtLabel}.`,
            `Охват водоснабжением: ${input.waterCoverage}%, изменение: ${input.waterChange}.`,
            `Потребление электроэнергии: ${input.electricity}.`,
            `Мощность теплоснабжения: ${input.heat}.`,
            `Среднее число аварий в месяц: ${input.accidents}.`,
            `Нагрузка по коммунальным зонам: ${input.utilityLoads.join(", ")}.`,
            `Ключевые инциденты: ${input.incidents.join(", ")}.`,
            "Предложи краткое управленческое действие для коммунального штаба на ближайший период.",
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

export default function HousingPage() {
  const { district, loading } = useDistrict();
  const data = useMemo(() => getHousingData(district), [district]);
  const districtLabel = district === "Р’РµСЃСЊ РіРѕСЂРѕРґ" ? "Алматы" : district;

  const utilityLoads = useMemo(
    () => data.utilityDistricts.slice(0, 3).map((item) => `${item.name} ${item.load}%`),
    [data.utilityDistricts],
  );

  const incidentTypes = useMemo(() => data.incidents.slice(0, 3).map((item) => item.type), [data.incidents]);

  const {
    data: aiRecommendation,
    isLoading: isAiLoading,
    isFetching: isAiFetching,
    isError: isAiError,
    refetch: refetchAiRecommendation,
  } = useQuery({
    queryKey: [
      "housing-ai-recommendation",
      districtLabel,
      data.stats.water,
      data.stats.electricity,
      data.stats.heat,
      data.stats.accidents,
    ],
    queryFn: () =>
      fetchHousingRecommendation({
        districtLabel,
        waterCoverage: data.stats.water,
        waterChange: data.stats.waterChange,
        electricity: data.stats.electricity,
        heat: data.stats.heat,
        accidents: data.stats.accidents,
        utilityLoads,
        incidents: incidentTypes,
      }),
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

  if (loading) return <LoadingSkeleton />;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-xl font-bold text-foreground">Центр жилищного строительства и коммунальных услуг</h1>
          <p className="text-sm text-muted-foreground">
            Мониторинг коммунальных услуг {district === "Р’РµСЃСЊ РіРѕСЂРѕРґ" ? "Алматы" : `района ${district}`}
          </p>
        </div>
        <button className="rounded-lg bg-primary px-4 py-2 text-xs font-medium text-primary-foreground transition-opacity hover:opacity-90">
          Report Issue
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard title="ВОДОСНАБЖЕНИЕ" value={data.stats.water} subtitle="% охвата" change={data.stats.waterChange} changeType="positive" icon={Droplets} />
        <StatCard title="ЭЛЕКТРОЭНЕРГИЯ" value={data.stats.electricity} subtitle="МВт потребление" icon={Zap} />
        <StatCard title="ТЕПЛОСНАБЖЕНИЕ" value={String(data.stats.heat)} subtitle="МВт мощность" change="стабильно" changeType="neutral" icon={Flame} />
        <StatCard title="АВАРИИ" value={data.stats.accidents} subtitle="среднее/месяц" change={data.stats.accidentsChange} changeType="positive" icon={Wrench} />
      </div>

      <div className="rounded-xl border border-warning/30 bg-warning/10 p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle size={18} className="mt-0.5 flex-shrink-0 text-warning" />
          <div>
            <p className="text-sm font-medium text-foreground">
              Высокий риск выхода из строя водопроводных труб в {district === "Р’РµСЃСЊ РіРѕСЂРѕРґ" ? "Zhetysu" : district} район в течение 48 часов
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              AI модель прогнозирует повышенный риск аварии на основе данных износа сети и нестабильного давления в системе.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-4">
          <h3 className="mb-4 text-sm font-semibold text-foreground">Utility Load by District</h3>
          <div className="space-y-3">
            {data.utilityDistricts.map((d) => (
              <div key={d.name} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-foreground">{d.name}</span>
                  <span className={`font-medium ${d.load > 85 ? "text-destructive" : d.load > 70 ? "text-warning" : "text-stat-green"}`}>
                    {d.load}%
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className={`h-full rounded-full transition-all ${d.load > 85 ? "bg-destructive" : d.load > 70 ? "bg-warning" : "bg-stat-green"}`}
                    style={{ width: `${d.load}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card">
          <div className="border-b border-border p-4">
            <h3 className="text-sm font-semibold text-foreground">Активные инциденты инфраструктуры</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border">
                  <th className="p-3 text-left font-medium text-muted-foreground">ТИП</th>
                  <th className="p-3 text-left font-medium text-muted-foreground">РАЙОН</th>
                  <th className="p-3 text-left font-medium text-muted-foreground">ДАТА</th>
                  <th className="p-3 text-left font-medium text-muted-foreground">СТАТУС</th>
                </tr>
              </thead>
              <tbody>
                {data.incidents.map((row, i) => (
                  <tr key={i} className="border-b border-border last:border-0">
                    <td className="p-3 text-foreground">{row.type}</td>
                    <td className="p-3 text-foreground">{row.district}</td>
                    <td className="p-3 text-muted-foreground">{row.date}</td>
                    <td className="p-3">
                      <span
                        className={`text-xs font-medium ${
                          row.status === "Критично"
                            ? "text-destructive"
                            : row.status === "В работе"
                              ? "text-info"
                              : "text-stat-green"
                        }`}
                      >
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="rounded-[28px] border border-primary/10 bg-[linear-gradient(180deg,rgba(109,40,217,0.10)_0%,rgba(255,255,255,0.96)_100%)] p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <Sparkles size={18} />
          </div>
          <div className="min-w-0">
            <h3 className="text-xl font-semibold tracking-tight text-primary">Рекомендации ИИ</h3>
            <p className="text-xs uppercase tracking-[0.18em] text-primary/70">Ответы служб поддержки в режиме реального времени</p>
          </div>
        </div>

        <p className="text-md leading-9 text-foreground">
          {isAiLoading
            ? "Отправляем показатели ЖКХ в ИИ и формируем актуальную рекомендацию для коммунального штаба..."
            : isAiError
              ? `Не удалось получить ответ от ИИ. Пока ориентируйтесь на охват водоснабжением ${data.stats.water}%, ${data.stats.accidents} аварии в среднем за месяц и самые нагруженные коммунальные зоны района.`
              : aiRecommendation}
        </p>

        {/* <div className="mt-8 space-y-6">
          <div className="flex items-start gap-3">
            <Droplets size={18} className="mt-1 text-primary" />
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-foreground">Water resilience</p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Охват водоснабжением сейчас {data.stats.water}%, а динамика сохраняется на уровне {data.stats.waterChange}.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <TrendingUp size={18} className="mt-1 text-warning" />
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-foreground">Infrastructure load</p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Наиболее загруженные коммунальные зоны: {utilityLoads.join(", ")}, что требует приоритизации профилактики.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Wrench size={18} className="mt-1 text-primary" />
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-foreground">Incident pressure</p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                В фокусе сейчас {incidentTypes.join(", ")}, а средний аварийный фон составляет {data.stats.accidents} в месяц.
              </p>
            </div>
          </div>
        </div> */}

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

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-4">
          <h3 className="mb-4 text-sm font-semibold text-foreground">Потребление электроэнергии</h3>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.electricityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip />
                <Bar dataKey="value" fill="hsl(var(--primary))" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          <h3 className="mb-4 text-sm font-semibold text-foreground">Тенденции спроса на газ</h3>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.gasDemandData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="hsl(var(--chart-4))" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
