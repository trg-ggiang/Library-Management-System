import { useEffect, useState, useRef } from "react";
import api from "../../lib/axios";
import Header from "../../components/Header";
import SideBar from "../../components/SideBar";
import Chart from "chart.js/auto";

export default function LibrarianDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const barRef = useRef(null);
  const pieRef = useRef(null);
  const barChart = useRef(null);
  const pieChart = useRef(null);

  const fetchStats = async (filters = {}) => {
    try {
      setLoading(true);
      setError("");
      const res = await api.get("/librarian/dashboard", {
        params: filters,
      });
      setStats(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to load dashboard.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    if (!stats) return;

    if (barChart.current) barChart.current.destroy();
    if (pieChart.current) pieChart.current.destroy();

    if (barRef.current) {
      const labels = stats.dailyBorrow.map((d) =>
        new Date(d.day).toLocaleDateString("vi-VN")
      );
      const counts = stats.dailyBorrow.map((d) => d.count);

      barChart.current = new Chart(barRef.current, {
        type: "bar",
        data: {
          labels,
          datasets: [
            {
              label: "Borrow count",
              data: counts,
            },
          ],
        },
        options: {
          scales: {
            x: {
              ticks: {
                maxRotation: 45,
                minRotation: 45,
                autoSkip: true,
                maxTicksLimit: 10,
              },
            },
            y: {
              beginAtZero: true,
              precision: 0,
            },
          },
        },
      });
    }

    if (pieRef.current) {
      pieChart.current = new Chart(pieRef.current, {
        type: "pie",
        data: {
          labels: ["Available", "Borrowed"],
          datasets: [
            {
              data: [stats.available, stats.borrowed],
            },
          ],
        },
      });
    }
  }, [stats]);

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    fetchStats({
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    });
  };

  return (
    <div className="appMain">
      <Header />
      <div className="mainContentWrapper">
        <SideBar />

        <div className="mainContainer">
          <h2 className="admin-title">Librarian Dashboard</h2>

          {loading ? (
            <p>Loading...</p>
          ) : error ? (
            <p className="admin-error">{error}</p>
          ) : !stats ? (
            <p>No data.</p>
          ) : (
            <>
              <div className="top-cards">
                <div className="card card1">
                  <div className="card-content">
                    <h4>Total Book Titles</h4>
                    <div className="value">{stats.totalBooks}</div>
                  </div>
                </div>

                <div className="card card2">
                  <div className="card-content">
                    <h4>Total Copies</h4>
                    <div className="value">{stats.totalCopies}</div>
                  </div>
                </div>

                <div className="card card3">
                  <div className="card-content">
                    <h4>Borrowed</h4>
                    <div className="value">{stats.borrowed}</div>
                  </div>
                </div>

                <div className="card card4">
                  <div className="card-content">
                    <h4>Available</h4>
                    <div className="value">{stats.available}</div>
                  </div>
                </div>
              </div>

              <form
                className="librarian-filters"
                onSubmit={handleFilterSubmit}
              >
                <div className="librarian-filter-label">
                  <input
                    type="date"
                    className="librarian-filter-input"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div className="librarian-filter-label">
                  <input
                    type="date"
                    className="librarian-filter-input"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
                <button type="submit" className="librarian-filter-btn">
                  Apply
                </button>
              </form>

              <div className="charts">
                <div className="chart-left">
                  <div className="chart-header">
                    <h3>Daily Borrowings</h3>
                  </div>
                  <div className="chart-container chart-center">
                    <canvas ref={barRef}></canvas>
                  </div>
                </div>

                <div className="chart-right">
                  <div className="chart-header">
                    <h3>Copy Status</h3>
                  </div>
                  <div className="chart-container chart-center">
                    <canvas ref={pieRef}></canvas>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
