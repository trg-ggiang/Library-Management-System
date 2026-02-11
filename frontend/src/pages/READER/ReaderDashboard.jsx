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

  useEffect(() => {
    fetchOverview();
  }, []);

  return (
    <div className="appMain">
      <Header />
      <div className="mainContentWrapper">
        <SideBar />

        <div className="mainContent page-scroll" style={{ maxWidth: 1100, width: "100%" }}>
          {!data ? (
            <p style={{ marginTop: 0, fontWeight: 800 }}>{error || "Đang tải..."}</p>
          ) : (
            <>
              <h2 style={{ marginTop: 0 }}>Reader Dashboard</h2>

              <div className="top-cards">
                <div className="card card1">
                  <div className="card-content">
                    <label>Total Borrowings</label>
                    <p className="value">{data.stats.totalBorrowings}</p>
                  </div>
                </div>
                <div className="card card2">
                  <div className="card-content">
                    <label>Active Borrowings</label>
                    <p className="value">{data.stats.activeBorrowings}</p>
                  </div>
                </div>
                <div className="card card3">
                  <div className="card-content">
                    <label>Overdue</label>
                    <p className="value">{data.stats.overdueBorrowings}</p>
                  </div>
                </div>
                <div className="card card4">
                  <div className="card-content">
                    <label>Total Fines</label>
                    <p className="value">{data.stats.totalFineAmount.toLocaleString("vi-VN")} VND</p>
                  </div>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 14 }}>
                <div style={{ background: "white", borderRadius: 18, padding: 14, border: "1px solid rgba(229,231,235,1)" }}>
                  <h3 style={{ marginTop: 0 }}>Reader Profile</h3>
                  <p><b>Name:</b> {data.reader.name}</p>
                  <p><b>Email:</b> {data.reader.email}</p>
                  <p><b>Phone:</b> {data.reader.phone || "-"}</p>
                  <p><b>Address:</b> {data.reader.address || "-"}</p>
                  <p><b>Gender:</b> {data.reader.gender || "-"}</p>
                  <p><b>DOB:</b> {data.reader.dob ? String(data.reader.dob).slice(0, 10) : "-"}</p>
                </div>

                <div style={{ background: "white", borderRadius: 18, padding: 14, border: "1px solid rgba(229,231,235,1)" }}>
                  <h3 style={{ marginTop: 0 }}>Last 5 Borrows</h3>
                  {data.recentBorrowings.length === 0 ? (
                    <p>Chưa có.</p>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {data.recentBorrowings.map((x) => (
                        <div key={x.id} style={{ border: "1px solid rgba(229,231,235,1)", borderRadius: 14, padding: 10 }}>
                          <b>{x.bookTitle}</b>
                          <div style={{ color: "rgb(100,116,139)", marginTop: 4 }}>
                            Borrow: {new Date(x.borrowDate).toLocaleDateString("vi-VN")} • Due:{" "}
                            {new Date(x.dueDate).toLocaleDateString("vi-VN")}
                            {x.returnDate ? ` • Return: ${new Date(x.returnDate).toLocaleDateString("vi-VN")}` : ""}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
