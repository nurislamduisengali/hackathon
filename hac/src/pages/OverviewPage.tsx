import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import StatCard from "@/components/StatCard";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import { useDistrict } from "@/context/DistrictContext";
import { getOverviewData } from "@/data/mockData";
import CityMap from "@/components/CityMap";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  Car,
  RefreshCw,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Users,
  Wind,
} from "lucide-react";
import {
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

async function fetchOverviewRecommendation(input: {
  districtLabel: string;
  population: string;
  populationChange: string;
  transportIndex: number;
  airDays: number;
  incidents: string;
  issueCategories: string[];
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
            "Ты аналитик умного города. Дай 1 короткую практическую рекомендацию на русском языке, 2-3 предложения, без markdown и списков.",
        },
        {
          role: "user",
          content: [
            `Район: ${input.districtLabel}.`,
            `Население: ${input.population} млн, изменение: ${input.populationChange}.`,
            `Транспортный индекс: ${input.transportIndex}.`,
            `Дней с воздухом выше нормы: ${input.airDays}.`,
            `Среднее число инцидентов в день: ${input.incidents}.`,
            `Ключевые категории проблем: ${input.issueCategories.join(", ")}.`,
            "Предложи краткое управленческое действие для городского штаба на ближайший период.",
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

export default function OverviewPage() {
  const { district, loading } = useDistrict();
  const data = useMemo(() => getOverviewData(district), [district]);
  const districtLabel = district === "Р’РµСЃСЊ РіРѕСЂРѕРґ" ? "Алматы" : district;
  const issueCategories = useMemo(() => data.issues.slice(0, 3).map((issue) => issue.category), [data.issues]);

  const {
    data: aiRecommendation,
    isLoading: isAiLoading,
    isFetching: isAiFetching,
    isError: isAiError,
    refetch: refetchAiRecommendation,
  } = useQuery({
    queryKey: [
      "overview-ai-recommendation",
      districtLabel,
      data.stats.population,
      data.stats.transport,
      data.stats.airDays,
      data.stats.incidents,
    ],
    queryFn: () =>
      fetchOverviewRecommendation({
        districtLabel,
        population: data.stats.population,
        populationChange: data.stats.populationChange,
        transportIndex: data.stats.transport,
        airDays: data.stats.airDays,
        incidents: data.stats.incidents,
        issueCategories,
      }),
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

  if (loading) return <LoadingSkeleton />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">Общий вид города</h1>
        <p className="text-sm text-muted-foreground">
          Ключевые показатели {district === "Р’РµСЃСЊ РіРѕСЂРѕРґ" ? "Алматы" : `района ${district}`} в реальном времени
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard title="НАСЕЛЕНИЕ (МЛН)" value={data.stats.population} subtitle="рост в год" change={data.stats.populationChange} changeType="positive" icon={Users} />
        <StatCard title="ТРАНСПОРТ" value={String(data.stats.transport)} subtitle="индекс загрузки" change={data.stats.transportChange} changeType="positive" icon={Car} />
        <StatCard title="КАЧЕСТВО ВОЗДУХА" value={String(data.stats.airDays)} subtitle="дней выше нормы" change={data.stats.airChange} changeType="negative" icon={Wind} />
        <StatCard title="ИНЦИДЕНТЫ" value={data.stats.incidents} subtitle="среднее в день" change={data.stats.incidentsChange} changeType="positive" icon={AlertTriangle} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="overflow-hidden rounded-xl border border-border bg-card lg:col-span-2">
          <CityMap
            district={district}
            height="480px"
            circles={[
              { lat: 43.238, lng: 76.945, radius: 400, color: "#5b94d6", label: "Центр города"},
              { lat: 43.257, lng: 76.935, radius: 400, color: "#5b94d6", label: "Алмалинский район" },
              { lat: 43.234, lng: 76.875, radius: 400, color: "#5b94d6", label: "Ауэзовский район" },
            ]}
          />
        </div>

        <div className="rounded-[28px] border border-primary/10 bg-[linear-gradient(180deg,rgba(109,40,217,0.10)_0%,rgba(255,255,255,0.96)_100%)] p-6 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <Sparkles size={17} />
            </div>
            <div className="min-w-0">
              <h3 className="text-xl font-semibold tracking-tight text-primary">Рекомендации ИИ</h3>
              <p className="text-xs uppercase tracking-[0.18em] text-primary/70">Оперативное реагирование города</p>
            </div>
          </div>

          <p className="text-md leading-9 text-foreground">
            {isAiLoading
              ? "Отправляем городские показатели в ИИ и формируем актуальную рекомендацию для штаба..."
              : isAiError
                ? `Не удалось получить ответ от ИИ. Пока ориентируйтесь на транспортный индекс ${data.stats.transport}, ${data.stats.airDays} дней с превышением по воздуху и ${data.stats.incidents} инцидента в среднем за день.`
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

      <div className="rounded-xl border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border p-4">
          <h3 className="text-sm font-semibold text-foreground">Система отслеживания ключевых проблем</h3>
          <span className="cursor-pointer text-xs text-primary">все за последние 30 →</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border">
                <th className="p-3 text-left font-medium text-muted-foreground">КАТЕГОРИЯ</th>
                <th className="p-3 text-left font-medium text-muted-foreground">ПРИОРИТЕТ</th>
                <th className="p-3 text-left font-medium text-muted-foreground">РАЙОН</th>
                <th className="p-3 text-left font-medium text-muted-foreground">СТАТУС</th>
              </tr>
            </thead>
            <tbody>
              {data.issues.map((issue, i) => (
                <tr key={i} className="border-b border-border last:border-0">
                  <td className="p-3 text-foreground">{issue.category}</td>
                  <td className="p-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                        issue.priority === "Высокий"
                          ? "bg-destructive/10 text-destructive"
                          : issue.priority === "Средний"
                            ? "bg-warning/10 text-warning"
                            : "bg-stat-green/10 text-stat-green"
                      }`}
                    >
                      {issue.priority}
                    </span>
                  </td>
                  <td className="p-3 text-foreground">{issue.district}</td>
                  <td className="p-3">
                    <span
                      className={`text-xs font-medium ${
                        issue.status === "Критично"
                          ? "text-destructive"
                          : issue.status === "В процессе"
                            ? "text-info"
                            : issue.status === "Мониторинг"
                              ? "text-warning"
                              : "text-stat-green"
                      }`}
                    >
                      {issue.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <h3 className="mb-4 text-sm font-semibold text-foreground">Динамика населения (тыс.)</h3>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.populationData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
