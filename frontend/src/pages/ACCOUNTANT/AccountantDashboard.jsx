import { useEffect, useState } from "react";
import Header from "../../components/Header";
import SideBar from "../../components/SideBar";
import api from "../../lib/axios";

export default function AccountantDashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      setError("");
      const res = await api.get("/accountant/dashboard");
      setData(res.data);
    } catch (e) {
      console.error(e);
      setError("Failed to load accountant dashboard.");
    }
  };

  useEffect(() => { load(); }, []);

  if (!data) return <div className="mainContent"><p>{error || "Loading..."}</p></div>;

  return (
    <div className="appMain">
      <Header />
      <div className="mainContentWrapper">
        <SideBar />
        <div className="mainContent">
          <h2 style={{ marginTop: 0 }}>Accountant Dashboard</h2>

          <div className="top-cards">
            <div className="card card1"><div className="card-content">
              <label>Total Fine Amount</label>
              <p className="value">{data.totalFineAmount.toLocaleString("vi-VN")} VND</p>
            </div></div>
            <div className="card card2"><div className="card-content">
              <label>Total Paid Amount</label>
              <p className="value">{data.totalPaidAmount.toLocaleString("vi-VN")} VND</p>
            </div></div>
            <div className="card card3"><div className="card-content">
              <label>Unpaid Fines</label>
              <p className="value">{data.unpaidFinesCount}</p>
            </div></div>
          </div>
        </div>
      </div>
    </div>
  );
}
