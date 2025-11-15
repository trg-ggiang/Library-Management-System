import Header from "../../components/Header.jsx";
import SideBar from "../../components/SideBar.jsx";
import { FaBook, FaUsers, FaClipboardList, FaWallet } from "react-icons/fa";

import { Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";

ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  ArcElement
);

export default function Dashboard() {
  const months = [
    "Jan","Feb","Mar","Apr","May","Jun",
    "Jul","Aug","Sep","Oct","Nov","Dec",
  ];

  const borrowsPerMonth = [120, 95, 140, 180, 160, 175, 210, 220, 190, 205, 230, 250];

  const inventoryStatus = {
    labels: ["Available", "Borrowed", "Lost / Damaged"],
    datasets: [
      {
        data: [3200, 680, 45],
        backgroundColor: [
          "rgba(16, 185, 129, 0.9)",
          "rgba(59, 130, 246, 0.9)",
          "rgba(239, 68, 68, 0.9)",
        ],
        hoverBackgroundColor: [
          "rgba(16, 185, 129, 1)",
          "rgba(59, 130, 246, 1)",
          "rgba(239, 68, 68, 1)",
        ],
        borderWidth: 0,
      },
    ],
  };

  const borrowChartData = {
    labels: months,
    datasets: [
      {
        type: "bar",
        label: "Monthly Borrow Count",
        data: borrowsPerMonth,
        backgroundColor: "rgba(24, 170, 215, 0.9)", 
        barThickness: 18,
        maxBarThickness: 22,
        borderRadius: 8,
      },
    ],
  };

  const borrowChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
        align: "center",
        labels: { boxWidth: 12, padding: 16 },
      },
      title: { display: false },
      tooltip: { mode: "index", intersect: false },
    },
    scales: {
      x: { grid: { display: false } },
      y: {
        beginAtZero: true,
        title: { display: true, text: "Borrow Count" },
        grid: { color: "rgba(148, 163, 184, 0.35)" },
      },
    },
    onHover: (event, chartElement) => {
      if (event?.native?.target) {
        event.native.target.style.cursor =
          chartElement.length > 0 ? "pointer" : "default";
      }
    },
  };

  const doughnutOptions = {
    responsive: false,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
  };

  return (
    <div className="appMain">
      <Header />
      <div className="mainContentWrapper">
        <SideBar />
        <div className="mainContent">
          <div className="dashboard">

            <div className="top-cards">
              <div className="card card1">
                <div className="card-content">
                  <label>Total Book Titles</label>
                  <p className="value">3,520</p>
                </div>
                <div className="icon-container">
                  <FaBook />
                </div>
              </div>

              <div className="card card2">
                <div className="card-content">
                  <label>Total Registered Readers</label>
                  <p className="value">1,248</p>
                </div>
                <div className="icon-container">
                  <FaUsers />
                </div>
              </div>

              <div className="card card3">
                <div className="card-content">
                  <label>Books Currently Borrowed</label>
                  <p className="value">680</p>
                </div>
                <div className="icon-container">
                  <FaClipboardList />
                </div>
              </div>

              <div className="card card4">
                <div className="card-content">
                  <label>Monthly Borrow Fee Revenue</label>
                  <p className="value">12,400,000 VND</p>
                </div>
                <div className="icon-container">
                  <FaWallet />
                </div>
              </div>
            </div>

            <div className="charts">
              <div className="chart-left">
                <div className="chart-header">
                  <h3>Monthly Borrow Count</h3>
                </div>
                <div className="chart-container chart-center">
                  <Bar data={borrowChartData} options={borrowChartOptions} />
                </div>
              </div>

              <div className="chart-right">
                <h3 style={{ textAlign: "center", marginBottom: "18px" }}>
                  Library Book Status
                </h3>

                <div className="circle-wrapper">
                  <Doughnut
                    data={inventoryStatus}
                    options={doughnutOptions}
                    width={170}
                    height={170}
                  />
                </div>

                <ul className="legend-list">
                  <li>
                    <span className="legend-dot legend-available" />
                    Available: <strong>3,200</strong> books
                  </li>
                  <li>
                    <span className="legend-dot legend-borrowed" />
                    Borrowed: <strong>680</strong> books
                  </li>
                  <li>
                    <span className="legend-dot legend-lost" />
                    Lost / Damaged: <strong>45</strong> books
                  </li>
                </ul>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
