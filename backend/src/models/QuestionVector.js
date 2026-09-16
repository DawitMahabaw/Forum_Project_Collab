import pool from "../config/db.js";

const QuestionVector = {
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


    async findAllReady() {
        return [];
    },
};

export default QuestionVector;