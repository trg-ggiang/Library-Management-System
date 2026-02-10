import { useEffect, useState } from "react";
import Header from "../../components/Header";
import SideBar from "../../components/SideBar";
import api from "../../lib/axios";

export default function AccountantPayments() {
  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      setError("");
      const res = await api.get("/accountant/payments");
      setRows(res.data || []);
    } catch (e) {
      console.error(e);
      setError("Failed to load payments.");
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="appMain">
      <Header />
      <div className="mainContentWrapper">
        <SideBar />
        <div className="mainContainer">
          <h2 className="admin-title">Payments</h2>
          {error && <p className="admin-error">{error}</p>}

          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Amount</th>
                  <th>Method</th>
                  <th>Status</th>
                  <th>Paid at</th>
                  <th>Reader</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((p) => (
                  <tr key={p.id}>
                    <td>{p.id}</td>
                    <td>{Number(p.amount).toLocaleString("vi-VN")} VND</td>
                    <td>{p.method}</td>
                    <td>{p.status}</td>
                    <td>{p.paidAt ? new Date(p.paidAt).toLocaleString("vi-VN") : "-"}</td>
                    <td>{p.order?.reader?.user?.name || "-"}</td>
                  </tr>
                ))}
                {rows.length === 0 && <tr><td colSpan="6">No payments.</td></tr>}
              </tbody>
            </table>
          </div>

        </div>
      </div>
    </div>
  );
}
