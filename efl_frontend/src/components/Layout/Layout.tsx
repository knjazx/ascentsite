import React from "react";
import { Outlet } from "react-router-dom";

import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import WalletModal from "../WalletModal/WalletModal";

import "./Layout.css";

const Layout: React.FC = () => {
  return (
    <>
      <Header />

      <main role="main">
        <Outlet />
      </main>

      <Footer />

      <WalletModal />
    </>
  );
};

export default Layout;