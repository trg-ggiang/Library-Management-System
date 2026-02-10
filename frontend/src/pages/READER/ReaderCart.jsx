import Header from "../../components/Header";
import SideBar from "../../components/SideBar";
import { Link, useNavigate } from "react-router-dom";
import useCartStore from "../../store/useCartStore";

function safePublicUrl(p) {
  if (!p) return "/book-placeholder.png";
  if (/^https?:\/\//i.test(p)) return p;
  const path = p.startsWith("/") ? p : `/${p}`;
  return path
    .split("/")
    .map((seg, idx) => (idx === 0 ? "" : encodeURIComponent(seg)))
    .join("/");
}

export default function ReaderCart() {
  const nav = useNavigate();
  const items = useCartStore((s) => s.items);
  const removeItem = useCartStore((s) => s.removeItem);
  const setQty = useCartStore((s) => s.setQty);
  const clear = useCartStore((s) => s.clear);

  return (
    <div className="appMain">
      <Header />
      <div className="mainContentWrapper">
        <SideBar />
        <div className="mainContent">
          <div className="reader-shop" style={{ maxWidth: 1000, width: "100%" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
              <Link to="/reader/books" className="page-btn" style={{ textDecoration: "none" }}>
                ← Tiếp tục chọn sách
              </Link>
              <button className="page-btn" onClick={clear}>Xoá giỏ</button>
            </div>

            <h2 style={{ marginTop: 0 }}>Giỏ mượn</h2>

            {items.length === 0 ? (
              <p>Giỏ đang trống.</p>
            ) : (
              <>
                <div style={{
                  background: "white",
                  borderRadius: 18,
                  border: "1px solid rgba(229,231,235,1)",
                  overflow: "hidden"
                }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ background: "rgba(248,250,252,1)" }}>
                        <th style={{ textAlign: "left", padding: 12 }}>Sách</th>
                        <th style={{ textAlign: "left", padding: 12 }}>Tác giả</th>
                        <th style={{ textAlign: "left", padding: 12 }}>Số lượng</th>
                        <th style={{ textAlign: "left", padding: 12 }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((it) => (
                        <tr key={it.bookId} style={{ borderTop: "1px solid rgba(229,231,235,1)" }}>
                          <td style={{ padding: 12, display: "flex", gap: 10, alignItems: "center" }}>
                            <img
                              src={safePublicUrl(it.coverUrl)}
                              alt={it.title}
                              style={{ width: 46, height: 62, objectFit: "cover", borderRadius: 8 }}
                              onError={(e) => { e.currentTarget.src = "/book-placeholder.png"; }}
                            />
                            <b>{it.title}</b>
                          </td>

                          <td style={{ padding: 12 }}>{it.author}</td>

                          <td style={{ padding: 12 }}>
                            <input
                              type="number"
                              min="1"
                              max="5"
                              value={it.quantity}
                              onChange={(e) => setQty(it.bookId, Number(e.target.value))}
                              style={{ width: 72, padding: 6, borderRadius: 10, border: "1px solid rgba(148,163,184,0.85)" }}
                            />
                          </td>

                          <td style={{ padding: 12 }}>
                            <button className="page-btn" onClick={() => removeItem(it.bookId)}>
                              Xoá
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12 }}>
                  <button className="page-btn active" onClick={() => nav("/reader/checkout")}>
                    Tiến hành mượn
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
