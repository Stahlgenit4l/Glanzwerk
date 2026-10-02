import { openDatabase } from "./database.js";
import { createApp } from "./app.js";

const database = openDatabase(
  process.env.DATABASE_PATH || "./data/glanzwerk.sqlite",
);
const host = process.env.HOST || "127.0.0.1";
const port = Number(process.env.API_PORT || 3001);
const app = createApp(database);
const server = app.listen(port, host, () => {
  console.log(`Glanzwerk-Backend: http://${host}:${port}`);
});
server.on("error", (error) => {
  console.error(
    error.code === "EADDRINUSE"
      ? `Port ${port} ist bereits belegt.`
      : error.message,
  );
  database.close();
  process.exit(1);
});
for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () =>
    server.close(() => {
      database.close();
      process.exit(0);
    }),
  );
}
