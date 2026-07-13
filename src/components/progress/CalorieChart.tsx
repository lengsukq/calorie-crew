"use client";

interface DayData {
  logDate: string;
  totalKcal: number;
  targetKcal: number;
}

interface CalorieChartProps {
  data: DayData[];
}

export function CalorieChart({ data }: CalorieChartProps) {
  if (data.length === 0) return null;

  const maxKcal = Math.max(...data.map((d) => d.totalKcal), ...data.map((d) => d.targetKcal));
  const chartMax = Math.max(maxKcal * 1.2, 2000);
  const barWidth = Math.max(20, Math.min(40, 600 / data.length));
  const chartHeight = 200;

  const sorted = [...data].sort(
    (a, b) => a.logDate.localeCompare(b.logDate)
  );

  const chartWidth = Math.max(sorted.length * (barWidth + 12), 300);

  return (
    <div className="w-full">
      <svg
        width="100%"
        height={chartHeight + 40}
        viewBox={`0 0 ${chartWidth} ${chartHeight + 40}`}
        preserveAspectRatio="xMidYMid meet"
        className="mx-auto"
      >
        {/* Y-axis labels */}
        <text x="0" y="15" fontSize="10" fill="#94a3b8">{chartMax}</text>
        <text x="0" y={chartHeight / 2 + 5} fontSize="10" fill="#94a3b8">
          {Math.round(chartMax / 2)}
        </text>
        <text x="0" y={chartHeight + 5} fontSize="10" fill="#94a3b8">0</text>

        {/* Grid lines */}
        <line x1="30" y1="0" x2="30" y2={chartHeight} stroke="#e2e8f0" strokeWidth="1" />
        <line x1="30" y1={chartHeight / 2} x2={30 + sorted.length * (barWidth + 12)} y2={chartHeight / 2} stroke="#e2e8f0" strokeWidth="0.5" strokeDasharray="4" />

        {/* Bars */}
        {sorted.map((day, i) => {
          const x = 35 + i * (barWidth + 12);
          const barH = (day.totalKcal / chartMax) * chartHeight;
          const targetY = (1 - day.targetKcal / chartMax) * chartHeight;
          const isOver = day.totalKcal > day.targetKcal;

          return (
            <g key={day.logDate}>
              {/* Target line */}
              <line
                x1={x - 2}
                y1={targetY}
                x2={x + barWidth + 2}
                y2={targetY}
                stroke="#f59e0b"
                strokeWidth="1.5"
                strokeDasharray="3,2"
              />
              {/* Bar */}
              <rect
                x={x}
                y={chartHeight - barH}
                width={barWidth}
                height={barH}
                rx="4"
                fill={isOver ? "#ef4444" : "url(#barGradient)"}
                opacity="0.85"
              />
              {/* Date label */}
              <text
                x={x + barWidth / 2}
                y={chartHeight + 16}
                fontSize="9"
                textAnchor="middle"
                fill="#94a3b8"
              >
                {day.logDate.slice(5)}
              </text>
              {/* Value on top */}
              <text
                x={x + barWidth / 2}
                y={chartHeight - barH - 6}
                fontSize="9"
                textAnchor="middle"
                fill={isOver ? "#ef4444" : "#06b6d4"}
                fontWeight="600"
              >
                {day.totalKcal}
              </text>
            </g>
          );
        })}

        <defs>
          <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#0891b2" />
          </linearGradient>
        </defs>

        {/* Target legend */}
        <line x1="30" y1={chartHeight + 32} x2="40" y2={chartHeight + 32} stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="3,2" />
        <text x="44" y={chartHeight + 36} fontSize="9" fill="#94a3b8">目标</text>
      </svg>
    </div>
  );
}
