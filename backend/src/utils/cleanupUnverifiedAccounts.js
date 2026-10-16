import pool from "../config/db.js";
import env from "../config/env.js";

let isCleanupRunning = false;
let cleanupIntervalTimer = null;

/**
 * Safely purges password-based unverified accounts that exceed the retention age.
 *
 * Safety & Schema Guards:
 * 1. Strict Filter: Only deletes where `is_verified = FALSE`, `google_id IS NULL`,
 *    and `created_at < (NOW() - INTERVAL ? DAY)`.
 * 2. Foreign Key Protection: Existing questions and answers tables have RESTRICT foreign
 *    keys referencing users. To prevent foreign key constraint violations and avoid any
 *    destructive cascade data loss, `NOT EXISTS (SELECT 1 FROM questions ...)` and
 *    `NOT EXISTS (SELECT 1 FROM answers ...)` are explicitly enforced in the query.
 * 3. Excludes Google accounts: Accounts with non-null `google_id` are never touched.
 * 4. Excludes verified accounts: Verified users (`is_verified = TRUE`) are never touched.
 * 5. Parameterized query: `retentionDays` is passed as a parameterized integer.
 * 6. Overlap Protection: An in-memory lock (`isCleanupRunning`) prevents concurrent cycles.
 * 7. Privacy: Logs only the count of deleted records and errors without logging sensitive emails or tokens.
 *
 * Multi-Instance Deployment Note:
 * The single atomic parameterized `DELETE ... WHERE` statement is executed using InnoDB row-level
 * locking. Even if multiple application replicas run the query at the same time, InnoDB guarantees
 * serializable/repeatable execution without duplicate deletions or race conditions. In high-scale
 * clustered deployments (e.g., Kubernetes), running the job from a single worker node or via
 * an external CronJob with UNVERIFIED_CLEANUP_ENABLED=true prevents redundant scheduler cycles.
 *
 * @param {object} [options]
 * @param {number} [options.retentionDays] Retention window in days (default: env.unverifiedCleanup.retentionDays or 7)
 * @param {object} [options.dbPool] Database pool for dependency injection / testing
 * @returns {Promise<{ deletedCount: number, retentionDays: number }>}
 */
export async function cleanupUnverifiedAccounts({
  retentionDays = env.unverifiedCleanup?.retentionDays ?? 7,
  dbPool = pool,
} = {}) {
  if (isCleanupRunning) {
    console.warn("[Cleanup]: Previous unverified user cleanup is still running. Skipping cycle.");
    return { deletedCount: 0, retentionDays, skipped: true };
  }

  isCleanupRunning = true;

  try {
    const days = Math.max(1, Number(retentionDays) || 7);

    // Parameterized atomic deletion query enforcing all security and schema constraints
    const [result] = await dbPool.execute(
      `
      DELETE u FROM users u
      WHERE u.is_verified = FALSE
        AND u.google_id IS NULL
        AND u.created_at < (NOW() - INTERVAL ? DAY)
        AND NOT EXISTS (
          SELECT 1 FROM questions q WHERE q.user_id = u.user_id
        )
        AND NOT EXISTS (
          SELECT 1 FROM answers a WHERE a.user_id = u.user_id
        )
      `,
      [days],
    );

    const deletedCount = Number(result?.affectedRows) || 0;
    if (deletedCount > 0) {
      console.log(
        `[Cleanup]: Successfully purged ${deletedCount} unverified account(s) older than ${days} days.`,
      );
    }

    return { deletedCount, retentionDays: days, skipped: false };
  } catch (error) {
    console.error("[Cleanup Error]: Failed to purge unverified accounts:", error.message);
    throw error;
  } finally {
    isCleanupRunning = false;
  }
}

/**
 * Starts the periodic scheduled cleanup job.
 *
 * @param {object} [options]
 * @param {number} [options.retentionDays] Retention window in days (default: 7)
 * @param {number} [options.intervalHours] Interval in hours (default: 24)
 * @param {boolean} [options.runImmediately] Whether to run once immediately on startup
 */
export function startUnverifiedAccountsCleanupScheduler({
  retentionDays = env.unverifiedCleanup?.retentionDays ?? 7,
  intervalHours = env.unverifiedCleanup?.intervalHours ?? 24,
  runImmediately = true,
} = {}) {
  if (cleanupIntervalTimer) {
    clearInterval(cleanupIntervalTimer);
  }

  const intervalMs = Math.max(60000, Number(intervalHours) * 3600 * 1000);

  if (runImmediately) {
    cleanupUnverifiedAccounts({ retentionDays }).catch((err) => {
      console.error("[Cleanup Startup Error]:", err.message);
    });
  }

  cleanupIntervalTimer = setInterval(() => {
    cleanupUnverifiedAccounts({ retentionDays }).catch((err) => {
      console.error("[Cleanup Scheduled Error]:", err.message);
    });
  }, intervalMs);

  // Unref timer so it does not block the Node process from exiting
  if (cleanupIntervalTimer.unref) {
    cleanupIntervalTimer.unref();
  }

  console.log(
    `[Cleanup]: Scheduled unverified account cleanup every ${intervalHours} hour(s) (retention: ${retentionDays} days).`,
  );
}

/**
 * Stops the scheduled cleanup job (useful for graceful shutdown and tests).
 */
export function stopUnverifiedAccountsCleanupScheduler() {
  if (cleanupIntervalTimer) {
    clearInterval(cleanupIntervalTimer);
    cleanupIntervalTimer = null;
  }
}
