import { OpenAPIHono } from "@hono/zod-openapi";
import { swaggerUI } from "@hono/swagger-ui";

import { authRoute } from "./routes/auth";
import { addressRoute } from "./routes/address";
import { brandRoute } from "./routes/brand";
import { categoriesRoute } from "./routes/category";
import { shoesRoute } from "./routes/shoe";
import { transactionRoute } from "./routes/transaction";

const app = new OpenAPIHono()

app.get('/', (c) => {
  return c.text('sneakersku-be')
})

app.route("/auth", authRoute);
app.route("/addresses", addressRoute);
app.route("/brands", brandRoute);
app.route("/categories", categoriesRoute);
app.route("/shoes", shoesRoute);
app.route("/transactions", transactionRoute);



app.doc31("/docs", {
  openapi: "3.0.0",
  info: {
    version: "1.0.0",
    title: "Sneakersku API",
  },
});

app.openAPIRegistry.registerComponent("securitySchemes", "AUTH_TOKEN", {
  type: "http",
  name: "Authorization",
  scheme: "Bearer",
  in: "header",
  description: "Bearer token",
});
app.get("/swagger", swaggerUI({ url: "/docs" }));


export default app
