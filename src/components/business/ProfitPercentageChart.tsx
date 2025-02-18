import { Bar } from 'react-chartjs-2';
import { format } from 'date-fns';
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

interface ProfitPercentageChartProps {
  data: {
    month: string;
    profitPercentage: number;
  }[];
}

export function ProfitPercentageChart({ data }: ProfitPercentageChartProps) {
  const chartData = {
    labels: data.map(d => format(new Date(d.month + '-01'), 'MMM yyyy')),
    datasets: [
      {
        label: 'Profit Percentage',
        data: data.map(d => d.profitPercentage),
        backgroundColor: 'rgba(232, 92, 51, 0.5)',
        borderColor: '#e85c33',
        borderWidth: 1
      }
    ]
  };

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
        callbacks: {
          label: (context: any) => {
            return `${context.parsed.y.toFixed(1)}%`;
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
          callback: (value: number) => `${value.toFixed(1)}%`
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
