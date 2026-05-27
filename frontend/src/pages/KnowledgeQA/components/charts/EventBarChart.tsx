import React from 'react';
import ReactECharts from 'echarts-for-react';

interface EventBarChartProps {
  data: Array<{ name: string; count: number; color: string }>;
}

const EventBarChart: React.FC<EventBarChartProps> = ({ data }) => {
  const sorted = [...data].sort((a, b) => b.count - a.count);

  const option = {
    tooltip: {
      trigger: 'axis' as const,
      axisPointer: { type: 'shadow' as const },
    },
    grid: {
      left: 10,
      right: 20,
      top: 5,
      bottom: 5,
      containLabel: true,
    },
    xAxis: {
      type: 'value' as const,
      axisLabel: { fontSize: 10, color: '#94a3b8' },
      splitLine: { lineStyle: { color: '#f1f5f9' } },
    },
    yAxis: {
      type: 'category' as const,
      data: sorted.map((d) => d.name),
      axisLabel: { fontSize: 10, color: '#475569' },
      axisLine: { show: false },
      axisTick: { show: false },
    },
    series: [
      {
        type: 'bar',
        data: sorted.map((d) => ({
          value: d.count,
          itemStyle: { color: d.color, borderRadius: [0, 4, 4, 0] },
        })),
        barWidth: 14,
        label: {
          show: true,
          position: 'right' as const,
          fontSize: 10,
          color: '#64748b',
        },
      },
    ],
  };

  return <ReactECharts option={option} style={{ height: sorted.length * 30 + 50, maxHeight: 200 }} />;
};

export default EventBarChart;
