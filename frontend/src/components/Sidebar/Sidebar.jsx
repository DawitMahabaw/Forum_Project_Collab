import {
  FileText,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  PanelLeftClose,
  SquarePen,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext.jsx";
import { useSidebar } from "../../context/SidebarContext.jsx";
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
  const { isSidebarOpen, closeSidebar, openSidebar } = useSidebar();

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
    <aside
      className={`${styles.sidebar} ${
        !isSidebarOpen ? styles.sidebarCollapsed : ""
      }`}
      aria-label="Application sidebar"
    >
      <div className={styles.header}>
        {isSidebarOpen ? (
          <>
            <button
              type="button"
              className={styles.brand}
              onClick={() => navigate("/dashboard")}
              title="Evangadi Forum Dashboard"
            >
              <span className={styles.brandMark} aria-hidden="true">
                <MessageSquare size={17} strokeWidth={2.5} />
              </span>

              <span className={styles.brandCopy}>
                <strong>Evangadi Forum</strong>
                <small>Learn together. Ask with context.</small>
              </span>
            </button>

            <button
              type="button"
              className={styles.collapseButton}
              onClick={closeSidebar}
              title="Collapse sidebar (Ctrl+B)"
              aria-label="Collapse sidebar"
            >
              <PanelLeftClose size={18} />
            </button>
          </>
        ) : (
          <button
            type="button"
            className={styles.compactBrand}
            onClick={openSidebar}
            title="Expand sidebar (Ctrl+B)"
            aria-label="Expand sidebar"
          >
            <span className={styles.brandMarkCompact} aria-hidden="true">
              <MessageSquare size={16} strokeWidth={2.5} />
            </span>
          </button>
        )}
      </div>

      <nav className={styles.navigation} aria-label="Main navigation">
        {isSidebarOpen && <p className={styles.label}>Navigate</p>}

        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `${styles.link} ${isActive ? styles.active : ""}`
              }
              title={!isSidebarOpen ? item.label : undefined}
            >
              <Icon size={18} />
              {isSidebarOpen && <span>{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      <div className={styles.footer}>
        {isSidebarOpen ? (
          <button
            type="button"
            className={styles.newQuestion}
            onClick={() => navigate("/questions/ask")}
          >
            New Question
          </button>
        ) : (
          <button
            type="button"
            className={styles.compactNewQuestion}
            onClick={() => navigate("/questions/ask")}
            title="New Question"
            aria-label="New Question"
          >
            <SquarePen size={17} />
          </button>
        )}

        {isSidebarOpen ? (
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
              title="Logout"
            >
              <LogOut size={14} />
              Logout
            </button>
          </div>
        ) : (
          <div className={styles.compactUser}>
            <div
              className={styles.avatar}
              title={`${user?.firstName || "User"} ${user?.lastName || ""}`}
            >
              {getInitials()}
            </div>
            <button
              type="button"
              className={styles.compactLogout}
              onClick={handleLogout}
              title="Logout"
              aria-label="Logout"
            >
              <LogOut size={14} />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
