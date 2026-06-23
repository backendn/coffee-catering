import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "./components/cart/CartProvider";
import { AuthProvider } from "./hooks/useAuth";
import PublicLayout from "./components/layout/PublicLayout";
import AdminLayout from "./components/layout/AdminLayout";
import RequireAuth from "./components/layout/RequireAuth";
import Home from "./pages/public/Home";
import Catalog from "./pages/public/Catalog";
import Checkout from "./pages/public/Checkout";
import OrderConfirmation from "./pages/public/OrderConfirmation";
import Catering from "./pages/public/Catering";
import Login from "./pages/admin/Login";
import Orders from "./pages/admin/Orders";
import Products from "./pages/admin/Products";
import CateringPackages from "./pages/admin/CateringPackages";
import Customers from "./pages/admin/Customers";
import ScrollToTop from "./components/Scrolltotop ";

function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <CartProvider>
          <ScrollToTop />
          <Routes>
            <Route element={<PublicLayout />}>
              <Route index element={<Home />} />
              <Route path="catalog" element={<Catalog />} />
              <Route path="catering" element={<Catering />} />
              <Route path="checkout" element={<Checkout />} />
              <Route path="order-confirmation/:orderNumber" element={<OrderConfirmation />} />
            </Route>

            <Route path="login" element={<Login />} />

            <Route path="admin" element={<RequireAuth />}>
              <Route element={<AdminLayout />}>
                <Route path="orders" element={<Orders />} />
                <Route path="products" element={<Products />} />
                <Route path="catering-packages" element={<CateringPackages />} />
                <Route path="customers" element={<Customers />} />
              </Route>
            </Route>
          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
