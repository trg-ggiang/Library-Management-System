import { useEffect, useState } from "react";
import Header from "../../components/Header";
import SideBar from "../../components/SideBar";
import api from "../../lib/axios";

export default function ReaderDashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  const fetchOverview = async () => {
    try {
      setError("");
      const res = await api.get("/dashboard/reader-overview");
      setData(res.data);
    } catch (e) {
      console.error(e);
      setError("Không tải được dashboard reader.");
    }
  };

  useEffect(() => { fetchOverview(); }, []);

  if (!data) {
    return <div className="mainContent"><p>{error || "Đang tải..."}</p></div>;
  }

  const r = data.reader;
  const s = data.stats;

  return (
    <div className="appMain">
      <Header />
      <div className="mainContentWrapper">
        <SideBar />

        <div className="mainContent" style={{ maxWidth: 1100, width: "100%" }}>
          <h2 style={{ marginTop: 0 }}>Reader Dashboard</h2>

          <div className="top-cards">
            <div className="card card1"><div className="card-content">
              <label>Total Borrowings</label><p className="value">{s.totalBorrowings}</p>
            </div></div>
            <div className="card card2"><div className="card-content">
              <label>Active Borrowings</label><p className="value">{s.activeBorrowings}</p>
            </div></div>
            <div className="card card3"><div className="card-content">
              <label>Overdue</label><p className="value">{s.overdueBorrowings}</p>
            </div></div>
            <div className="card card4"><div className="card-content">
              <label>Total Fines</label><p className="value">{s.totalFineAmount.toLocaleString("vi-VN")} VND</p>
            </div></div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 14 }}>
            <div style={{ background: "white", borderRadius: 18, padding: 14, border: "1px solid rgba(229,231,235,1)" }}>
              <h3 style={{ marginTop: 0 }}>Thông tin</h3>
              <p><b>Name:</b> {r.name}</p>
              <p><b>Email:</b> {r.email}</p>
              <p><b>Phone:</b> {r.phone || "-"}</p>
              <p><b>Address:</b> {r.address || "-"}</p>
              <p><b>Gender:</b> {r.gender || "-"}</p>
              <p><b>DOB:</b> {r.dob ? String(r.dob).slice(0,10) : "-"}</p>
            </div>

            <div style={{ background: "white", borderRadius: 18, padding: 14, border: "1px solid rgba(229,231,235,1)" }}>
              <h3 style={{ marginTop: 0 }}>5 lượt mượn gần nhất</h3>
              {data.recentBorrowings.length === 0 ? (
                <p>Chưa có.</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {data.recentBorrowings.map((x) => (
                    <div key={x.id} style={{ border: "1px solid rgba(229,231,235,1)", borderRadius: 14, padding: 10 }}>
                      <b>{x.bookTitle}</b>
                      <div style={{ color: "rgb(100,116,139)", marginTop: 4 }}>
                        Borrow: {new Date(x.borrowDate).toLocaleDateString("vi-VN")} • Due: {new Date(x.dueDate).toLocaleDateString("vi-VN")}
                        {x.returnDate ? ` • Return: ${new Date(x.returnDate).toLocaleDateString("vi-VN")}` : ""}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
