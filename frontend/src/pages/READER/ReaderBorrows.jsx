import { useEffect, useState } from "react";
import Header from "../../components/Header";
import SideBar from "../../components/SideBar";
import api from "../../lib/axios";

export default function ReaderBorrows() {
  const [type, setType] = useState("all");
  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");

  const fetchRows = async () => {
    try {
      setError("");
      const res = await api.get("/reader/me/borrows", { params: { type } });
      setRows(res.data || []);
    } catch (e) {
      console.error(e);
      setError("Không tải được lịch sử mượn.");
    }
  };

  useEffect(() => { fetchRows(); }, [type]);

  return (
    <div className="appMain">
      <Header />
      <div className="mainContentWrapper">
        <SideBar />
        <div className="mainContainer">

          <div className="admin-topbar">
            <select value={type} onChange={(e) => setType(e.target.value)}>
              <option value="all">Tất cả</option>
              <option value="active">Đang mượn</option>
            </select>
            <button className="page-btn" onClick={fetchRows}>Refresh</button>
          </div>

          {error && <p className="admin-error">{error}</p>}

          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Book</th>
                  <th>Copy</th>
                  <th>Borrow</th>
                  <th>Due</th>
                  <th>Return</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((b) => (
                  <tr key={b.id}>
                    <td>{b.id}</td>
                    <td>{b.book?.title}</td>
                    <td>{b.copyId}</td>
                    <td>{new Date(b.borrowDate).toLocaleDateString("vi-VN")}</td>
                    <td>{new Date(b.dueDate).toLocaleDateString("vi-VN")}</td>
                    <td>{b.returnDate ? new Date(b.returnDate).toLocaleDateString("vi-VN") : "-"}</td>
                    <td>{b.status === 1 ? "ACTIVE" : "DONE"}</td>
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr><td colSpan="7">Không có dữ liệu.</td></tr>
                )}
              </tbody>
            </table>
          </div>

        </div>
      </div>
    </div>
  );
}
