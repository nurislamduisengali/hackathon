import { useMemo } from "react";
import { useDistrict } from "@/context/DistrictContext";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import { MessageSquare, MapPin, AlertTriangle } from "lucide-react";
import CityMap from "@/components/CityMap";

type Feedback = {
  id: number;
  text: string;
  category: string;
  district: string;
  priority: string;
};

const mockFeedback: Feedback[] = [
  {
    id: 1,
    text: "Крупная яма на дороге приводит к заторам и повышает риск ДТП",
    category: "Транспорт",
    district: "Алмалинский",
    priority: "Критичный",
  },
  {
    id: 2,
    text: "Высокий уровень смога в вечернее время ухудшает качество воздуха",
    category: "Экология",
    district: "Бостандыкский",
    priority: "Средний",
  },
  {
    id: 3,
    text: "Отсутствие электроснабжения более 5 часов в жилом доме",
    category: "ЖКХ",
    district: "Ауэзовский",
    priority: "Высокий",
  },
  {
    id: 4,
    text: "Узкая проезжая часть снижает пропускную способность дороги",
    category: "Транспорт",
    district: "Медеуский",
    priority: "Малый",
  },
];

function getPriorityColor(priority: string) {
  switch (priority) {
    case "Критичный":
      return "#b91c1c";
    case "Высокий":
      return "#ef4444";
    case "Средний":
      return "#f59e0b";
    default:
      return "#eab308";
  }
}

export default function FeedbackPage() {
  const { district, loading } = useDistrict();

  const filteredFeedback = useMemo(() => {
    if (district === "Весь город") return mockFeedback;
    return mockFeedback.filter((f) => f.district === district);
  }, [district]);

  if (loading) return <LoadingSkeleton />;

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div>
        <h1 className="text-xl font-bold text-foreground">Отзывы граждан</h1>
        <p className="text-sm text-muted-foreground">
          Жалобы и сообщения жителей в реальном времени
        </p>
      </div>

      {/* Карточки */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-xl border bg-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <MessageSquare size={16} />
            <span className="text-xs">Всего обращений</span>
          </div>
          <p className="mt-2 text-xl font-bold">{filteredFeedback.length}</p>
        </div>

        <div className="rounded-xl border bg-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <AlertTriangle size={16} />
            <span className="text-xs">Высокий приоритет</span>
          </div>
          <p className="mt-2 text-xl font-bold">
            {
              filteredFeedback.filter(
                (f) => f.priority === "Высокий" || f.priority === "Критичный"
              ).length
            }
          </p>
        </div>

        <div className="rounded-xl border bg-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin size={16} />
            <span className="text-xs">Район</span>
          </div>
          <p className="mt-2 text-xl font-bold">
            {district === "Весь город" ? "Алматы" : district}
          </p>
        </div>
      </div>

      {/* Таблица */}
      <div className="rounded-xl border border-border bg-card">
        <div className="border-b border-border p-4">
          <h3 className="text-sm font-semibold text-foreground">
            Список обращений
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border">
                <th className="p-3 text-left">Описание</th>
                <th className="p-3 text-left">Категория</th>
                <th className="p-3 text-left">Район</th>
                <th className="p-3 text-left">Приоритет</th>
              </tr>
            </thead>

            <tbody>
              {filteredFeedback.map((item) => (
                <tr key={item.id} className="border-b border-border">
                  <td className="p-3 text-foreground">{item.text}</td>
                  <td className="p-3">{item.category}</td>
                  <td className="p-3">{item.district}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded-full text-[10px] ${
                        item.priority === "Критичный"
                          ? "bg-red-700/10 text-red-700"
                          : item.priority === "Высокий"
                          ? "bg-destructive/10 text-destructive"
                          : item.priority === "Средний"
                          ? "bg-orange-500/10 text-orange-500"
                          : "bg-yellow-400/10 text-yellow-500"
                      }`}
                    >
                      {item.priority}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Карта */}
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <CityMap
          district={district}
          height="300px"
          circles={filteredFeedback.map((item) => ({
            lat:
              item.district === "Алмалинский"
                ? 43.25
                : item.district === "Бостандыкский"
                ? 43.23
                : item.district === "Ауэзовский"
                ? 43.24
                : 43.27,
            lng:
              item.district === "Алмалинский"
                ? 76.94
                : item.district === "Бостандыкский"
                ? 76.91
                : item.district === "Ауэзовский"
                ? 76.88
                : 76.96,
            radius: 400,
            color: getPriorityColor(item.priority),
            label: `${item.category} — ${item.priority}`,
          }))}
        />
      </div>

      {/* AI */}
      <div className="rounded-xl border bg-card p-6">
        <h3 className="text-lg font-semibold mb-2">AI-анализ отзывов</h3>
        <p className="text-sm text-muted-foreground">
          Зафиксировано увеличение жалоб на дороги и ЖКХ. Рекомендуется направить ремонтные службы и провести проверку качества инфраструктуры.
        </p>
      </div>
    </div>
  );
}