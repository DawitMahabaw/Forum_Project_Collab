import { Outlet } from "react-router-dom";

import Navbar from "../Navbar/Navbar.jsx";
import styles from "./Layout.module.css";

// Shared layout for authenticated application pages.
const Layout = () => {
  return (
    <div className={styles.shell}>
      <Navbar />

      <main className={styles.page}>
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
