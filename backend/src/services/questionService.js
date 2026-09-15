import db from "../config/db.js";

// ============================================================
// GET QUESTIONS SERVICE (T-10)
// ============================================================

export const getQuestionsService = async ({ search, onlyMine, userId }) => {
    let query = `
        SELECT 
            q.question_id,
            q.user_id,
            q.title,
            q.description,
            q.created_at,
            u.user_name
        FROM questions q
        JOIN users u ON q.user_id = u.user_id
    `;

    const params = [];
    const conditions = [];

    if (search) {
        conditions.push("(q.title LIKE ? OR q.description LIKE ?)");
        params.push(`%${search}%`, `%${search}%`);
    }

    if (onlyMine && userId) {
        conditions.push("q.user_id = ?");
        params.push(userId);
    }

    if (conditions.length > 0) {
        query += " WHERE " + conditions.join(" AND ");
    }

    query += " ORDER BY q.created_at DESC";

    const [questions] = await db.execute(query, params);

    return {
        questions,
        meta: {
            total: questions.length,
        },
    };
};

// ============================================================
// SEMANTIC SEARCH SERVICE
// ============================================================

export const searchQuestionsSemanticService = async ({ query, k, threshold }) => {
    // Service logic for semantic search
    return {
        data: [],
        meta: { query, k, threshold }
    };
};