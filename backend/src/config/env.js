import dotenv from "dotenv";

dotenv.config();

const env = {
  port: process.env.PORT || 4000,

  database: {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    name: process.env.DB_NAME,
  },
  jwtSecret: process.env.JWT_SECRET,

  semanticSearch: {
    defaultK: Number(process.env.SEMANTIC_SEARCH_DEFAULT_K) || 10,
    recommendThreshold:
      Number(process.env.SEMANTIC_SEARCH_RECOMMEND_THRESHOLD) || 0.5,
    maxK: Number(process.env.SEMANTIC_SEARCH_MAX_K) || 20,
  },
};

export default env;
