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
        backgroundColor: "blue",
        borderColor: "blue",
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false, // This will hide the legend
      },
      title: {
        display: true,
        text: "Weight Tracking",
      },
    },
  };

  return <Line data={data} options={options} />;
};

export default WeightGraph;
