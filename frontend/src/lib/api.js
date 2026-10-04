import axios from "axios";

const BASE = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const api = axios.create({ baseURL: BASE, withCredentials: true });

export function formatApiErrorDetail(detail) {
  if (detail == null) return "Ocorreu um erro. Tente novamente.";
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail))
    return detail
      .map((e) => (e && typeof e.msg === "string" ? e.msg : JSON.stringify(e)))
      .filter(Boolean)
      .join(" ");
  if (detail && typeof detail.msg === "string") return detail.msg;
  return String(detail);
}

export function errMsg(e) {
  return formatApiErrorDetail(e?.response?.data?.detail) || e?.message || "Erro de ligação.";
}
