import { useEffect, useState } from "react";
import Header from "../../components/Header";
import SideBar from "../../components/SideBar";
import api from "../../lib/axios";

export default function ReaderFines() {
  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");

  const fetchRows = async () => {
    try {
      setError("");
      const res = await api.get("/reader/me/fines");
      setRows(res.data || []);
    } catch (e) {
      console.error(e);
      setError("Không tải được fines.");
    }
  };

  useEffect(() => { fetchRows(); }, []);

  const pay = async (id) => {
    try {
      await api.post(`/reader/fines/${id}/pay`, { method: "MOCK" });
      fetchRows();
    } catch (e) {
      console.error(e);
      alert(e.response?.data?.message || "Pay failed");
    }
  };

  return (
    <div className="appMain">
      <Header />
      <div className="mainContentWrapper">
        <SideBar />
        <div className="mainContainer">
          <h2 className="admin-title">My Fines</h2>
          {error && <p className="admin-error">{error}</p>}

          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Book</th>
                  <th>Amount</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((f) => (
                  <tr key={f.id}>
                    <td>{f.id}</td>
                    <td>{f.bookTitle}</td>
                    <td>{Number(f.amount).toLocaleString("vi-VN")} VND</td>
                    <td>{new Date(f.fineDate).toLocaleDateString("vi-VN")}</td>
                    <td>{f.paid ? "PAID" : "UNPAID"}</td>
                    <td>
                      {!f.paid ? (
                        <button className="admin-btn-small" onClick={() => pay(f.id)}>
                          Pay (mock)
                        </button>
                      ) : "-"}
                    </td>
                  </tr>
                ))}
                {rows.length === 0 && <tr><td colSpan="6">Không có fines.</td></tr>}
              </tbody>
            </table>
          </div>

        </div>
      </div>
    </div>
  );
}
