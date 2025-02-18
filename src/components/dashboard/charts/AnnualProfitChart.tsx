import { useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface AnnualProfitChartProps {
  data: {
    year: number;
    profit: number;
    expenses: number;
    revenue: number;
  }[];
}

export function AnnualProfitChart({ data }: AnnualProfitChartProps) {
  const chartData = useMemo(() => ({
    labels: data.map(d => d.year.toString()),
    datasets: [
      {
        label: 'Revenue',
        data: data.map(d => d.revenue),
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        borderColor: '#3b82f6',
        borderWidth: 1
      },
      {
        label: 'Expenses',
        data: data.map(d => d.expenses),
        backgroundColor: 'rgba(239, 68, 68, 0.5)',
        borderColor: '#ef4444',
        borderWidth: 1
      },
      {
        label: 'Profit',
        data: data.map(d => d.profit),
        backgroundColor: 'rgba(34, 197, 94, 0.5)',
        borderColor: '#22c55e',
        borderWidth: 1
      }
    ]
  }), [data]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#a1a1a1'
        }
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        callbacks: {
          label: (context: any) => {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            label += new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'AED'
            }).format(context.parsed.y);
            return label;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(75, 85, 99, 0.2)'
        },
        ticks: {
          color: '#a1a1a1'
        }
      },
      y: {
        grid: {
          color: 'rgba(75, 85, 99, 0.2)'
        },
        ticks: {
          color: '#a1a1a1',
          callback: (value: number) => {
            return new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'AED',
              maximumFractionDigits: 0
            }).format(value);
          }
        }
      }
    }
  };

  return (
    <div className="h-[400px]">
      <Bar data={chartData} options={options} />
    </div>
  );
}
