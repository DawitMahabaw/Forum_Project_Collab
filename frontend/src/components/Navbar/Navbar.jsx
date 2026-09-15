import { LogOut, Search } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { useAuth } from "../../context/AuthContext.jsx";
import styles from "./Navbar.module.css";

const Navbar = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const { user, logout } = useAuth();

  const searchTerm = searchParams.get("search") || "";

  const handleLogout = () => {
    logout();
    navigate("/auth", { replace: true });
  };

  const handleSearch = (event) => {
    const value = event.target.value;

    if (value.trim()) {
      setSearchParams({ search: value });
    } else {
      setSearchParams({});
    }
  };

  const getInitials = () => {
    const first = user?.firstName?.[0] || "";
    const last = user?.lastName?.[0] || "";

    return `${first}${last}`.toUpperCase() || "U";
  };

  return (
    <header className={styles.navbar}>
      <div className={styles.titleBlock}>
        <h1>Home</h1>

        <p>Browse the feed, search by keyword, or run AI similarity search.</p>
      </div>

      <div className={styles.search}>
        <Search size={18} aria-hidden="true" />

        <input
          type="search"
          value={searchTerm}
          placeholder="Search questions by keyword..."
          aria-label="Search questions by keyword"
          onChange={handleSearch}
        />
      </div>

      <div className={styles.userSection}>
        <div className={styles.avatar}>{getInitials()}</div>

        <span className={styles.userName}>
          {user?.firstName} {user?.lastName}
        </span>

        <button
          type="button"
          className={styles.logoutButton}
          onClick={handleLogout}
          aria-label="Log out"
        >
          <LogOut size={19} />
        </button>
      </div>
    </header>
  );
};

export default Navbar;
