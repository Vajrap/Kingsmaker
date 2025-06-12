// import { handleRegister } from "./register";
// import { handleLogin } from "./login";
// import { handleGuestLogin } from "./guestLogin";
// Add more as needed

export async function handleRequest(req: Request): Promise<Response> {
  const url = new URL(req.url);

//   if (req.method === "POST" && url.pathname === "/register") {
//     return handleRegister(req);
//   }

//   if (req.method === "POST" && url.pathname === "/login") {
//     return handleLogin(req);
//   }

//   if (req.method === "POST" && url.pathname === "/guest-login") {
//     return handleGuestLogin(req);
//   }

  return new Response("Not Found", { status: 404 });
}