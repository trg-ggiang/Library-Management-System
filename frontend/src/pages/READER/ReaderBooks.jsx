import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../../components/Header";
import SideBar from "../../components/SideBar";
import api from "../../lib/axios";
import useCartStore from "../../store/useCartStore";
function shortText(s, n = 140) {
  if (!s) return "";
  return s.length > n ? s.slice(0, n) + "..." : s;
}

export default function ReaderBooks() {
  const addItem = useCartStore((s) => s.addItem);

  const [search, setSearch] = useState("");
  const [genre, setGenre] = useState("");
  const [sort, setSort] = useState("new");

  const [page, setPage] = useState(1);
  const limit = 12;

  const [data, setData] = useState({ items: [], totalPages: 1 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchBooks = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await api.get("/reader/books", {
        params: { page, limit, search, genre, sort },
      });
      setData(res.data);
    } catch (e) {
      console.error(e);
      setError("Không tải được danh sách sách.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, genre, sort]);

  useEffect(() => {
    const t = setTimeout(() => {
      setPage(1);
      fetchBooks();
    }, 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  return (
    <div className="appMain">
      <Header />
      <div className="mainContentWrapper">
        <SideBar />
        <div className="mainContent">
          <div className="reader-shop">
            <div className="shop-topbar">
              <input
                className="shop-search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm theo tên sách hoặc tác giả..."
              />

              <div className="shop-filters">
                <select className="shop-select" value={sort} onChange={(e) => setSort(e.target.value)}>
                  <option value="new">Mới nhất</option>
                  <option value="title">Theo tên</option>
                </select>

                <select
                  className="shop-select"
                  value={genre}
                  onChange={(e) => { setGenre(e.target.value); setPage(1); }}
                >
                  <option value="">Tất cả thể loại</option>
                  <option value="Classic">Classic</option>
                  <option value="Dystopian">Dystopian</option>
                  <option value="Fantasy">Fantasy</option>
                  <option value="Fiction">Fiction</option>
                  <option value="History">History</option>
                  <option value="Tech">Tech</option>
                  <option value="Self-help">Self-help</option>
                  <option value="Psychology">Psychology</option>
                  <option value="SciFi">SciFi</option>
                  <option value="Thriller">Thriller</option>
                </select>

                <Link to="/reader/cart" className="page-btn" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center" }}>
                  Giỏ mượn
                </Link>
              </div>
            </div>

            {loading ? (
              <p>Đang tải...</p>
            ) : error ? (
              <p style={{ color: "red" }}>{error}</p>
            ) : data.items.length === 0 ? (
              <p>Không có sách.</p>
            ) : (
              <>
                <div className="book-grid">
                  {data.items.map((b) => (
                    <div className="book-card" key={b.id}>
                      <img
                        className="book-cover"
                        src={encodeURI(b.coverUrl || "/book-placeholder.png")}
                        alt={b.title}
                        onError={(e) => {
                          e.currentTarget.src = "/book-placeholder.png";
                        }}
                      />


                      <div className="book-body">
                        <p className="book-title">{b.title}</p>
                        <p className="book-meta">
                          {b.author} • {b.genre} • {b.publishedYear}
                        </p>
                        <p className="book-meta">
                          ⭐ {b.avgRating.toFixed(1)} ({b.reviewCount}) • Còn {b.availableCopies}/{b.totalCopies}
                        </p>
                        <p className="book-desc">{shortText(b.description, 160) || "Chưa có mô tả."}</p>

                        <div className="book-actions">
                          <Link className="btn btn-detail" to={`/reader/books/${b.id}`}>
                            Chi tiết
                          </Link>
                          <button
                            className="btn btn-cart"
                            onClick={() => addItem(b, 1)}
                            disabled={b.availableCopies <= 0}
                            title={b.availableCopies <= 0 ? "Hết sách" : "Thêm vào giỏ"}
                            style={{ opacity: b.availableCopies <= 0 ? 0.6 : 1 }}
                          >
                            + Giỏ
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pagination">
                  {Array.from({ length: data.totalPages }).slice(0, 8).map((_, i) => {
                    const p = i + 1;
                    return (
                      <button
                        key={p}
                        className={`page-btn ${p === page ? "active" : ""}`}
                        onClick={() => setPage(p)}
                      >
                        {p}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
