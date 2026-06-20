import { Outlet } from "react-router";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import "./MainLayout.css";

function MainLayout() {
  return (
    <>
      <Header />

      <main className="main-layout__content">
        <Outlet />
      </main>

      <Footer />
    </>
  );
}

export default MainLayout;
