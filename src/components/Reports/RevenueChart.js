
// src/components/Reports/RevenueChart.js
import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler // Thêm Filler nếu muốn tô màu vùng dưới đường line
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

const RevenueChart = ({ chartData, timePeriodLabel }) => {
  const data = {
    labels: chartData.labels, // Mảng các nhãn (ví dụ: ngày, tháng)
    datasets: [
      {
        label: `Doanh thu (${timePeriodLabel || ''})`,
        data: chartData.values, // Mảng các giá trị doanh thu
        borderColor: 'rgb(54, 162, 235)',
        backgroundColor: 'rgba(54, 162, 235, 0.2)', // Màu nền dưới đường line
        tension: 0.1, // Độ cong của đường
        fill: true, // Tô màu vùng dưới
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false, // Cho phép đặt chiều cao tùy ý
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Biểu đồ Doanh Thu',
        font: { size: 16 }
      },
      tooltip: {
        callbacks: {
            label: function(context) {
                let label = context.dataset.label || '';
                if (label) {
                    label += ': ';
                }
                if (context.parsed.y !== null) {
                    label += new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(context.parsed.y);
                }
                return label;
            }
        }
      }
    },
    scales: {
        y: {
            beginAtZero: true,
            ticks: {
                callback: function(value) {
                    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', notation: 'compact' }).format(value);
                }
            }
        }
    }
  };

  return <div style={{ height: '350px', position: 'relative' }}><Line options={options} data={data} /></div>;
};

export default RevenueChart;