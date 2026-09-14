import { LogOut, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext.jsx";
import styles from "./Navbar.module.css";

// Navigation bar for authenticated application pages.
const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Handles logout and redirects the user to authentication.
  const handleLogout = () => {
    logout();
    navigate("/auth", { replace: true });
  };

  return (
    <header className={styles.navbar}>
      <div className={styles.titleBlock}>
        <h1>Home</h1>
        <p>Browse and search community questions.</p>
      </div>

      <div className={styles.search}>
        <Search size={18} aria-hidden="true" />
        <input
          type="search"
          placeholder="Search questions..."
          aria-label="Search questions"
        />
      </div>

      <div className={styles.userSection}>
        <span className={styles.userName}>
          {user?.firstName} {user?.lastName}
        </span>

        <button
          type="button"
          className={styles.logoutButton}
          onClick={handleLogout}
          aria-label="Log out"
        >
          <LogOut size={20} />
        </button>
      </div>
    </header>
  );
};

export default Navbar;
