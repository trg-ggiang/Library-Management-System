import { useEffect, useState } from "react";
import Header from "../../components/Header";
import SideBar from "../../components/SideBar";
import api from "../../lib/axios";

export default function ReaderProfile() {
  const [data, setData] = useState(null);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    gender: "MALE",
    dob: "",
  });

  const load = async () => {
    try {
      setError("");
      const res = await api.get("/reader/me/profile");
      setData(res.data);

      setForm({
        name: res.data.user.name || "",
        phone: res.data.user.phone || "",
        address: res.data.profile.address || "",
        gender: res.data.profile.gender || "MALE",
        dob: res.data.profile.dob ? String(res.data.profile.dob).slice(0, 10) : "",
      });
    } catch (e) {
      console.error(e);
      setError("Không tải được profile.");
    }
  };

  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    try {
      setMsg(""); setError("");
      await api.patch("/reader/me/profile", form);
      setMsg("Đã cập nhật!");
      load();
    } catch (e) {
      console.error(e);
      setError(e.response?.data?.message || "Update failed");
    }
  };

  if (!data) return <div className="mainContent"><p>{error || "Đang tải..."}</p></div>;

  return (
    <div className="appMain">
      <Header />
      <div className="mainContentWrapper">
        <SideBar />

        <div className="mainContainer">
          <h2 className="admin-title">Profile</h2>
          {msg && <p className="admin-success">{msg}</p>}
          {error && <p className="admin-error">{error}</p>}

          <form className="admin-add-form" onSubmit={submit} style={{ gap: 10 }}>
            <input value={form.name} onChange={(e)=>setForm({...form, name:e.target.value})} placeholder="Name" />
            <input value={form.phone} onChange={(e)=>setForm({...form, phone:e.target.value})} placeholder="Phone" />
            <input value={form.address} onChange={(e)=>setForm({...form, address:e.target.value})} placeholder="Address" />

            <select value={form.gender} onChange={(e)=>setForm({...form, gender:e.target.value})}>
              <option value="MALE">MALE</option>
              <option value="FEMALE">FEMALE</option>
              <option value="OTHER">OTHER</option>
            </select>

            <input type="date" value={form.dob} onChange={(e)=>setForm({...form, dob:e.target.value})} />

            <button className="admin-btn-add" type="submit">Save</button>
          </form>
        </div>

      </div>
    </div>
  );
}
