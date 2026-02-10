import React, { useEffect, useMemo, useState } from "react";
import api from "../../lib/axios"; // <- đổi path nếu dự án m khác

// ====== mapping status (tuỳ hệ thống mày, tao đoán theo flow m đang dùng) ======
// 1 = PENDING, 2 = APPROVED, 3 = BORROWED/ISSUED, 4 = REJECTED/CANCELLED
const ORDER_STATUS = {
  1: "PENDING",
  2: "APPROVED",
  3: "ISSUED",
  4: "CANCELLED",
};

function normalizeArray(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.orders)) return data.orders;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

function formatDate(d) {
  try {
    if (!d) return "-";
    return new Date(d).toLocaleString();
  } catch {
    return "-";
  }
}

function statusBadge(status) {
  const s = ORDER_STATUS[status] || String(status);
  if (s === "APPROVED") return <span className="chip">APPROVED</span>;
  if (s === "PENDING") return <span className="chip" style={{ background: "rgba(245,158,11,0.12)", borderColor: "rgba(245,158,11,0.18)", color: "rgba(180,83,9,0.95)" }}>PENDING</span>;
  if (s === "ISSUED") return <span className="chip" style={{ background: "rgba(34,197,94,0.12)", borderColor: "rgba(34,197,94,0.18)", color: "rgba(22,163,74,0.95)" }}>ISSUED</span>;
  return <span className="chip" style={{ background: "rgba(148,163,184,0.18)", borderColor: "rgba(148,163,184,0.22)", color: "rgba(51,65,85,0.95)" }}>{s}</span>;
}

export default function LibrarianOrders() {
  const [orders, setOrders] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // Issue modal states
  const [issueOpen, setIssueOpen] = useState(false);
  const [issueOrder, setIssueOrder] = useState(null); // full order detail
  const [issueLoading, setIssueLoading] = useState(false);
  const [issueErr, setIssueErr] = useState("");
  const [issuing, setIssuing] = useState(false);
  const [issueOk, setIssueOk] = useState("");

  // allocations[itemId] = [copyId, copyId, ...] (length = quantity)
  const [allocationsByItem, setAllocationsByItem] = useState({});
  // optionsByItem[itemId] = [{id, status, ...}]
  const [optionsByItem, setOptionsByItem] = useState({});

  async function loadOrders() {
    setLoading(true);
    setErr("");
    try {
      // Nếu backend của m có query/filter thì thêm params tuỳ ý
      // Ví dụ: /librarian/orders?status=2
      const res = await api.get("/librarian/orders");
      setOrders(normalizeArray(res.data));
    } catch (e) {
      setErr(e?.response?.data?.message || "Load orders failed");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrders();
  }, []);

  const filtered = useMemo(() => {
    const keyword = (q || "").trim().toLowerCase();
    if (!keyword) return orders;

    return orders.filter((o) => {
      const idStr = String(o.id || "");
      const readerName = String(o?.reader?.name || o?.readerName || "").toLowerCase();
      const readerId = String(o?.readerId || "");
      return (
        idStr.includes(keyword) ||
        readerName.includes(keyword) ||
        readerId.includes(keyword)
      );
    });
  }, [orders, q]);

  async function openIssueModal(orderId) {
    setIssueOpen(true);
    setIssueLoading(true);
    setIssueErr("");
    setIssueOk("");
    setAllocationsByItem({});
    setOptionsByItem({});
    setIssueOrder(null);

    try {
      // detail endpoint: nếu m chưa có, có thể dùng data từ list (nhưng list thường thiếu items)
      const res = await api.get(`/librarian/orders/${orderId}`);
      const full = res.data?.order || res.data;

      if (!full?.id) throw new Error("Order detail not found");
      if (!Array.isArray(full.items)) full.items = [];

      setIssueOrder(full);

      // init allocationsByItem = array length = quantity, value = ""
      const initAlloc = {};
      for (const it of full.items) {
        const qty = Number(it.quantity || 0);
        initAlloc[it.id] = Array.from({ length: qty }, () => "");
      }
      setAllocationsByItem(initAlloc);

      // load copy options for each item
      const optMap = {};
      await Promise.all(
        full.items.map(async (it) => {
          const bookId = it.bookId || it?.book?.id;
          const readerId = full.readerId || full?.reader?.id;

          if (!bookId) {
            optMap[it.id] = [];
            return;
          }

          const r = await api.get(`/librarian/books/${bookId}/issue-copies`, {
            params: { readerId },
          });
          optMap[it.id] = normalizeArray(r.data);
        })
      );
      setOptionsByItem(optMap);
    } catch (e) {
      setIssueErr(e?.response?.data?.message || e?.message || "Load issue modal failed");
    } finally {
      setIssueLoading(false);
    }
  }

  function closeIssueModal() {
    if (issuing) return;
    setIssueOpen(false);
    setIssueOrder(null);
    setIssueErr("");
    setIssueOk("");
    setAllocationsByItem({});
    setOptionsByItem({});
  }

  const usedCopyIds = useMemo(() => {
    const set = new Set();
    for (const itemId of Object.keys(allocationsByItem)) {
      for (const v of allocationsByItem[itemId] || []) {
        if (v) set.add(String(v));
      }
    }
    return set;
  }, [allocationsByItem]);

  function updateAllocation(itemId, idx, copyId) {
    setAllocationsByItem((prev) => {
      const next = { ...prev };
      const arr = [...(next[itemId] || [])];
      arr[idx] = copyId;
      next[itemId] = arr;
      return next;
    });
  }

  function validateAllocations(full) {
    if (!full?.items?.length) return "Order không có items";
    for (const it of full.items) {
      const arr = allocationsByItem[it.id] || [];
      if (arr.length !== Number(it.quantity || 0)) return "Thiếu allocations (quantity mismatch)";
      for (const v of arr) {
        if (!v) return "Chưa chọn đủ copy cho tất cả items";
      }
    }

    // check duplicate copyId
    const all = [];
    for (const it of full.items) {
      for (const v of allocationsByItem[it.id] || []) all.push(String(v));
    }
    const set = new Set(all);
    if (set.size !== all.length) return "Không được chọn trùng copyId";
    return "";
  }

  async function submitIssue() {
    if (!issueOrder?.id) return;

    setIssueErr("");
    setIssueOk("");

    const v = validateAllocations(issueOrder);
    if (v) {
      setIssueErr(v);
      return;
    }

    // build payload allocations
    const payload = [];
    for (const it of issueOrder.items) {
      const arr = allocationsByItem[it.id] || [];
      for (const copyId of arr) {
        payload.push({ orderItemId: it.id, copyId: Number(copyId) });
      }
    }

    setIssuing(true);
    try {
      await api.post(`/librarian/orders/${issueOrder.id}/issue-by-copies`, {
        allocations: payload,
      });
      setIssueOk("Issue thành công ✅");
      await loadOrders();
      // auto close after success (nhưng vẫn cho mày thấy message)
      setTimeout(() => {
        closeIssueModal();
      }, 700);
    } catch (e) {
      setIssueErr(e?.response?.data?.message || "Issue failed");
    } finally {
      setIssuing(false);
    }
  }

  return (
    <div className="admin-container librarian-main">
      <h2 className="admin-title">Librarian Orders</h2>
      <p className="librarian-subtitle">
        Chọn order APPROVED → Issue theo từng item và chọn copy cụ thể.
      </p>

      <div className="admin-topbar librarian-borrow-topbar">
        <input
          className="admin-search"
          placeholder="Search by orderId / readerId / reader name..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button className="btn btn-primary" onClick={loadOrders} disabled={loading}>
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>
      </div>

      {err ? <div className="admin-error">{err}</div> : null}

      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th style={{ width: 90 }}>Order</th>
              <th style={{ width: 160 }}>Reader</th>
              <th>Items</th>
              <th style={{ width: 140 }}>Created</th>
              <th style={{ width: 140 }}>Status</th>
              <th style={{ width: 160 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((o) => {
              const status = Number(o.status || 0);
              const canIssue = status === 2; // APPROVED
              const readerName = o?.reader?.name || o?.readerName || "-";
              const items = Array.isArray(o.items) ? o.items : [];

              return (
                <tr key={o.id}>
                  <td className="highlight-id">#{o.id}</td>
                  <td>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <span style={{ fontWeight: 900 }}>{readerName}</span>
                      <span style={{ color: "#64748b", fontWeight: 700, fontSize: 12 }}>
                        readerId: {o.readerId || o?.reader?.id || "-"}
                      </span>
                    </div>
                  </td>
                  <td>
                    {items.length ? (
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        {items.slice(0, 3).map((it) => {
                          const title = it?.book?.title || it.bookTitle || it.title || `bookId=${it.bookId}`;
                          return (
                            <div key={it.id} style={{ display: "flex", gap: 10, alignItems: "center" }}>
                              <span className="ellipsis-1" style={{ maxWidth: 520, fontWeight: 800 }}>
                                {title}
                              </span>
                              <span className="chip" style={{ background: "rgba(148,163,184,0.14)", borderColor: "rgba(148,163,184,0.18)", color: "rgba(51,65,85,0.95)" }}>
                                x{it.quantity}
                              </span>
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
                  <td>{formatDate(o.createdAt)}</td>
                  <td>{statusBadge(status)}</td>
                  <td>
                    <div className="admin-user-actions">
                      <button
                        className="admin-btn-small"
                        onClick={() => openIssueModal(o.id)}
                        disabled={!canIssue}
                        title={!canIssue ? "Chỉ issue được khi status=APPROVED" : "Issue theo copy"}
                      >
                        Issue by copies
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}

            {!loading && filtered.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: 16, color: "#64748b", fontWeight: 800 }}>
                  Không có orders.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      {/* ========================= ISSUE MODAL ========================= */}
      {issueOpen ? (
        <div className="modal-backdrop" onMouseDown={closeIssueModal}>
          <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
              <h3 style={{ margin: 0 }}>
                Issue by copies{" "}
                {issueOrder?.id ? <span style={{ color: "#64748b" }}># {issueOrder.id}</span> : null}
              </h3>

              <button className="btn btn-danger" onClick={closeIssueModal} disabled={issuing}>
                Close
              </button>
            </div>

            {issueLoading ? (
              <p style={{ marginTop: 12, fontWeight: 800, color: "#64748b" }}>Loading...</p>
            ) : null}

            {issueErr ? (
              <p className="admin-error" style={{ marginTop: 10 }}>
                {issueErr}
              </p>
            ) : null}

            {issueOk ? (
              <p className="admin-success" style={{ marginTop: 10 }}>
                {issueOk}
              </p>
            ) : null}

            {!issueLoading && issueOrder ? (
              <div style={{ marginTop: 12 }}>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                  <span className="chip">
                    Reader: {issueOrder?.reader?.name || issueOrder.readerName || issueOrder.readerId}
                  </span>
                  <span className="chip" style={{ background: "rgba(148,163,184,0.14)", borderColor: "rgba(148,163,184,0.18)", color: "rgba(51,65,85,0.95)" }}>
                    Created: {formatDate(issueOrder.createdAt)}
                  </span>
                </div>

                <div className="admin-table-wrapper" style={{ marginTop: 12, maxHeight: 360 }}>
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th style={{ width: 70 }}>Item</th>
                        <th>Book</th>
                        <th style={{ width: 90 }}>Qty</th>
                        <th>Pick copies</th>
                      </tr>
                    </thead>
                    <tbody>
                      {issueOrder.items.map((it) => {
                        const title = it?.book?.title || it.bookTitle || it.title || `bookId=${it.bookId}`;
                        const qty = Number(it.quantity || 0);
                        const opts = optionsByItem[it.id] || [];
                        const current = allocationsByItem[it.id] || Array.from({ length: qty }, () => "");

                        return (
                          <tr key={it.id}>
                            <td className="highlight-id">#{it.id}</td>
                            <td>
                              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                                <span className="ellipsis-2" style={{ fontWeight: 900, maxWidth: 420 }}>
                                  {title}
                                </span>
                                <span style={{ color: "#64748b", fontWeight: 800, fontSize: 12 }}>
                                  bookId: {it.bookId || it?.book?.id || "-"}
                                </span>
                              </div>
                            </td>
                            <td>
                              <span className="chip" style={{ background: "rgba(148,163,184,0.14)", borderColor: "rgba(148,163,184,0.18)", color: "rgba(51,65,85,0.95)" }}>
                                x{qty}
                              </span>
                            </td>
                            <td>
                              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                                {current.map((v, idx) => (
                                  <div key={idx} style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                                    <span style={{ fontWeight: 900, color: "#334155" }}>
                                      Copy {idx + 1}
                                    </span>

                                    <select
                                      value={v}
                                      onChange={(e) => updateAllocation(it.id, idx, e.target.value)}
                                      style={{ minWidth: 220 }}
                                    >
                                      <option value="">-- chọn copy --</option>
                                      {opts.map((c) => {
                                        const idStr = String(c.id);
                                        const isPicked = usedCopyIds.has(idStr) && idStr !== String(v);
                                        return (
                                          <option key={c.id} value={c.id} disabled={isPicked}>
                                            #{c.id} {c.status === 3 ? "(RESERVED)" : "(AVAILABLE)"}
                                          </option>
                                        );
                                      })}
                                    </select>

                                    <span style={{ color: "#64748b", fontWeight: 800, fontSize: 12 }}>
                                      {v ? `Selected: #${v}` : "Not selected"}
                                    </span>
                                  </div>
                                ))}

                                {opts.length === 0 ? (
                                  <span style={{ color: "#b91c1c", fontWeight: 900 }}>
                                    Không có copy hợp lệ để issue cho item này.
                                  </span>
                                ) : null}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="form-actions" style={{ marginTop: 12 }}>
                  <button className="btn btn-secondary" onClick={submitIssue} disabled={issuing}>
                    {issuing ? "Issuing..." : "Confirm issue"}
                  </button>
                </div>

                <p style={{ marginTop: 10, color: "#64748b", fontWeight: 800, fontSize: 12 }}>
                  Lưu ý: Không được chọn trùng copyId giữa các items. Copy RESERVED chỉ issue được nếu đúng reservation của reader.
                </p>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
