import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Header from "../../components/Header";
import SideBar from "../../components/SideBar";
import api from "../../lib/axios";
import useCartStore from "../../store/useCartStore";

export default function ReaderBookDetail() {
  const { id } = useParams();
  const addItem = useCartStore((s) => s.addItem);

  const [data, setData] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  const fetchDetail = async () => {
    try {
      setError("");
      const res = await api.get(`/reader/books/${id}`);
      setData(res.data);
    } catch (e) {
      console.error(e);
      setError("Không tải được chi tiết sách.");
    }
  };

  useEffect(() => {
    fetchDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const submitReview = async (e) => {
    e.preventDefault();
    setMsg("");
    setError("");
    try {
      await api.post(`/reader/books/${id}/reviews`, { rating, comment });
      setMsg("Đã gửi đánh giá!");
      setComment("");
      fetchDetail();
    } catch (e) {
      console.error(e);
      setError(e.response?.data?.message || "Gửi đánh giá thất bại.");
    }
  };

  return (
    <div className="appMain">
      <Header />
      <div className="mainContentWrapper">
        <SideBar />
        <div className="mainContent">
          <div className="reader-shop">
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
              <Link to="/reader/books" className="page-btn" style={{ textDecoration: "none" }}>
                ← Quay lại
              </Link>
              <Link to="/reader/cart" className="page-btn" style={{ textDecoration: "none" }}>
                Giỏ mượn
              </Link>
            </div>

            {!data ? (
              <p>{error || "Đang tải..."}</p>
            ) : (
              <>
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "320px 1fr",
                  gap: 16,
                  background: "white",
                  borderRadius: 18,
                  padding: 14,
                  border: "1px solid rgba(229,231,235,1)",
                  boxShadow: "0 10px 24px rgba(15,23,42,0.08)"
                }}>
                  <img
                    src={data.book.coverUrl || "/book-placeholder.png"}
                    alt={data.book.title}
                    style={{ width: "100%", height: 420, objectFit: "cover", borderRadius: 14 }}
                    onError={(e) => { e.currentTarget.src = "/book-placeholder.png"; }}
                  />

                  <div>
                    <h2 style={{ margin: "0 0 6px" }}>{data.book.title}</h2>
                    <p style={{ margin: 0, color: "rgb(100,116,139)", fontWeight: 700 }}>
                      {data.book.author} • {data.book.genre} • {data.book.publishedYear}
                    </p>

                    <p style={{ marginTop: 10 }}>
                      ⭐ {Number(data.avgRating).toFixed(1)} ({data.reviewCount}) • Còn {data.availableCopies}/{data.totalCopies}
                    </p>

                    <p style={{ marginTop: 10, color: "rgb(51,65,85)", lineHeight: "1.6" }}>
                      {data.book.description || "Chưa có mô tả."}
                    </p>

                    <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
                      <button
                        className="btn btn-cart"
                        onClick={() => addItem({ id: data.book.id, title: data.book.title, author: data.book.author, coverUrl: data.book.coverUrl }, 1)}
                        disabled={data.availableCopies <= 0}
                        style={{ maxWidth: 220 }}
                      >
                        + Thêm vào giỏ
                      </button>
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div style={{ background: "white", borderRadius: 18, padding: 14, border: "1px solid rgba(229,231,235,1)" }}>
                    <h3 style={{ marginTop: 0 }}>Đánh giá</h3>
                    {msg && <p style={{ color: "green", fontWeight: 700 }}>{msg}</p>}
                    {error && <p style={{ color: "red", fontWeight: 700 }}>{error}</p>}

                    <form onSubmit={submitReview}>
                      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                        <label style={{ fontWeight: 700 }}>Số sao</label>
                        <select value={rating} onChange={(e) => setRating(Number(e.target.value))} className="shop-select">
                          {[5,4,3,2,1].map((x) => <option key={x} value={x}>{x}</option>)}
                        </select>
                      </div>

                      <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Viết cảm nhận của bạn..."
                        style={{
                          width: "100%",
                          minHeight: 110,
                          marginTop: 10,
                          borderRadius: 14,
                          padding: 10,
                          border: "1px solid rgba(148,163,184,0.85)"
                        }}
                      />

                      <button className="btn btn-detail" style={{ marginTop: 10 }}>
                        Gửi đánh giá
                      </button>
                    </form>
                  </div>

                  <div style={{ background: "white", borderRadius: 18, padding: 14, border: "1px solid rgba(229,231,235,1)" }}>
                    <h3 style={{ marginTop: 0 }}>Review gần đây</h3>
                    {data.reviews.length === 0 ? (
                      <p>Chưa có review.</p>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: 10, maxHeight: 360, overflow: "auto" }}>
                        {data.reviews.map((r) => (
                          <div key={r.id} style={{ border: "1px solid rgba(229,231,235,1)", borderRadius: 14, padding: 10 }}>
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                              <b>{r.readerName}</b>
                              <b>⭐ {r.rating}</b>
                            </div>
                            <p style={{ margin: "6px 0 0", color: "rgb(51,65,85)" }}>{r.comment || "(Không có nội dung)"}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
