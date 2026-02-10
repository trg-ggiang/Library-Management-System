import { useEffect, useMemo, useState } from "react";
import { FaSyncAlt, FaCheck, FaBookOpen, FaTimes } from "react-icons/fa";
import api from "../../lib/axios";
import Header from "../../components/Header";
import SideBar from "../../components/SideBar";

const ORDER_STATUS = {
  1: "PENDING",
  2: "APPROVED",
  3: "BORROWED",
  4: "CANCELLED",
  5: "COMPLETED",
};

function normalizeArray(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.orders)) return data.orders;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.rows)) return data.rows;
  return [];
}

function formatDate(d) {
  if (!d) return "-";
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return "-";
  return dt.toLocaleString("vi-VN");
}

function statusText(status) {
  return ORDER_STATUS[Number(status)] || "UNKNOWN";
}

export default function LibrarianOrders() {
  const [rows, setRows] = useState([]);
  const [status, setStatus] = useState("all");
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");

  async function loadOrders() {
    setLoading(true);
    setErr("");
    try {
      const params = {};
      if (status !== "all") params.status = Number(status);
      const res = await api.get("/librarian/orders", { params });
      setRows(normalizeArray(res.data));
    } catch (e) {
      setRows([]);
      setErr(e?.response?.data?.message || "Load orders failed");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const filtered = useMemo(() => {
    const keyword = (q || "").trim().toLowerCase();
    const arr = Array.isArray(rows) ? rows : [];
    if (!keyword) return arr;

    return arr.filter((o) => {
      const idStr = String(o?.id || "");
      const readerName = String(o?.reader?.user?.name || o?.readerName || "").toLowerCase();
      const readerEmail = String(o?.reader?.user?.email || "").toLowerCase();
      const readerId = String(o?.readerId || o?.reader?.id || "");
      return (
        idStr.includes(keyword) ||
        readerId.includes(keyword) ||
        readerName.includes(keyword) ||
        readerEmail.includes(keyword)
      );
    });
  }, [rows, q]);

  async function act(fn, okText) {
    try {
      setErr("");
      setMsg("");
      await fn();
      setMsg(okText);
      await loadOrders();
    } catch (e) {
      setMsg("");
      setErr(e?.response?.data?.message || "Action failed");
    }
  }

  function approveOrder(orderId) {
    return act(() => api.post(`/librarian/orders/${orderId}/approve`), `Approved order #${orderId}`);
  }

  function issueOrder(orderId) {
    return act(() => api.post(`/librarian/orders/${orderId}/issue`), `Issued order #${orderId}`);
  }

  function cancelOrder(orderId) {
    return act(() => api.post(`/librarian/orders/${orderId}/cancel`), `Cancelled order #${orderId}`);
  }

  return (
    <div className="appMain">
      <Header />
      <div className="mainContentWrapper">
        <SideBar />

        <div className="mainContainer">
          <div className="borrow-toolbar">
            <h2 className="admin-title" style={{ margin: 0 }}>Librarian Orders</h2>

            <div className="borrow-actions">
              <select className="shop-select" value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="all">All status</option>
                <option value="1">PENDING</option>
                <option value="2">APPROVED</option>
                <option value="3">BORROWED</option>
                <option value="4">CANCELLED</option>
                <option value="5">COMPLETED</option>
              </select>

              <button className="page-btn" onClick={loadOrders} disabled={loading} title="Refresh" aria-label="Refresh">
                <FaSyncAlt />
              </button>
            </div>
          </div>

          <div className="borrow-toolbar">
            <input
              className="admin-search"
              placeholder="Search by orderId / readerId / reader name / email..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>

          {msg ? <div className="admin-success">{msg}</div> : null}
          {err ? <div className="admin-error">{err}</div> : null}

          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Reader</th>
                  <th>Items</th>
                  <th>Loan days</th>
                  <th>Created</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((o) => {
                  const st = Number(o?.status || 0);

                  const canApprove = st === 1;
                  const canIssue = st === 2;
                  const canCancel = st === 1 || st === 2;

                  const readerName = o?.reader?.user?.name || o?.readerName || "-";
                  const readerEmail = o?.reader?.user?.email || "-";
                  const readerId = o?.readerId || o?.reader?.id || "-";

                  const items = Array.isArray(o?.items) ? o.items : [];

                  return (
                    <tr key={o.id}>
                      <td className="highlight-id">#{o.id}</td>

                      <td>
                        <div>
                          <div style={{ fontWeight: 900 }}>{readerName}</div>
                          <div style={{ color: "#64748b", fontWeight: 800, fontSize: 12 }}>readerId: {readerId}</div>
                          <div style={{ color: "#64748b", fontWeight: 700, fontSize: 12 }}>{readerEmail}</div>
                        </div>
                      </td>

                      <td>
                        {items.length ? (
                          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                            {items.slice(0, 3).map((it) => {
                              const title =
                                it?.book?.title ||
                                it?.bookTitle ||
                                it?.title ||
                                (it?.bookId ? `bookId=${it.bookId}` : "Unknown");
                              return (
                                <div key={it.id} style={{ display: "flex", gap: 10, alignItems: "center" }}>
                                  <span className="truncate-1" style={{ maxWidth: 520, fontWeight: 800 }}>
                                    {title}
                                  </span>
                                  <span className="borrow-badge done">x{it.quantity}</span>
                                </div>
                              );
                            })}
                            {items.length > 3 ? (
                              <span style={{ color: "#64748b", fontWeight: 800, fontSize: 12 }}>
                                +{items.length - 3} more
                              </span>
                            ) : null}
                          </div>
                        ) : (
                          <span style={{ color: "#64748b", fontWeight: 700 }}>No items</span>
                        )}
                      </td>

                      <td style={{ fontWeight: 900 }}>{o.loanDays || 14}</td>
                      <td>{formatDate(o.createdAt)}</td>
                      <td>{statusText(st)}</td>

                      <td>
                        <div className="admin-user-actions">
                          <button
                            className="admin-btn-small"
                            onClick={() => approveOrder(o.id)}
                            disabled={!canApprove || loading}
                            title="Approve"
                            aria-label="Approve"
                          >
                            <FaCheck />
                          </button>

                          <button
                            className="admin-btn-small"
                            onClick={() => issueOrder(o.id)}
                            disabled={!canIssue || loading}
                            title="Issue"
                            aria-label="Issue"
                          >
                            <FaBookOpen />
                          </button>

                          <button
                            className="admin-btn-small admin-btn-danger"
                            onClick={() => cancelOrder(o.id)}
                            disabled={!canCancel || loading}
                            title="Cancel"
                            aria-label="Cancel"
                          >
                            <FaTimes />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {!loading && filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ padding: 16, color: "#64748b", fontWeight: 800 }}>
                      Không có orders.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
