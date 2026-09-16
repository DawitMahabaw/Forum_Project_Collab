import pool from "../config/db.js";

const QuestionVector = {
    // ---------------------------------------------------------
    // FIND QUESTIONS THAT NEED AN EMBEDDING
    // ---------------------------------------------------------

    async findQuestionsNeedingEmbedding(limit = 100) {
        const [rows] = await pool.execute(
            `
            SELECT q.id, q.title, q.content
            FROM questions q
            LEFT JOIN question_vectors qv ON qv.question_id = q.id
            WHERE qv.question_id IS NULL OR qv.status != 'ready' OR qv.embedding IS NULL
            ORDER BY q.created_at ASC
            LIMIT ?
            `,
            [limit],
        );

        return rows.map((row) => ({
            id: Number(row.id),
            title: row.title,
            content: row.content,
        }));
    },

    // ---------------------------------------------------------
    // FIND ALL READY VECTORS
    // ---------------------------------------------------------
    //
    // Powers semantic search across ALL questions
    // (GET /api/questions/search).
    //
    // Only 'ready' vectors are returned, since 'failed' rows have
    // no embedding to compare against.
    //
    // excludeQuestionId is optional and is used by "similar
    // questions" to avoid recommending a question to itself.
    async findAllReady({ excludeQuestionId } = {}) {
        const params = [];
        let whereClause = "WHERE status = 'ready'";

        if (excludeQuestionId) {
            whereClause += " AND question_id != ?";
            params.push(excludeQuestionId);
        }

        const [rows] = await pool.execute(
            `
            SELECT question_id, embedding
            FROM question_vectors
            ${whereClause}
            `,
            params,
        );

        return rows.map((row) => ({
            questionId: row.question_id,
            embedding:
                typeof row.embedding === "string"
                    ? JSON.parse(row.embedding)
                    : row.embedding,
        }));
    },

    async findAllReady() {
        return [];
    },
};

export default QuestionVector;