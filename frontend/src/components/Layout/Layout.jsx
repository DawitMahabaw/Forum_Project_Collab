import { Outlet } from "react-router-dom";

import styles from "./Layout.module.css";

const Layout = () => {
  return (
    <div className={styles.shell}>
      <main className={styles.page}>
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
