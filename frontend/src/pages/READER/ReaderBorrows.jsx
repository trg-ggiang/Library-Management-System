import { useEffect, useState } from "react";
import Header from "../../components/Header";
import SideBar from "../../components/SideBar";
import api from "../../lib/axios";

function statusLabel(s) {
  return s === 1 ? "ACTIVE" : "DONE";
}

export default function ReaderBorrows() {
  const [type, setType] = useState("all");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchRows = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await api.get("/reader/me/borrows", { params: { type } });
      setRows(res.data || []);
    } catch (e) {
      console.error(e);
      setError("Không tải được lịch sử mượn.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRows();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type]);

  return (
    <div className="appMain">
      <Header />
      <div className="mainContentWrapper">
        <SideBar />

        {/* đổi mainContainer -> mainContent cho giống các page Reader khác */}
        <div className="mainContent">
          <div className="reader-shop" style={{ width: "100%" }}>
            {/* TOP BAR đẹp gọn */}
            <div className="borrow-toolbar">
              <h2 style={{ margin: 0 }}>Borrow History</h2>

              <div className="borrow-actions">
                <select
                  className="shop-select"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                >
                  <option value="all">Tất cả</option>
                  <option value="active">Đang mượn</option>
                </select>

                
              </div>
            </div>

            {error && <p style={{ color: "red", fontWeight: 700 }}>{error}</p>}

            {/* TABLE CARD */}
            <div className="borrow-table-card">
              <div className="borrow-table-wrap">
                <table className="borrow-table">
                  <thead>
                    <tr>
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
                       
                        <td>
                          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                            <img
                              src={b.book?.coverUrl || "/book-placeholder.png"}
                              alt={b.book?.title || "book"}
                              style={{
                                width: 36,
                                height: 52,
                                objectFit: "cover",
                                borderRadius: 8,
                                border: "1px solid rgba(229,231,235,1)",
                              }}
                              onError={(e) => {
                                e.currentTarget.src = "/book-placeholder.png";
                              }}
                            />
                            <b>{b.book?.title || "-"}</b>
                          </div>
                        </td>

                        <td>{b.copyId}</td>
                        <td>{new Date(b.borrowDate).toLocaleDateString("vi-VN")}</td>
                        <td>{new Date(b.dueDate).toLocaleDateString("vi-VN")}</td>
                        <td>
                          {b.returnDate
                            ? new Date(b.returnDate).toLocaleDateString("vi-VN")
                            : "-"}
                        </td>

                        <td>
                          <span className={`borrow-badge ${b.status === 1 ? "active" : "done"}`}>
                            {statusLabel(b.status)}
                          </span>
                        </td>
                      </tr>
                    ))}

                    {rows.length === 0 && !loading && (
                      <tr>
                        <td colSpan="7" style={{ padding: 14 }}>
                          Không có dữ liệu.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
