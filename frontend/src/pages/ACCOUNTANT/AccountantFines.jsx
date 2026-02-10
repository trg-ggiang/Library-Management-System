import { useEffect, useState } from "react";
import Header from "../../components/Header";
import SideBar from "../../components/SideBar";
import api from "../../lib/axios";

export default function AccountantFines() {
  const [status, setStatus] = useState("all");
  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      setError("");
      const res = await api.get("/accountant/fines", { params: { status } });
      setRows(res.data || []);
    } catch (e) {
      console.error(e);
      setError("Failed to load fines.");
    }
  };

  useEffect(() => { load(); }, [status]);

  const pay = async (id) => {
    try {
      await api.post(`/accountant/fines/${id}/pay`, { method: "CASH" });
      load();
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
          <h2 className="admin-title">Fines</h2>

          <div className="admin-topbar">
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="all">All</option>
              <option value="unpaid">Unpaid</option>
              <option value="paid">Paid</option>
            </select>
            <button className="page-btn" onClick={load}>Refresh</button>
          </div>

          {error && <p className="admin-error">{error}</p>}

          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Reader</th>
                  <th>Book</th>
                  <th>Amount</th>
                  <th>Date</th>
                  <th>Paid</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((f) => (
                  <tr key={f.id}>
                    <td>{f.id}</td>
                    <td>{f.readerName} ({f.readerEmail})</td>
                    <td>{f.bookTitle}</td>
                    <td>{Number(f.amount).toLocaleString("vi-VN")} VND</td>
                    <td>{new Date(f.fineDate).toLocaleDateString("vi-VN")}</td>
                    <td>{f.paid ? "YES" : "NO"}</td>
                    <td>
                      {!f.paid ? (
                        <button className="admin-btn-small" onClick={() => pay(f.id)}>Pay</button>
                      ) : "-"}
                    </td>
                  </tr>
                ))}
                {rows.length === 0 && <tr><td colSpan="7">No fines.</td></tr>}
              </tbody>
            </table>
          </div>

        </div>
      </div>
    </div>
  );
}
