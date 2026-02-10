import { useEffect, useMemo, useState } from "react";
import Header from "../../components/Header";
import SideBar from "../../components/SideBar";
import api from "../../lib/axios";

export default function LibrarianBooks() {
  const [search, setSearch] = useState("");
  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const safeRows = useMemo(() => (Array.isArray(rows) ? rows : []), [rows]);

  const fetchRows = async (overrideSearch) => {
    try {
      setLoading(true);
      setError("");

      const q = typeof overrideSearch === "string" ? overrideSearch : search;

      const res = await api.get("/librarian/books", {
        params: { search: q?.trim() || "" },
      });

      const data = res.data;

      const items = Array.isArray(data)
        ? data
        : Array.isArray(data?.items)
        ? data.items
        : [];

      setRows(items);
    } catch (e) {
      console.error(e);
      setRows([]);
      setError("Failed to load books.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRows("");
  }, []);

  const onSubmit = (e) => {
    e.preventDefault();
    fetchRows(search);
  };

  return (
    <div className="appMain">
      <Header />
      <div className="mainContentWrapper">
        <SideBar />

        <div className="mainContainer">
          <h2 className="admin-title">Book Catalog</h2>

          <form className="admin-topbar" onSubmit={onSubmit}>
            <input
              className="admin-search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search title/author..."
            />
            <button className="page-btn" type="submit" disabled={loading}>
              {loading ? "Loading..." : "Search"}
            </button>
          </form>

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
                {safeRows.map((b) => (
                  <tr key={b.id}>
                    <td>{b.id}</td>
                    <td>{b.title}</td>
                    <td>{b.author}</td>
                    <td>{b.genre}</td>
                    <td>{b.availableCopies ?? "-"}</td>
                    <td>{b.totalCopies ?? "-"}</td>
                  </tr>
                ))}

                {!loading && safeRows.length === 0 && (
                  <tr>
                    <td colSpan="6">No books.</td>
                  </tr>
                )}

                {loading && (
                  <tr>
                    <td colSpan="6">Loading...</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
