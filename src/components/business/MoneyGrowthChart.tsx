import { Line } from 'react-chartjs-2';
import { format } from 'date-fns';
import { useEffect, useState } from 'react';
import { settingsService } from '../../services/settingsService';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface MoneyGrowthChartProps {
  data: {
    month: string;
    totalIncoming: number;
    totalOutgoing: number;
    netGrowth: number;
  }[];
}

export function MoneyGrowthChart({ data }: MoneyGrowthChartProps) {
  const [exchangeRate, setExchangeRate] = useState(3.6725);
  const [currency, setCurrency] = useState<'AED' | 'USD'>('AED');

  useEffect(() => {
    loadExchangeRate();
  }, []);

  const loadExchangeRate = async () => {
    try {
      const settings = await settingsService.getSettings();
      if (settings?.exchange_rate) {
        setExchangeRate(settings.exchange_rate);
      }
    } catch (error) {
      console.error('Error loading exchange rate:', error);
    }
  };

  const convertAmount = (amount: number) => {
    return currency === 'USD' ? amount / exchangeRate : amount;
  };

  // Calculate cumulative growth
  const cumulativeGrowth = data.reduce((acc, curr, index) => {
    const previousTotal = index > 0 ? acc[index - 1] : 0;
    return [...acc, previousTotal + curr.netGrowth];
  }, [] as number[]);

  const chartData = {
    labels: data.map(d => format(new Date(d.month + '-01'), 'MMM yyyy')),
    datasets: [
      {
        label: 'Cumulative Growth',
        data: cumulativeGrowth.map(convertAmount),
        borderColor: '#22c55e',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        fill: true,
        tension: 0.4
      },
      {
        label: 'Monthly Net Growth',
        data: data.map(d => convertAmount(d.netGrowth)),
        borderColor: '#3b82f6',
        backgroundColor: 'transparent',
        borderDash: [5, 5],
        tension: 0.4
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
              currency,
              minimumFractionDigits: 2
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
              currency,
              maximumFractionDigits: 0
            }).format(value);
          }
        }
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <select
          value={currency}
          onChange={(e) => setCurrency(e.target.value as 'AED' | 'USD')}
          className="px-3 py-1.5 bg-background border border-gray-700 rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/50"
        >
          <option value="AED">AED</option>
          <option value="USD">USD</option>
        </select>
      </div>
      <div className="h-[400px]">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
}
