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
            {/* Card 1: Tổng tiền phạt */}
            <div className="card card1"><div className="card-content">
              <label>Total Fines Issued</label>
              {/* Đổi sang en-US để hiển thị dấu phẩy (ví dụ: 200,000 VND) */}
              <p className="value">{data.totalFineAmount.toLocaleString("en-US")} VND</p>
            </div></div>

            {/* Card 2: Tổng tiền đã thu */}
            <div className="card card2"><div className="card-content">
              <label>Total Collected</label>
              <p className="value">{data.totalPaidAmount.toLocaleString("en-US")} VND</p>
            </div></div>

            {/* Card 3: Số khoản phạt chưa đóng */}
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