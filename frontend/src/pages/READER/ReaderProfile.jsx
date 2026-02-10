import { useEffect, useMemo, useState } from "react";
import Header from "../../components/Header";
import SideBar from "../../components/SideBar";
import api from "../../lib/axios";

function initials(name) {
  const s = String(name || "").trim();
  if (!s) return "R";
  const parts = s.split(/\s+/).slice(0, 2);
  return parts.map((x) => x[0]?.toUpperCase()).join("") || "R";
}

export default function ReaderProfile() {
  const [data, setData] = useState(null);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    gender: "MALE",
    dob: "",
  });

  const avatarText = useMemo(() => initials(form.name), [form.name]);

  const load = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await api.get("/reader/me/profile");
      setData(res.data);

      setForm({
        name: res.data?.user?.name || "",
        phone: res.data?.user?.phone || "",
        address: res.data?.profile?.address || "",
        gender: res.data?.profile?.gender || "MALE",
        dob: res.data?.profile?.dob ? String(res.data.profile.dob).slice(0, 10) : "",
      });
    } catch (e) {
      console.error(e);
      setError("Không tải được profile.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    try {
      setMsg("");
      setError("");
      await api.patch("/reader/me/profile", form);
      setMsg("Đã cập nhật!");
      load();
    } catch (e) {
      console.error(e);
      setError(e.response?.data?.message || "Update failed");
    }
  };

  return (
    <div className="appMain">
      <Header />
      <div className="mainContentWrapper">
        <SideBar />

        {/* dùng mainContent cho đúng layout Reader */}
        <div className="mainContent">
          <div className="reader-shop" style={{ width: "100%" }}>
            <div className="profile-toolbar">
              <h2 style={{ margin: 0 }}>Profile</h2>
              
            </div>

            {!data ? (
              <p style={{ color: error ? "red" : "inherit", fontWeight: error ? 700 : 400 }}>
                {error || "Đang tải..."}
              </p>
            ) : (
              <>
                {msg && <p className="profile-msg ok">{msg}</p>}
                {error && <p className="profile-msg err">{error}</p>}

                <div className="profile-card">
                  <div className="profile-left">
                    <div className="profile-avatar">
                      <div className="profile-avatar-inner">{avatarText}</div>
                    </div>

                    <div className="profile-left-meta">
                      <div className="profile-name">{form.name || "Reader"}</div>
                      <div className="profile-sub">
                        {data.user?.email || "reader@email.com"}
                      </div>

                      <div className="profile-mini">
                        <div className="profile-mini-item">
                          <span className="k">Phone</span>
                          <span className="v">{form.phone || "-"}</span>
                        </div>
                        <div className="profile-mini-item">
                          <span className="k">Gender</span>
                          <span className="v">{form.gender}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="profile-right">
                    <form onSubmit={submit} className="profile-form">
                      <div className="profile-grid">
                        <div className="profile-field">
                          <label>Name</label>
                          <input
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            placeholder="Name"
                          />
                        </div>

                        <div className="profile-field">
                          <label>Phone</label>
                          <input
                            value={form.phone}
                            onChange={(e) => setForm({ ...form, phone: e.target.value })}
                            placeholder="Phone"
                          />
                        </div>

                        <div className="profile-field profile-field-wide">
                          <label>Address</label>
                          <input
                            value={form.address}
                            onChange={(e) => setForm({ ...form, address: e.target.value })}
                            placeholder="Address"
                          />
                        </div>

                        <div className="profile-field">
                          <label>Gender</label>
                          <select
                            value={form.gender}
                            onChange={(e) => setForm({ ...form, gender: e.target.value })}
                          >
                            <option value="MALE">MALE</option>
                            <option value="FEMALE">FEMALE</option>
                            <option value="OTHER">OTHER</option>
                          </select>
                        </div>

                        <div className="profile-field">
                          <label>Date of birth</label>
                          <input
                            type="date"
                            value={form.dob}
                            onChange={(e) => setForm({ ...form, dob: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="profile-actions">
                        <button className="page-btn" type="button" onClick={load} disabled={loading}>
                          Reset
                        </button>
                        <button className="page-btn active" type="submit" disabled={loading}>
                          Save
                        </button>
                      </div>
                    </form>
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
