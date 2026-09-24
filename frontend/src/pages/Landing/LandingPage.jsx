import { motion as Motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Sparkles,
  MessageSquare,
  Search,
  Layers,
  PenSquare,
  ArrowRight,
  CheckCircle2,
  FileText,
  Database,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext.jsx";

import styles from "./LandingPage.module.css";

const LandingPage = () => {
  const navigate = useNavigate();
  //navigation function create enadergalen yhem ke page wede page move enadiyaderg yredanal

  const { isAuthenticated } = useAuth();
//calls your authentication system Gets the value isAuthenticated.
//true or false yhonal   tru kehone  user login yadergak
//false kehone degmo user log in madreg aychlm
  const scrollToHowItWorks = () => {
    // wede how it work smoothly scroll down yadergal
    document // ychi document accesses yemtadergew webpage new
      .getElementById("how-it-works")
      //Finds an HTML element with
      ?.scrollIntoView({ behavior: "smooth" });// ezih ga ?. yhe element kale or exist kaderege bcha smoth endiyaderg yredanal
  };
{/* yhen section behula yteralnal <section
  className={styles.process}
  id="how-it-works"
></section> */}
  return (
    <div className={styles.page}>
      {/* ------------------------------------------------------
       * STICKY HEADER
       * ------------------------------------------------------ */}
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <button // the website logo is clickable.
            type="button"
            className={styles.brand}
            onClick={() => navigate("/")} // navigate("/") takes them to the home page.
            aria-label="Evangadi Forum home" //aria-label= yhe le screen readers buttonu mn endemisera yemigelts new yhem wede Evangadi Forum home ywesdenal.
          >
            <span className={styles.brandMark} aria-hidden>
              //Creates a small area for the logo icon & aria-hidden tells
              screen readers to ignore this decorative icon.
              <MessageSquare size={20} strokeWidth={2} />
            </span>
            <span className={styles.brandText}>
              <span className={styles.brandName}>Evangadi Forum</span>
              <span className={styles.brandLine}>
                Learn together. Ask with context.
              </span>
            </span>
          </button>

          <nav className={styles.nav} aria-label="Landing page sections">
            <button
              type="button"
              className={styles.navLink}
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              // yhe button click sidereg  window.scrollTo() moves the page  and top: 0 means go to the top.
            >
              Overview
            </button>
            <button
              type="button"
              className={styles.navLink}
              onClick={() =>
                document
                  .getElementById("course-rag")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
              Course RAG
            </button>
            <button
              type="button"
              className={styles.navLink}
              onClick={scrollToHowItWorks}
            >
              How it works
            </button>
          </nav>

          {/*
           * Buttons change depending on whether AuthContext
           * currently holds a logged-in user.
           */}
          <div className={styles.headerActions}>
            {isAuthenticated ? (
              //This is a ternary condition.
              //It means:
              // Is the user logged in?
              // If yes, show the first part.
              // If no, show the second part.
              <button
                type="button"
                className={styles.btnPrimary}
                onClick={() => navigate("/dashboard")}
              >
                //Creates a primary button. Open forum
                <ArrowRight size={16} aria-hidden />
              </button>
            ) : (
              <>
                //So if isAuthenticated is false, show this part
                <button
                  type="button"
                  className={styles.btnGhost}
                  onClick={() => navigate("/auth")}
                >
                  Sign in
                </button>
                <button
                  type="button"
                  className={styles.btnPrimary}
                  onClick={() => navigate("/auth")}
                >
                  Create account
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      <main>
        {/* ------------------------------------------------------
         * HERO SECTION
         * ------------------------------------------------------ */}
        <section className={styles.hero}>
          <div className={styles.heroInner}>
            <div>
              <Motion.p //Creates an animated paragraph using Framer Motion.
                className={styles.eyebrow}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                //nitial animation state:
                // opacity: 0 → invisible 1 sihon visible
                // y: 8 → slightly lower 0 sihon normal position
                //so fade in yadergna wede upward move yadergal
              >
                <Sparkles size={14} aria-hidden />
                Keyword search + embedding similarity
              </Motion.p>

              <Motion.h1
                className={styles.title}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }} //Waits 0.05 seconds before starting the animation.
              >
                A calm place for // adds a space.
                <span className={styles.titleAccent}>technical Q&A</span>
              </Motion.h1>

              <Motion.p
                className={styles.lead}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                Post with enough context for peers to help in one pass. Search
                the archive by phrase or by meaning, keep your threads in one
                place, and ground questions in{" "}
                <strong className={styles.leadStrong}>course documents</strong>{" "}
                with retrieval-augmented generation (RAG) so answers cite the
                right syllabus, readings, and handouts.
              </Motion.p>

              <Motion.div
                className={styles.heroCtas}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
              >
                <button
                  type="button"
                  className={styles.btnPrimary}
                  onClick={
                    () => navigate(isAuthenticated ? "/dashboard" : "/auth")
                    // This checks authentication.
                    // If logged in wede dashboard yhedna  goto home yemil text display yadergal
                    //if not logged in wede /auth ywesdna get started yemil display yaderglnal
                  }
                >
                  {isAuthenticated ? "Go to home" : "Get started"}
                  <ArrowRight size={16} aria-hidden />
                </button>
                {!isAuthenticated && (
                  // If the user is NOT authenticated, show the following button.
                  <button
                    type="button"
                    className={styles.btnOutline}
                    onClick={scrollToHowItWorks}
                  >
                    See how it works
                  </button>
                )}
              </Motion.div>
            </div>
            //Hero panel creates a side panel // aside means: ke main content ga
            related yehone techemari information ysetenal
            <aside className={styles.heroPanel} aria-label="What you get">
              <p className={styles.heroPanelLabel}>At a glance</p>
              <ul className={styles.heroPanelList}>
                <li>
                  <CheckCircle2 size={16} aria-hidden />
                  Markdown threads and replies
                </li>
                <li>
                  <CheckCircle2 size={16} aria-hidden />
                  Semantic search on question embeddings
                </li>
                <li>
                  <CheckCircle2 size={16} aria-hidden />
                  Optional AI draft tips when you ask or answer
                </li>
                <li>
                  <CheckCircle2 size={16} aria-hidden />
                  <span>
                    <strong className={styles.heroPanelStrong}>
                      Course RAG:
                    </strong>{" "}
                    upload or sync course materials, retrieve the best chunks
                    for each question, and answer with citations, not generic
                    web text.
                  </span>
                </li>
              </ul>
            </aside>
          </div>
        </section>

        {/* ------------------------------------------------------
         * COURSE RAG OVERVIEW
         * ------------------------------------------------------ */}
        <section
          className={styles.rag}
          id="course-rag" // yhe id kelay yetetekemnew navigartion button yhen section lemefeleg yemitekembet new
          aria-labelledby="rag-heading"
        >
          <div className={styles.sectionInner}>
            <p className={styles.ragEyebrow}>Retrieval-augmented generation</p>
            <h2 className={styles.sectionTitle} id="rag-heading">
              Ground answers in your course library
            </h2>
            <p className={styles.sectionLead}>
              Forum search already helps you find <em>similar questions</em>{" "}
              from peers. RAG goes further: it finds{" "}
              <em>evidence inside your own documents</em> (readings, rubrics,
              lab specs) and surfaces those snippets when you write or review an
              answer.
            </p>
            <div className={styles.ragPipeline}>
              <article className={styles.ragStep}>
                <span className={styles.ragStepIcon} aria-hidden>
                  <FileText size={20} />
                </span>
                <h3 className={styles.ragStepTitle}>Ingest &amp; chunk</h3>
                <p className={styles.ragStepText}>
                  Upload or connect course files; split them into overlapping
                  chunks and store embeddings so retrieval stays fast and
                  auditable.
                </p>
              </article>
              <article className={styles.ragStep}>
                <span className={styles.ragStepIcon} aria-hidden>
                  <Database size={20} />
                </span>
                <h3 className={styles.ragStepTitle}>
                  Retrieve at question time
                </h3>
                <p className={styles.ragStepText}>
                  When you ask or search, the app pulls the top-matching chunks
                  from the cohort corpus, not just other threads.
                </p>
              </article>
              <article className={styles.ragStep}>
                <span className={styles.ragStepIcon} aria-hidden>
                  <Sparkles size={20} />
                </span>
                <h3 className={styles.ragStepTitle}>Grounded responses</h3>
                <p className={styles.ragStepText}>
                  Prompts quote or summarize retrieved spans, leaving room for
                  instructors to review sources.
                </p>
              </article>
            </div>
            <p className={styles.ragFootnote}>
              Live forum threads, semantic question search, draft/fit AI
              helpers, and this RAG pipeline work together: uploads and access
              control live in the Knowledge base per cohort.
            </p>
          </div>
        </section>

        {!isAuthenticated && (
          <>
            //It means: only user loginn kaladerege ezih wust hulunm neger user gn already log in kaderege yhe section hidden new

            //Capabilities section //Capabilities section
            <section className={styles.capabilities}>
              <div className={styles.sectionInner}>
                <h2 className={styles.sectionTitle}>
                  Built for cohort coursework
                </h2>
                <p className={styles.sectionLead}>
                  Same patterns you use after sign-in, without a separate
                  "marketing product."
                </p>
                <div className={styles.cardGrid}>
                  // ezih ga degmo lehulum card'och grid create yaderglnal
                  <article className={styles.card}>
                    <div className={styles.cardIcon} aria-hidden>
                      <Search size={22} strokeWidth={1.75} />
                      // search icon
                    </div>
                    <h3 className={styles.cardTitle}>Find related work</h3>
                    // bekeyword weym temesasay yehone search find madreg
                    endemnchl yemigelts header
                    <p className={styles.cardBody}>
                      Keyword filters for exact matches, plus similarity search
                      when you're still shaping the right vocabulary.
                    </p>
                  </article>
                  <article className={styles.card}>
                    <div className={styles.cardIcon} aria-hidden>
                      <MessageSquare size={22} strokeWidth={1.75} /> //Message
                      icon.
                    </div>
                    <h3 className={styles.cardTitle}>Readable threads</h3>
                    //Explains questions and answers.
                    <p className={styles.cardBody}>
                      Questions and answers stay structured so the group can
                      reuse explanations before exams.
                    </p>
                  </article>
                  <article className={styles.card}>
                    <div className={styles.cardIcon} aria-hidden>
                      <Sparkles size={22} strokeWidth={1.75} />
                    </div>
                    <h3 className={styles.cardTitle}>Lightweight AI help</h3>
                    //Explains AI suggestions.
                    <p className={styles.cardBody}>
                      Suggestions on your question draft. Always your choice to
                      apply or post.
                    </p>
                  </article>
                  <article className={styles.card}>
                    <div className={styles.cardIcon} aria-hidden>
                      <Layers size={22} strokeWidth={1.75} /> //Layers icon
                    </div>
                    <h3 className={styles.cardTitle}>
                      RAG over your course library //Explains course-document
                      RAG.
                    </h3>
                    <p className={styles.cardBody}>
                      Upload PDFs and notes; the system retrieves the most
                      relevant passages when you ask.
                    </p>
                  </article>
                </div>
              </div>
            </section>
            {/* ----------------------------------------------------
             * HOW IT WORKS
             * ---------------------------------------------------- */}
            <section // Creates the How It Works section.
              className={styles.process}
              id="how-it-works" //our function  search siyaderg yeneberew yhen id new
              aria-labelledby="how-heading"
            >
              <div className={styles.sectionInner}>
                <h2 className={styles.sectionTitle} id="how-heading">
                  How it works
                </h2>
                <p className={styles.sectionLead}>
                  Four steps from question to searchable knowledge for the next
                  person.
                </p>
                <ol className={styles.steps}>
                  //step 1
                  <li className={styles.step}>
                    <span className={styles.stepIcon} aria-hidden>
                      <PenSquare size={18} /> //Shows the writing icon.
                    </span>
                    <div>
                      <h3 className={styles.stepTitle}>Ask with context</h3>
                      //user tyakewn betegebiw huneta or slemiteykut neger beki
                      information provide madereg alebachew
                      <p className={styles.stepText}>
                        Title, environment, and what you tried, so peers can
                        reproduce before they teach.
                      </p>
                    </div>
                  </li>
                  //Step 2
                  <li className={styles.step}>
                    <span className={styles.stepIcon} aria-hidden>
                      <MessageSquare size={18} /> //message icon
                    </span>
                    <div>
                      <h3 className={styles.stepTitle}>Get answers</h3>
                      // Explains that answers appear in the question thread.
                      <p className={styles.stepText}>
                        Replies live in one thread with markdown, visible to
                        everyone in the cohort.
                      </p>
                    </div>
                  </li>
                  //step 3
                  <li className={styles.step}>
                    <span className={styles.stepIcon} aria-hidden>
                      <Search size={18} /> //search icon
                    </span>
                    <div>
                      <h3 className={styles.stepTitle}>Search two ways</h3>
                      //user keyword ena semantic meaning bemeteqem search
                      madereg ychalal
                      <p className={styles.stepText}>
                        Classic keyword search, or semantic search when you want
                        "questions like this one."
                      </p>
                    </div>
                  </li>
                  //step 4
                  <li className={styles.step}>
                    <span className={styles.stepIcon} aria-hidden>
                      <Layers size={18} /> // Layers icon.
                    </span>
                    <div>
                      <h3 className={styles.stepTitle}>Own your trail</h3>
                      //user qdmo siteyk yeneberewn tyake temelso revisit madreg
                      endemichl ygeltslnal
                      <p className={styles.stepText}>
                        Your topics list keeps authorship clear, so you can
                        revisit what you've asked.
                      </p>
                    </div>
                  </li>
                </ol>
              </div>
            </section>
            {/* ----------------------------------------------------
             * BOTTOM CALL TO ACTION
             * ---------------------------------------------------- */}
            <section className={styles.cta}>
              {" "}
              //Creates the final call-to-action section.
              <div className={styles.ctaInner}>
                <h2 className={styles.ctaTitle}>Ready when you are</h2>
                //Displays the final heading.
                <p className={styles.ctaText}>
                  Create a free learner account to post, reply, and search the
                  forum index.
                </p>
                <button
                  type="button"
                  className={styles.btnPrimary}
                  onClick={() => navigate("/auth")} //takes the user to authentication.
                >
                  Create free account
                  <ArrowRight size={16} aria-hidden />
                </button>
              </div>
            </section>
          </>
        )}
      </main>

      {/* ------------------------------------------------------
       * FOOTER
       * ------------------------------------------------------ */}
      <footer className={styles.footer}>
        // Creates the bottom footer.
        <div className={styles.footerInner}>
          //Creates the footer's inner container.
          <div>
            //Creates a container for the footer brand.
            <p className={styles.footerBrand}>Evangadi Forum</p> //Displays the
            website name.
            <p className={styles.footerMeta}>
              © {new Date().getFullYear()} · Learner-led Q&A // new Date() gets
              the current date. // .getFullYear() gets the current year.So in
              2026 it displays:
            </p>
          </div>
          <div className={styles.footerLinks}>
            <button
              type="button"
              className={styles.footerLink}
              onClick={() => navigate("/auth")}
            >
              Sign in
            </button>
            <span className={styles.footerDot} aria-hidden>
              · //Displays a dot between links.
            </span>
            <a href="#" className={styles.footerLinkAnchor}>
              Privacy
            </a>
            <span className={styles.footerDot} aria-hidden>
              ·
            </span>
            <a href="#" className={styles.footerLinkAnchor}>
              Terms
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
