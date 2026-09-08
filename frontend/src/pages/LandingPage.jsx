import { Link } from "react-router-dom";
import styles from "./LandingPage.module.css";

function LandingPage() {
  return (
    <div className={styles.page}>
      <header className={styles.navbar}>
        <Link to="/" className={styles.logo}>
          <span>Evangadi</span>
          <span className={styles.logoForum}>Forum</span>
        </Link>
        <nav className={styles.navLinks} aria-label="Primary">
          <Link to="/auth" className={styles.navLink}>
            How it works
          </Link>
        </nav>
        <div className={styles.navActions}>
          <Link to="/auth" className={styles.signInLink}>
            Sign In
          </Link>
          <Link to="/auth" className={styles.getStartedButton}>
            GET STARTED
          </Link>
        </div>
      </header>

      <main>
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <h1 className={styles.headline}>
              Q&A Community Where Curious Minds Meet and Share Knowledge.
            </h1>
            <p className={styles.subtext}>
              Evangadi Forum is a place to ask questions, share what you know,
              and learn from a growing community of curious minds.
            </p>

            <ul className={styles.features}>
              <li>
                <span className={styles.featureIcon} aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path
                      d="M12 4v16m8-8H4"
                      stroke="currentColor"
                      strokeWidth="2.4"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
                <span>More Knowledge</span>
              </li>
              <li>
                <span className={styles.featureIcon} aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <circle cx="9" cy="8" r="3.2" stroke="currentColor" strokeWidth="2.2" />
                    <path
                      d="M3.5 19c.6-3.2 2.8-5 5.5-5s4.9 1.8 5.5 5"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                    />
                    <path
                      d="M16 6.5a3.2 3.2 0 1 1 0 6.4M17.5 14.6c2 .6 3.1 2.3 3.4 4.4"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
                <span>Community</span>
              </li>
              <li>
                <span className={styles.featureIcon} aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path
                      d="M4 6h16M4 12h10M4 18h7"
                      stroke="currentColor"
                      strokeWidth="2.4"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
                <span>Robust Q&A</span>
              </li>
            </ul>

            <div className={styles.heroActions}>
              <Link to="/auth" className={styles.primaryButton}>
                GET STARTED
              </Link>
              <Link to="/auth" className={styles.secondaryButton}>
                SIGN IN
              </Link>
            </div>
          </div>

          <div className={styles.heroVisual} aria-hidden="true">
            <div className={styles.questionCard}>
              <div className={styles.cardMeta}>
                <span className={styles.avatar} />
                <span className={styles.userLine} />
              </div>
              <div className={styles.cardTitle} />
              <div className={styles.cardBody} />
              <div className={styles.cardTags}>
                <span className={styles.tag} />
                <span className={styles.tag} />
                <span className={styles.tag} />
              </div>
              <div className={styles.cardFooter}>
                <span className={styles.statLine} />
                <span className={styles.statLine} />
              </div>
            </div>
            <div className={styles.resultCard}>
              <span className={styles.resultBar} />
              <span className={styles.resultText} />
              <span className={styles.ring} />
            </div>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <span className={styles.footerLogo}>
            <span>Evangadi</span> <span className={styles.logoForum}>Forum</span>
          </span>
          <p className={styles.footerText}>
            Ask, answer, and grow — together.
          </p>
          <Link to="/auth" className={styles.footerCta}>
            Join the community
          </Link>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;