import { useEffect, useState } from "react";
import Header from "../../components/Header";
import SideBar from "../../components/SideBar";
import api from "../../lib/axios";

export default function LibrarianReaders() {
  const [search, setSearch] = useState("");
  const [rows, setRows] = useState([]);
  const [detail, setDetail] = useState(null);
  const [error, setError] = useState("");

  const fetchRows = async () => {
    try {
      setError("");
      const res = await api.get("/librarian/readers", { params: { search } });
      setRows(res.data || []);
    } catch (e) {
      console.error(e);
      setError("Failed to load readers.");
    }
  };

  useEffect(() => { fetchRows(); }, []);

  const openDetail = async (readerId) => {
    try {
      const res = await api.get(`/librarian/readers/${readerId}`);
      setDetail(res.data);
    } catch (e) {
      console.error(e);
      alert("Failed to load reader detail");
    }
  };

  return (
    <div className="appMain">
      <Header />
      <div className="mainContentWrapper">
        <SideBar />
        <div className="mainContainer">
          <h2 className="admin-title">Readers</h2>

          <div className="admin-topbar">
            <input
              className="admin-search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name/email..."
            />
            <button className="page-btn" onClick={fetchRows}>Search</button>
          </div>

          {error && <p className="admin-error">{error}</p>}

          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ReaderID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Registered</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.readerId}>
                    <td>{r.readerId}</td>
                    <td>{r.name}</td>
                    <td>{r.email}</td>
                    <td>{r.phone || "-"}</td>
                    <td>{r.registrationDate ? new Date(r.registrationDate).toLocaleDateString("vi-VN") : "-"}</td>
                    <td>
                      <button className="admin-btn-small" onClick={() => openDetail(r.readerId)}>View</button>
                    </td>
                  </tr>
                ))}
                {rows.length === 0 && <tr><td colSpan="6">No readers.</td></tr>}
              </tbody>
            </table>
          </div>

          {detail && (
            <div className="modal-backdrop">
              <div className="modal" style={{ maxWidth: 900 }}>
                <h3>Reader Detail — {detail.profile?.user?.name}</h3>

                <div style={{ marginTop: 10 }}>
                  <b>Borrowings</b>
                  <div className="admin-table-wrapper" style={{ marginTop: 8 }}>
                    <table className="admin-table">
                      <thead>
                        <tr><th>ID</th><th>Book</th><th>Copy</th><th>Borrow</th><th>Due</th><th>Return</th></tr>
                      </thead>
                      <tbody>
                        {detail.borrowings.map((b) => (
                          <tr key={b.id}>
                            <td>{b.id}</td>
                            <td>{b.bookTitle}</td>
                            <td>{b.copyId}</td>
                            <td>{new Date(b.borrowDate).toLocaleDateString("vi-VN")}</td>
                            <td>{new Date(b.dueDate).toLocaleDateString("vi-VN")}</td>
                            <td>{b.returnDate ? new Date(b.returnDate).toLocaleDateString("vi-VN") : "-"}</td>
                          </tr>
                        ))}
                        {detail.borrowings.length === 0 && <tr><td colSpan="6">No borrowings.</td></tr>}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div style={{ marginTop: 10 }}>
                  <b>Fines</b>
                  <div className="admin-table-wrapper" style={{ marginTop: 8 }}>
                    <table className="admin-table">
                      <thead>
                        <tr><th>ID</th><th>Book</th><th>Amount</th><th>Date</th><th>Paid</th></tr>
                      </thead>
                      <tbody>
                        {detail.fines.map((f) => (
                          <tr key={f.id}>
                            <td>{f.id}</td>
                            <td>{f.bookTitle}</td>
                            <td>{Number(f.amount).toLocaleString("vi-VN")} VND</td>
                            <td>{new Date(f.fineDate).toLocaleDateString("vi-VN")}</td>
                            <td>{f.paid ? "YES" : "NO"}</td>
                          </tr>
                        ))}
                        {detail.fines.length === 0 && <tr><td colSpan="5">No fines.</td></tr>}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="form-actions" style={{ marginTop: 10 }}>
                  <button className="btn-secondary" onClick={() => setDetail(null)}>Close</button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
