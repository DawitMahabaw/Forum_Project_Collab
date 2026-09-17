import {
  FileText,
  LayoutDashboard,
  LogOut,
  MessageSquare,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext.jsx";
import styles from "./Sidebar.module.css";

const NAV_ITEMS = [
  {
    icon: LayoutDashboard,
    label: "Home",
    path: "/dashboard",
  },
  {
    icon: MessageSquare,
    label: "Your Topics",
    path: "/my-questions",
  },
  {
    icon: FileText,
    label: "Knowledge Base",
    path: "/rag-documents",
  },
];

// Sidebar navigation for authenticated application pages.
const Sidebar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Creates a simple avatar from the user's initials.
  const getInitials = () => {
    const first = user?.firstName?.[0] || "";
    const last = user?.lastName?.[0] || "";

    return `${first}${last}`.toUpperCase() || "U";
  };

  const handleLogout = () => {
    logout();
    navigate("/auth", { replace: true });
  };

  return (
    <aside className={styles.sidebar}>
      <div className={styles.header}>
        <button
          type="button"
          className={styles.brand}
          onClick={() => navigate("/dashboard")}
        >
          <span className={styles.brandMark} aria-hidden="true">
            <MessageSquare size={17} strokeWidth={2.5} />
          </span>

          <span className={styles.brandCopy}>
            <strong>Evangadi Forum</strong>
            <small>Learn together. Ask with context.</small>
          </span>
        </button>
      </div>

      <nav className={styles.navigation} aria-label="Main navigation">
        <p className={styles.label}>Navigate</p>

        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `${styles.link} ${isActive ? styles.active : ""}`
              }
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className={styles.footer}>
        <button
          type="button"
          className={styles.newQuestion}
          onClick={() => navigate("/questions/ask")}
        >
          New Question
        </button>

        <div className={styles.user}>
          <div className={styles.avatar}>{getInitials()}</div>

          <div className={styles.userInfo}>
            <span>
              {user?.firstName} {user?.lastName}
            </span>
            <small>Learner</small>
          </div>

          <button
            type="button"
            className={styles.logout}
            onClick={handleLogout}
          >
            <LogOut size={14} />
            Logout
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
