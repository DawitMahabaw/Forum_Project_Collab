import pool from "../config/db.js";

// ============================================================
// SHARED SELECT FRAGMENT
// ============================================================

const BASE_QUESTION_SELECT = `
    SELECT
        q.id,
        q.question_hash,
        q.title,
        q.content,
        q.user_id,
        q.created_at,
        q.updated_at,
        u.user_id   AS author_id,
        u.first_name AS author_first_name,
        u.last_name  AS author_last_name,
        COUNT(a.id) AS answer_count
    FROM questions q
    INNER JOIN users u ON u.user_id = q.user_id
    LEFT JOIN answers a ON a.question_id = q.id
`;