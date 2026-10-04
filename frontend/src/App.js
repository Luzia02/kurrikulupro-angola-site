import "@/index.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";

import Home from "@/pages/Home";
import Choose from "@/pages/Choose";
import Guided from "@/pages/Guided";
import Editor from "@/pages/Editor";
import Review from "@/pages/Review";
import Payment from "@/pages/Payment";
import OrderStatus from "@/pages/OrderStatus";
import Resume from "@/pages/Resume";
import Privacy from "@/pages/Privacy";
import Terms from "@/pages/Terms";
import NotFound from "@/pages/NotFound";
import AdminLogin from "@/pages/admin/AdminLogin";
import AdminDashboard from "@/pages/admin/AdminDashboard";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/criar" element={<Choose />} />
          <Route path="/orientar" element={<Guided />} />
          <Route path="/criar/:token" element={<Editor />} />
          <Route path="/rever/:token" element={<Review />} />
          <Route path="/pagamento/:code" element={<Payment />} />
          <Route path="/pedido" element={<OrderStatus />} />
          <Route path="/pedido/:code" element={<OrderStatus />} />
          <Route path="/retomar" element={<Resume />} />
          <Route path="/privacidade" element={<Privacy />} />
          <Route path="/termos" element={<Terms />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-center" richColors />
    </div>
  );
}

export default App;
