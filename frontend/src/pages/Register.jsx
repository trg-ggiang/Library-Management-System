import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import api from "../lib/axios";
import {
  FaEnvelope,
  FaLock,
  FaUser,
  FaPhone,
  FaMapMarkerAlt,
  FaSpinner,
} from "react-icons/fa";
import "./Login_Register.css";

export default function Register() {
  const { register, handleSubmit, reset } = useForm();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data) => {
    setError("");
    setLoading(true);
    try {
      const submitData = {
        ...data,
        email: data.email.trim().toLowerCase(),
      };
      await api.post("/auth/register", submitData);
      alert("Dang ky thanh cong! Hay dang nhap.");
      reset();
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Dang ky that bai");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h2>Tao tai khoan doc gia</h2>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="input-group">
            <FaUser />
            <input placeholder="Ho ten" {...register("name", { required: true })} />
          </div>

          <div className="input-group">
            <FaEnvelope />
            <input type="email" placeholder="Email" {...register("email", { required: true })} />
          </div>

          <div className="input-group">
            <FaLock />
            <input
              type="password"
              placeholder="Mat khau"
              {...register("password", { required: true, minLength: 6 })}
            />
          </div>

          <div className="input-group">
            <FaPhone />
            <input placeholder="So dien thoai" {...register("phone")} />
          </div>

          <div className="input-group">
            <FaMapMarkerAlt />
            <input placeholder="Dia chi" {...register("address")} />
          </div>

          <button type="submit" disabled={loading}>
            {loading ? (
              <>
                <FaSpinner className="spin" /> Dang dang ky...
              </>
            ) : (
              "Dang ky"
            )}
          </button>
        </form>

        {error && <p className="error">{error}</p>}

        <p>
          Da co tai khoan? <Link to="/login">Dang nhap</Link>
        </p>
      </div>
    </div>
  );
}
