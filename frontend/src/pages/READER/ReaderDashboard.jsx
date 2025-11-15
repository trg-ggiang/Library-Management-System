import Header from "../../components/Header.jsx";
import SideBar from "../../components/SideBar.jsx";
import { FaHome, FaUserFriends, FaMoneyBillWave, FaWallet } from "react-icons/fa";

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
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  // Lượt mượn theo tháng (sample)
  const borrowsPerMonth = [120, 95, 140, 180, 160, 175, 210, 220, 190, 205, 230, 250];

  // Tình trạng sách
  const inventoryStatus = {
    labels: ["Còn trong kho", "Đang mượn", "Mất / hỏng"],
    datasets: [
      {
        data: [3200, 680, 45],
        backgroundColor: [
          "rgba(16, 185, 129, 0.9)", // green
          "rgba(59, 130, 246, 0.9)", // blue
          "rgba(239, 68, 68, 0.9)", // red
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
        label: "Lượt mượn",
        data: borrowsPerMonth,
        backgroundColor: "rgba(56, 189, 248, 0.9)", // cyan
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
        title: { display: true, text: "Lượt mượn" },
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
    responsive: true,
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
            {/* === Top cards === */}
            <div className="top-cards">
              <div className="card card1">
                <div className="card-content">
                  <h4>Tổng số đầu sách</h4>
                  <p className="value">3,520</p>
                </div>
                <div className="icon-container">
                  <FaHome />
                </div>
              </div>

              <div className="card card2">
                <div className="card-content">
                  <h4>Tổng số độc giả</h4>
                  <p className="value">1,248</p>
                </div>
                <div className="icon-container">
                  <FaUserFriends />
                </div>
              </div>

              <div className="card card3">
                <div className="card-content">
                  <h4>Sách đang mượn</h4>
                  <p className="value">680</p>
                </div>
                <div className="icon-container">
                  <FaMoneyBillWave />
                </div>
              </div>

              <div className="card card4">
                <div className="card-content">
                  <h4>Doanh thu tháng</h4>
                  <p className="value">12.400.000 VND</p>
                </div>
                <div className="icon-container">
                  <FaWallet />
                </div>
              </div>
            </div>

            {/* === Charts === */}
            <div className="charts">
              {/* Bar chart: Lượt mượn */}
              <div className="chart-left">
                <div className="chart-header">
                  <h3>Lượt mượn theo tháng</h3>
                </div>
                <div className="chart-container chart-center">
                  <Bar data={borrowChartData} options={borrowChartOptions} />
                </div>
              </div>

              {/* Doughnut: Tình trạng sách */}
              <div className="chart-right">
                <h3 style={{ textAlign: "center", marginBottom: "18px" }}>
                  Thống kê thư viện
                </h3>

                <div className="circle-wrapper">
                  <Doughnut
                    data={inventoryStatus}
                    options={doughnutOptions}
                    width={180}
                    height={180}
                    responsive={false}
                  />
                </div>

                <ul className="legend-list">
                  <li>
                    <span className="legend-dot legend-available" />
                    Còn trong kho: <strong>3.200</strong> cuốn
                  </li>
                  <li>
                    <span className="legend-dot legend-borrowed" />
                    Đang mượn: <strong>680</strong> cuốn
                  </li>
                  <li>
                    <span className="legend-dot legend-lost" />
                    Mất / hỏng: <strong>45</strong> cuốn
                  </li>
                </ul>
              </div>
            </div>
            {/* === End Charts === */}
          </div>
        </div>
      </div>
    </div>
  );
}
