import { useEffect, useState } from "react";
import Header from "../../components/Header";
import SideBar from "../../components/SideBar";
import api from "../../lib/axios";

export default function LibrarianBooks() {
  const [search, setSearch] = useState("");
  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");

  const fetchRows = async () => {
    try {
      setError("");
      const res = await api.get("/librarian/books", { params: { search } });
      setRows(res.data || []);
    } catch (e) {
      console.error(e);
      setError("Failed to load books.");
    }
  };

  useEffect(() => { fetchRows(); }, []);

  return (
    <div className="appMain">
      <Header />
      <div className="mainContentWrapper">
        <SideBar />
        <div className="mainContainer">
          <h2 className="admin-title">Book Catalog</h2>

          <div className="admin-topbar">
            <input className="admin-search" value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Search title/author..." />
            <button className="page-btn" onClick={fetchRows}>Search</button>
          </div>

          {error && <p className="admin-error">{error}</p>}

          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Title</th>
                  <th>Author</th>
                  <th>Genre</th>
                  <th>Available</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((b) => (
                  <tr key={b.id}>
                    <td>{b.id}</td>
                    <td>{b.title}</td>
                    <td>{b.author}</td>
                    <td>{b.genre}</td>
                    <td>{b.availableCopies}</td>
                    <td>{b.totalCopies}</td>
                  </tr>
                ))}
                {rows.length === 0 && <tr><td colSpan="6">No books.</td></tr>}
              </tbody>
            </table>
          </div>

        </div>
      </div>
    </div>
  );
}
