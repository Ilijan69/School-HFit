import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface WeightGraphProps {
  dates: string[];
  weights: number[];
}

const WeightGraph: React.FC<WeightGraphProps> = ({ dates, weights }) => {
  const data = {
    labels: dates,
    datasets: [
      {
        label: "Weight (kg)",
        data: weights,
        fill: false,
        backgroundColor: "#1e4c98",
        borderColor: "#1e4c98",
        borderWidth: 2,
        pointBackgroundColor: "#2922a5",
        pointBorderColor: "#ffffff",
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7,
        tension: 0.3,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "#1e1e20",
        titleFont: {
          size: 14,
          weight: "bold" as const,
        },
        bodyFont: {
          size: 13,
        },
        padding: 10,
        cornerRadius: 8,
        displayColors: false,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          maxRotation: 45,
          minRotation: 45,
          font: {
            size: (context: any) => {
              const width = context.chart.width;
              return width < 400 ? 10 : width < 600 ? 12 : 14;
            },
          },
        },
      },
      y: {
        grid: {
          color: "rgba(255, 255, 255, 0.1)",
        },
        ticks: {
          font: {
            size: (context: any) => {
              const width = context.chart.width;
              return width < 400 ? 10 : width < 600 ? 12 : 14;
            },
          },
        },
      },
    },
    onResize: (chart: any) => {
      const width = chart.width;
      chart.options.scales.x.ticks.font.size = width < 400 ? 10 : width < 600 ? 12 : 14;
      chart.options.scales.y.ticks.font.size = width < 400 ? 10 : width < 600 ? 12 : 14;
    },
  };

  return (
    <div style={{ width: "100%", height: "300px", marginTop: "20px" }}>
      <Line data={data} options={options} />
    </div>
  );
};

export default WeightGraph;
