// Helper to generate slightly varied numbers per district
function vary(base: number, seed: number, range = 0.3): number {
  const factor = 1 + (((seed * 7 + 13) % 100) / 100 - 0.5) * range;
  return Math.round(base * factor * 10) / 10;
}

const districtSeeds: Record<string, number> = {
  "Весь город": 0,
  "Алмалинский": 1,
  "Ауэзовский": 2,
  "Бостандыкский": 3,
  "Жетысуский": 4,
  "Медеуский": 5,
  "Наурызбайский": 6,
  "Турксибский": 7,
  "Алатауский": 8,
};

export function getOverviewData(district: string) {
  const s = districtSeeds[district] ?? 0;
  return {
    stats: {
      population: vary(4.2, s, 0.4).toFixed(1),
      populationChange: `↑ ${vary(2.3, s + 1, 0.5).toFixed(1)}%`,
      transport: Math.round(vary(82, s + 2, 0.25)),
      transportChange: `↓ ${Math.round(vary(5, s + 3, 0.6))}%`,
      airDays: Math.round(vary(14, s + 4, 0.5)),
      airChange: `↑ ${Math.round(vary(3, s + 5, 0.7))} дня`,
      incidents: vary(9.1, s + 6, 0.4).toFixed(1),
      incidentsChange: `↓ ${Math.round(vary(12, s + 7, 0.5))}%`,
    },
    populationData: [
      { month: "Янв", value: Math.round(vary(4100, s, 0.15)) },
      { month: "Фев", value: Math.round(vary(4050, s + 1, 0.15)) },
      { month: "Мар", value: Math.round(vary(4120, s + 2, 0.15)) },
      { month: "Апр", value: Math.round(vary(4150, s + 3, 0.15)) },
      { month: "Май", value: Math.round(vary(4200, s + 4, 0.15)) },
      { month: "Июн", value: Math.round(vary(4180, s + 5, 0.15)) },
    ],
    issues: [
      { category: "Дороги", priority: s % 3 === 0 ? "Высокий" : "Средний", district: district === "Весь город" ? "Алмалинский" : district, status: "В процессе" },
      { category: "Воздух", priority: "Средний", district: district === "Весь город" ? "Медеуский" : district, status: "Мониторинг" },
      { category: "Водоснабжение", priority: s % 2 === 0 ? "Высокий" : "Низкий", district: district === "Весь город" ? "Бостандыкский" : district, status: s % 2 === 0 ? "Критично" : "Норма" },
      { category: "Энергия", priority: "Низкий", district: district === "Весь город" ? "Ауэзовский" : district, status: "Норма" },
    ],
    insights: [
      { text: `Рост населения +${vary(2.3, s, 0.5).toFixed(1)}% за квартал`, type: "positive" as const },
      { text: `Качество воздуха ниже нормы в ${Math.round(vary(3, s + 1, 0.6))} районах`, type: "negative" as const },
      { text: `Снижение аварий на дорогах на ${Math.round(vary(15, s + 2, 0.4))}%`, type: "positive" as const },
    ],
  };
}

export function getTransportData(district: string) {
  const s = districtSeeds[district] ?? 0;
  return {
    stats: {
      trips: new Intl.NumberFormat("ru-RU").format(Math.round(vary(1284502, s, 0.3))),
      tripsChange: `↑ ${vary(3.2, s, 0.5).toFixed(1)}%`,
      buses: new Intl.NumberFormat("ru-RU").format(Math.round(vary(1842, s + 1, 0.25))),
      metro: `${Math.round(vary(124, s + 2, 0.3))}K`,
      incidents: Math.round(vary(23, s + 3, 0.5)),
      incidentsChange: `↓ ${Math.round(vary(8, s + 4, 0.6))}%`,
    },
    trafficData: [
      { time: "06:00", load: Math.round(vary(25, s, 0.3)) },
      { time: "07:00", load: Math.round(vary(55, s + 1, 0.2)) },
      { time: "08:00", load: Math.round(vary(85, s + 2, 0.15)) },
      { time: "09:00", load: Math.round(vary(78, s + 3, 0.2)) },
      { time: "10:00", load: Math.round(vary(60, s + 4, 0.25)) },
      { time: "11:00", load: Math.round(vary(45, s + 5, 0.3)) },
      { time: "12:00", load: Math.round(vary(50, s + 6, 0.2)) },
      { time: "13:00", load: Math.round(vary(55, s + 7, 0.2)) },
      { time: "14:00", load: Math.round(vary(48, s, 0.25)) },
      { time: "15:00", load: Math.round(vary(52, s + 1, 0.2)) },
      { time: "16:00", load: Math.round(vary(65, s + 2, 0.2)) },
      { time: "17:00", load: Math.round(vary(88, s + 3, 0.15)) },
      { time: "18:00", load: Math.round(vary(92, s + 4, 0.15)) },
      { time: "19:00", load: Math.round(vary(70, s + 5, 0.2)) },
      { time: "20:00", load: Math.round(vary(40, s + 6, 0.3)) },
    ],
    flowData: [
      { road: "Аль-Фараби", avgSpeed: `${Math.round(vary(42, s, 0.2))} км/ч`, flow: `${new Intl.NumberFormat("ru-RU").format(Math.round(vary(4720, s, 0.2)))} авт/ч`, load: `${Math.round(vary(78, s, 0.2))}%` },
      { road: "Абая", avgSpeed: `${Math.round(vary(35, s + 1, 0.2))} км/ч`, flow: `${new Intl.NumberFormat("ru-RU").format(Math.round(vary(3840, s + 1, 0.2)))} авт/ч`, load: `${Math.round(vary(65, s + 1, 0.2))}%` },
      { road: "Райымбека", avgSpeed: `${Math.round(vary(28, s + 2, 0.2))} км/ч`, flow: `${new Intl.NumberFormat("ru-RU").format(Math.round(vary(5100, s + 2, 0.2)))} авт/ч`, load: `${Math.round(vary(88, s + 2, 0.15))}%` },
      { road: "Толе Би", avgSpeed: `${Math.round(vary(38, s + 3, 0.2))} км/ч`, flow: `${new Intl.NumberFormat("ru-RU").format(Math.round(vary(2950, s + 3, 0.2)))} авт/ч`, load: `${Math.round(vary(52, s + 3, 0.25))}%` },
      { road: "Сейфуллина", avgSpeed: `${Math.round(vary(30, s + 4, 0.2))} км/ч`, flow: `${new Intl.NumberFormat("ru-RU").format(Math.round(vary(4200, s + 4, 0.2)))} авт/ч`, load: `${Math.round(vary(72, s + 4, 0.2))}%` },
    ],
  };
}

export function getHousingData(district: string) {
  const s = districtSeeds[district] ?? 0;
  return {
    stats: {
      water: vary(96.2, s, 0.05).toFixed(1),
      waterChange: `↑ ${vary(0.5, s, 0.5).toFixed(1)}%`,
      electricity: new Intl.NumberFormat("ru-RU").format(Math.round(vary(1240, s + 1, 0.25))),
      heat: Math.round(vary(842, s + 2, 0.2)),
      accidents: vary(42.5, s + 3, 0.35).toFixed(1),
      accidentsChange: `↓ ${Math.round(vary(12, s + 4, 0.5))}%`,
    },
    electricityData: [
      { month: "Янв", value: Math.round(vary(420, s, 0.2)) },
      { month: "Фев", value: Math.round(vary(380, s + 1, 0.2)) },
      { month: "Мар", value: Math.round(vary(350, s + 2, 0.2)) },
      { month: "Апр", value: Math.round(vary(310, s + 3, 0.2)) },
      { month: "Май", value: Math.round(vary(280, s + 4, 0.2)) },
      { month: "Июн", value: Math.round(vary(320, s + 5, 0.2)) },
    ],
    gasDemandData: [
      { month: "Янв", value: Math.round(vary(850, s, 0.2)) },
      { month: "Фев", value: Math.round(vary(780, s + 1, 0.2)) },
      { month: "Мар", value: Math.round(vary(620, s + 2, 0.2)) },
      { month: "Апр", value: Math.round(vary(450, s + 3, 0.2)) },
      { month: "Май", value: Math.round(vary(280, s + 4, 0.2)) },
      { month: "Июн", value: Math.round(vary(220, s + 5, 0.2)) },
    ],
    incidents: [
      { type: "Прорыв трубы", district: district === "Весь город" ? "Алмалинский" : district, date: "02.04.2024", status: "Устранен" },
      { type: "Отключение воды", district: district === "Весь город" ? "Бостандыкский" : district, date: "01.04.2024", status: s % 2 === 0 ? "В работе" : "Устранен" },
      { type: "Авария теплосети", district: district === "Весь город" ? "Медеуский" : district, date: "01.04.2024", status: "Критично" },
      { type: "Обрыв линии", district: district === "Весь город" ? "Ауэзовский" : district, date: "31.03.2024", status: "Устранен" },
    ],
    utilityDistricts: [
      { name: "Алмалинский", load: Math.round(vary(87, s, 0.15)) },
      { name: "Бостандыкский", load: Math.round(vary(72, s + 1, 0.2)) },
      { name: "Медеуский", load: Math.round(vary(91, s + 2, 0.1)) },
      { name: "Ауэзовский", load: Math.round(vary(65, s + 3, 0.2)) },
      { name: "Жетысуский", load: Math.round(vary(78, s + 4, 0.15)) },
    ],
  };
}

export function getEcologyData(district: string) {
  const s = districtSeeds[district] ?? 0;
  const aqi = Math.round(vary(124, s, 0.3));
  const pm25 = Math.round(vary(45, s + 1, 0.35));
  const no2 = vary(22.8, s + 2, 0.3).toFixed(1);
  return {
    stats: { aqi, pm25, no2, temp: Math.round(vary(9, s + 3, 0.4)) },
    weather: {
      temp: Math.round(vary(9, s + 3, 0.4)),
      feelsLike: Math.round(vary(6, s + 4, 0.5)),
      humidity: Math.round(vary(62, s + 5, 0.2)),
      wind: vary(3.4, s + 6, 0.3).toFixed(1),
      pm10: Math.round(vary(52, s + 7, 0.3)),
    },
    pollutants: [
      { name: "PM 2.5", value: pm25, limit: 35, unit: "µg/m³", color: pm25 > 35 ? "bg-destructive" : "bg-stat-green" },
      { name: "PM 10", value: Math.round(vary(78, s + 1, 0.25)), limit: 100, unit: "µg/m³", color: "bg-warning" },
      { name: "NO₂", value: parseFloat(no2), limit: 40, unit: "µg/m³", color: "bg-stat-green" },
      { name: "CO", value: vary(1.2, s + 3, 0.4).toFixed(1), limit: 4, unit: "mg/m³", color: "bg-stat-green" },
      { name: "O₃", value: Math.round(vary(55, s + 4, 0.3)), limit: 70, unit: "µg/m³", color: "bg-warning" },
    ],
    monthlyAqi: [
      { month: "Янв", aqi: Math.round(vary(165, s, 0.2)) },
      { month: "Фев", aqi: Math.round(vary(148, s + 1, 0.2)) },
      { month: "Мар", aqi: Math.round(vary(132, s + 2, 0.2)) },
      { month: "Апр", aqi: Math.round(vary(118, s + 3, 0.2)) },
      { month: "Май", aqi: Math.round(vary(95, s + 4, 0.2)) },
      { month: "Июн", aqi: Math.round(vary(124, s + 5, 0.2)) },
    ],
    districtName: district === "Весь город" ? "Алмалинский" : district,
  };
}
