import { Router } from "itty-router";
import { GetPosts, AddPost } from "./handlers/posts"
import { UpdateLikes } from "./handlers/likes"
import { UpdateComments } from "./handlers/comments"
import { headers } from "./headers/headers"
import { cors } from "./handlers/cors"

const router = Router();

// Define endpoints for API
router
  .options("*", cors) // add cors header to all options requests
  .get("/posts", GetPosts) // display posts
  .post("/posts", AddPost) // create a new post
  .post("/likes", UpdateLikes) // add a like 
  .post("/comments", UpdateComments) // add a comment 
  .get('*', () => new Response("Not Found", { status: 404 })) // prevent access to undefined endpoints

export const handleRequest = (request: Request): Response => router.handle(request)