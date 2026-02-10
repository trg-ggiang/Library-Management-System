import { useEffect, useState } from "react";
import api from "../../lib/axios";
import Header from "../../components/Header";
import SideBar from "../../components/SideBar";

export default function LibrarianBorrow() {
  const [copies, setCopies] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [readerId, setReaderId] = useState("");
  const [copyId, setCopyId] = useState("");
  const [days, setDays] = useState(14);
  const [message, setMessage] = useState("");

  const fetchCopies = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await api.get("/librarian/available-copies");
      setCopies(res.data || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load copies.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCopies();
  }, []);

  const handleBorrow = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      await api.post("/librarian/borrow", {
        readerId,
        copyId,
        days,
      });
      setMessage("Borrowing created successfully.");
      setCopyId("");
      fetchCopies();
    } catch (err) {
      console.error(err);
      const msg =
        err.response?.data?.message || "Failed to create borrowing.";
      setError(msg);
    }
  };

  const handleReturn = async (id) => {
    setMessage("");
    setError("");
    try {
      await api.post("/librarian/return", { copyId: id });
      setMessage(`Copy #${id} returned successfully.`);
      fetchCopies();
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || "Failed to return book.";
      setError(msg);
    }
  };

  const formatDate = (value) => {
    if (!value) return "-";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "-";
    return d.toLocaleDateString("vi-VN");
  };

  const handleSearchChange = (e) => setSearch(e.target.value);

  const filteredCopies = copies.filter((c) => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return true;
    return (
      (c.title || "").toLowerCase().includes(keyword) ||
      (c.author || "").toLowerCase().includes(keyword) ||
      (c.genre || "").toLowerCase().includes(keyword)
    );
  });

  return (
    <div className="appMain">
      <Header />
      <div className="mainContentWrapper">
        <SideBar />
        <div className="mainContainer">
          <h2 className="admin-title">Librarian – Borrow & Return</h2>

          <div className="admin-topbar librarian-borrow-topbar">
            <input
              type="text"
              className="admin-search"
              value={search}
              onChange={handleSearchChange}
              placeholder="Search by title, author, or genre"
            />

            <form
              className="admin-add-form librarian-borrow-form"
              onSubmit={handleBorrow}
            >
              <div className="librarian-field">
                <input
                  type="number"
                  placeholder="Reader ID"
                  value={readerId}
                  onChange={(e) => setReaderId(e.target.value)}
                  required
                />
              </div>

              <div className="librarian-field">
                <input
                  type="number"
                  placeholder="Copy ID"
                  value={copyId}
                  onChange={(e) => setCopyId(e.target.value)}
                  required
                />
              </div>

              <div className="librarian-field">
                <input
                  type="number"
                  min="1"
                  placeholder="Loan days"
                  value={days}
                  onChange={(e) => setDays(e.target.value)}
                />
              </div>

              <button type="submit" className="admin-btn-add">
                Borrow
              </button>
            </form>
          </div>

          {message && <p className="admin-success">{message}</p>}
          {error && <p className="admin-error">{error}</p>}

          {loading ? (
            <p>Loading...</p>
          ) : filteredCopies.length === 0 ? (
            <p>No copies found.</p>
          ) : (
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Copy ID</th>
                    <th>Book</th>
                    <th>Author</th>
                    <th>Genre</th>
                    <th>Status</th>
                    <th>Reader</th>
                    <th>Due date</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCopies.map((c) => {
                    let statusText = "Unknown";
                    if (c.status === 0) statusText = "Available";
                    else if (c.status === 1) statusText = "Reserved";
                    else if (c.status === 2) statusText = "Borrowed";
                    else if (c.status === 3) statusText = "Lost";
                    else if (c.status === 4) statusText = "Damaged";

                    const readerText = c.readerId
                      ? `Reader #${c.readerId}`
                      : "-";

                    const dueText =
                      c.status === 2 ? formatDate(c.dueDate) : "-";

                    return (
                      <tr key={c.copyId}>
                        <td>{c.copyId}</td>
                        <td>{c.title}</td>
                        <td>{c.author}</td>
                        <td>{c.genre}</td>
                        <td>{statusText}</td>
                        <td>{readerText}</td>
                        <td>{dueText}</td>
                        <td>
                          <div className="admin-user-actions">
                            {c.status === 0 && (
                              <button
                                type="button"
                                onClick={() => setCopyId(c.copyId)}
                                className="admin-btn-small"
                              >
                                Use ID
                              </button>
                            )}
                            {c.status === 2 && (
                              <button
                                type="button"
                                onClick={() => handleReturn(c.copyId)}
                                className="admin-btn-small admin-btn-danger"
                              >
                                Return
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
