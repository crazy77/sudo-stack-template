import app from "./app";

const server = Bun.serve({
  fetch: app.fetch,
  port: Number(process.env.PORT ?? 3000),
});

console.log(`API server running at http://localhost:${server.port}`);
