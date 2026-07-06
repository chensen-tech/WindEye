import React from 'react';
import ReactECharts from 'echarts-for-react';

interface RiskPieChartProps {
  highCount: number;
  mediumCount: number;
  lowCount: number;
}

const RiskPieChart: React.FC<RiskPieChartProps> = ({ highCount, mediumCount, lowCount }) => {
  const total = highCount + mediumCount + lowCount;

  const option = {
    tooltip: {
      trigger: 'item' as const,
      formatter: '{b}: {c} ({d}%)',
    },
    legend: {
      bottom: 0,
      textStyle: { fontSize: 11 },
    },
    series: [
      {
        type: 'pie',
        radius: ['45%', '72%'],
        center: ['50%', '45%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 4,
          borderColor: '#fff',
          borderWidth: 2,
        },
        label: { show: false },
        emphasis: {
          label: { show: true, fontWeight: 'bold' },
        },
        data: [
          { value: highCount, name: '高风险', itemStyle: { color: '#f5222d' } },
          { value: mediumCount, name: '中风险', itemStyle: { color: '#faad14' } },
          { value: lowCount, name: '低风险', itemStyle: { color: '#52c41a' } },
        ],
      },
    ],
    graphic: total > 0
      ? [
          {
            type: 'text',
            left: 'center',
            top: '38%',
            style: {
              text: String(total),
              textAlign: 'center' as const,
              fill: '#1e293b',
              fontSize: 22,
              fontWeight: 'bold',
            },
          },
          {
            type: 'text',
            left: 'center',
            top: '48%',
            style: {
              text: '路径总数',
              textAlign: 'center' as const,
              fill: '#94a3b8',
              fontSize: 11,
            },
          },
        ]
      : [],
  };

  return <ReactECharts option={option} style={{ height: 200 }} />;
};

export default RiskPieChart;
