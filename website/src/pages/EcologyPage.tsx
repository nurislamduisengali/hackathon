import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import StatCard from "@/components/StatCard";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import { useDistrict } from "@/context/DistrictContext";
import { getEcologyData } from "@/data/mockData";
import CityMap from "@/components/CityMap";
import { Button } from "@/components/ui/button";
import {
  Droplets,
  RefreshCw,
  Sparkles,
  Sun,
  Thermometer,
  Wind,
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

function normalizeAiText(value: string) {
  return value.replace(/\s+/g, " ").replace(/^\s*[-*]\s*/, "").trim();
}

async function fetchEcologyRecommendation(input: {
  districtLabel: string;
  aqi: number;
  pm25: number;
  no2: string;
  temp: number;
  humidity: number;
  wind: string;
  topPollutants: string[];
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
            "Ты экологический аналитик умного города. Дай 1 короткую практическую рекомендацию на русском языке, 2-3 предложения, без markdown и списков.",
        },
        {
          role: "user",
          content: [
            `Район: ${input.districtLabel}.`,
            `Текущий AQI: ${input.aqi}.`,
            `PM2.5: ${input.pm25}.`,
            `NO2: ${input.no2}.`,
            `Температура: ${input.temp}C.`,
            `Влажность: ${input.humidity}%.`,
            `Ветер: ${input.wind}.`,
            `Ключевые загрязнители: ${input.topPollutants.join(", ")}.`,
            "Предложи краткое управленческое действие для экологического штаба на ближайший период.",
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

export default function EcologyPage() {
  const { district, loading } = useDistrict();
  const data = useMemo(() => getEcologyData(district), [district]);
  const districtLabel = district === "Р’РµСЃСЊ РіРѕСЂРѕРґ" ? "Алматы" : district;

  const topPollutants = useMemo(
    () => data.pollutants.slice(0, 3).map((item) => `${item.name} ${item.value}${item.unit}`),
    [data.pollutants],
  );

  const {
    data: aiRecommendation,
    isLoading: isAiLoading,
    isFetching: isAiFetching,
    isError: isAiError,
    refetch: refetchAiRecommendation,
  } = useQuery({
    queryKey: [
      "ecology-ai-recommendation",
      districtLabel,
      data.stats.aqi,
      data.stats.pm25,
      data.stats.no2,
      data.weather.wind,
    ],
    queryFn: () =>
      fetchEcologyRecommendation({
        districtLabel,
        aqi: data.stats.aqi,
        pm25: data.stats.pm25,
        no2: data.stats.no2,
        temp: data.stats.temp,
        humidity: data.weather.humidity,
        wind: data.weather.wind,
        topPollutants,
      }),
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

  if (loading) return <LoadingSkeleton />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">Экология и качество воздуха</h1>
        <p className="text-sm text-muted-foreground">
          Мониторинг экологии {district === "Р’РµСЃСЊ РіРѕСЂРѕРґ" ? "Алматы" : `района ${district}`} в реальном времени
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard title="Текущий (AQI)" value={String(data.stats.aqi)} subtitle="Нездоровый" change="↑ 8%" changeType="negative" icon={Wind} />
        <StatCard title="PM 2.5" value={String(data.stats.pm25)} subtitle="µg/m³ (выше нормы)" change="limit: 35" changeType="negative" icon={Wind} />
        <StatCard title="Температура" value={`+${data.stats.temp}°C`} subtitle={`ощущается как +${data.weather.feelsLike}°C`} icon={Thermometer} />
        <StatCard title="NO₂" value={data.stats.no2} subtitle="µg/m³ (норма)" change="↓ 5%" changeType="positive" icon={Droplets} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card p-6">
          <p className="mb-2 text-xs text-muted-foreground">Индекс качества воздуха</p>
          <div className="text-6xl font-bold text-warning">{data.stats.aqi}</div>
          <div className="mt-3 flex gap-4 text-xs text-muted-foreground">
            <div className="text-center">
              <p className="font-medium text-foreground">{data.districtName}</p>
              <p>Район</p>
            </div>
            <div className="text-center">
              <p className="font-medium text-foreground">14:42 PM</p>
              <p>Обновлено</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          <h3 className="mb-3 text-sm font-semibold text-foreground">Погодные условия</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-muted p-3 text-center">
              <Thermometer size={20} className="mx-auto mb-1 text-primary" />
              <p className="text-lg font-bold text-foreground">+{data.weather.temp}°C</p>
              <p className="text-[10px] text-muted-foreground">Температура</p>
            </div>
            <div className="rounded-lg bg-muted p-3 text-center">
              <Droplets size={20} className="mx-auto mb-1 text-info" />
              <p className="text-lg font-bold text-foreground">{data.weather.humidity}%</p>
              <p className="text-[10px] text-muted-foreground">Влажность</p>
            </div>
            <div className="rounded-lg bg-muted p-3 text-center">
              <Wind size={20} className="mx-auto mb-1 text-stat-green" />
              <p className="text-lg font-bold text-foreground">{data.weather.wind} м/с</p>
              <p className="text-[10px] text-muted-foreground">Ветер</p>
            </div>
            <div className="rounded-lg bg-muted p-3 text-center">
              <Sun size={20} className="mx-auto mb-1 text-warning" />
              <p className="text-lg font-bold text-foreground">PM 10</p>
              <p className="text-[10px] text-muted-foreground">{data.weather.pm10} µg/m³</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          <h3 className="mb-3 text-sm font-semibold text-foreground">AQI Тренд (6 мес)</h3>
          <div className="h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.monthlyAqi}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip />
                <Bar dataKey="aqi" fill="hsl(var(--chart-4))" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="rounded-[28px] border border-primary/10 bg-[linear-gradient(180deg,rgba(109,40,217,0.10)_0%,rgba(255,255,255,0.96)_100%)] p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <Sparkles size={18} />
          </div>
          <div className="min-w-0">
            <h3 className="text-2xl font-semibold tracking-tight text-primary">Рекомендации ИИ</h3>
            <p className="text-xs uppercase tracking-[0.18em] text-primary/70">Реакция живой экологии</p>
          </div>
        </div>

        <p className="text-lg leading-9 text-foreground">
          {isAiLoading
            ? "Отправляем экологические показатели в ИИ и формируем актуальную рекомендацию для штаба..."
            : isAiError
              ? `Не удалось получить ответ от ИИ. Пока ориентируйтесь на AQI ${data.stats.aqi}, PM2.5 ${data.stats.pm25} и текущие погодные условия района.`
              : aiRecommendation}
        </p>

        <div className="mt-8 space-y-6">
          <div className="flex items-start gap-3">
            <Wind size={18} className="mt-1 text-primary" />
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-foreground">Давление воздуха</p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Текущий индекс качества воздуха достиг {data.stats.aqi}, а PM2.5 держится на уровне {data.stats.pm25} µg/m³.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Sun size={18} className="mt-1 text-warning" />
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-foreground">Смесь загрязняющих веществ</p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                В фокусе сейчас {topPollutants.join(", ")}, поэтому приоритет стоит держать на районах с устойчивым накоплением загрязнений.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Thermometer size={18} className="mt-1 text-primary" />
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-foreground">Погодный фактор</p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Погода усиливает экологический фон: температура {data.weather.temp}°C, влажность {data.weather.humidity}% и ветер {data.weather.wind} м/с.
              </p>
            </div>
          </div>
        </div>

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
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <CityMap
            district={district}
            height="300px"
            circles={[
              { lat: 43.257, lng: 76.935, radius: 800, color: "#ef4444", label: "PM 2.5 — высокий уровень" },
              { lat: 43.234, lng: 76.875, radius: 600, color: "#f59e0b", label: "PM 10 — средний уровень" },
              { lat: 43.218, lng: 76.927, radius: 700, color: "#22c55e", label: "NO₂ — в норме" },
            ]}
          />
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">Разложение загрязняющих веществ</h3>
            <span className="cursor-pointer text-xs text-primary">Полный отчет →</span>
          </div>
          <div className="space-y-3">
            {data.pollutants.map((p) => (
              <div key={p.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${p.color}`} />
                  <span className="text-xs text-foreground">{p.name}</span>
                </div>
                <div className="text-right text-xs">
                  <span className="font-medium text-foreground">{p.value}</span>
                  <span className="ml-1 text-muted-foreground">{p.unit}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
