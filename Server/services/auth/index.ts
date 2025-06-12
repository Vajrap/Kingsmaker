import { serve } from "bun";
import "dotenv/config";
import { handleRequest } from "./routes/router";


const PORT = parseInt(process.env.PORT || "3000");

serve({
  port: PORT,
  fetch: handleRequest,
});