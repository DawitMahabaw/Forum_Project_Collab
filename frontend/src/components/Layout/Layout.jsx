import { Outlet } from "react-router-dom";

import AppFooter from "../AppFooter/AppFooter.jsx";
import Navbar from "../Navbar/Navbar.jsx";
import Sidebar from "../Sidebar/Sidebar.jsx";
import styles from "./Layout.module.css";

// Shared layout for authenticated application pages.
const Layout = () => {
  return (
    <div className={styles.shell}>
      <Sidebar />

      <div className={styles.content}>
        <Navbar />

        <main className={styles.page}>
          <Outlet />

          {/* Shared footer appears below every authenticated page */}
          <AppFooter />
        </main>
      </div>
    </div>
  );
};

export default Layout;
