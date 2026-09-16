import pool from "../config/db.js";

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

const mapQuestionRow = (row) => ({
    id: row.id,
    questionHash: row.question_hash,
    title: row.title,
    content: row.content,
    answerCount: Number(row.answer_count) || 0,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    author: {
        id: row.author_id,
        firstName: row.author_first_name,
        lastName: row.author_last_name,
    },
});

const Question = {
    // ---------------------------------------------------------
    // FIND BY HASH
    // ---------------------------------------------------------
    async findByHash(questionHash) {
        const [rows] = await pool.execute(
            `
    ${BASE_QUESTION_SELECT}
    WHERE q.question_hash = ?
    GROUP BY q.id
    LIMIT 1
    `,
            [questionHash],
        );

        return rows[0] ? mapQuestionRow(rows[0]) : null;
    },
    // ==========================================================
    // FIND MANY (WITH OPTIONAL FILTERS)
    // ==========================================================

    // GET /api/questions - List questions with optional search and mine filter
    async findMany({ search, userId }) {
        const conditions = [];
        const params = [];

        if (search) {
            conditions.push("(q.title LIKE ? OR q.content LIKE ?)");
            const likeTerm = `%${search}%`;
            params.push(likeTerm, likeTerm);
        }

        if (userId) {
            conditions.push("q.user_id = ?");
            params.push(userId);
        }

        const whereClause =
            conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

        const [rows] = await pool.execute(
            `
    ${BASE_QUESTION_SELECT}
    ${whereClause}
    GROUP BY q.id
    ORDER BY q.created_at DESC
    `,
            params,
        );

        return rows.map(mapQuestionRow);
    },

    // ============================================================
    // FIND BY HASH
    // ============================================================

    // Find a question using its public question hash.
    // Returns null when no question matches.
    async findByHash(questionHash) {
        const [rows] = await pool.execute(
            `
    ${BASE_QUESTION_SELECT}
    WHERE q.question_hash = ?
    GROUP BY q.id
    LIMIT 1
    `,
            [questionHash],
        );

        return rows[0] ? mapQuestionRow(rows[0]) : null;
    },
};

export default Question;
