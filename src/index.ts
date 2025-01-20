import { OpenAPIHono } from "@hono/zod-openapi";
import { swaggerUI } from "@hono/swagger-ui";

import { authRoute } from "./routes/auth";


const app = new OpenAPIHono()

app.get('/', (c) => {
  return c.text('sneakersku-be')
})

app.route("/auth", authRoute);

app.doc31("/docs", {
  openapi: "3.0.0",
  info: {
    version: "1.0.0",
    title: "Sneakersku API",
  },
});

app.get("/swagger", swaggerUI({ url: "/docs" }));


export default app
