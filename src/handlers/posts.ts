import { getPosts, updateKV } from "../kv"
import { headers } from "../headers/headers"

let validate20 = require("../schema-validators/validate_post_schema.js") // On build, ajx-cli precompiles json validators to ensure only the correct values are being accepted by the endpoint

// return all posts as an array of post objects
export const GetPosts = async () => {

  const post_list = await getPosts();

  const post_list_string = JSON.stringify(post_list["posts"]);
  
  return new Response(post_list_string, {status: 200, headers: headers})
}

// add a new post
export const AddPost = async (request: Request): Promise<Response> => {
  if (request.headers.get("Content-Type") != "application/json") {
    return new Response("Bad Request: Must post json content type", {status: 400, headers: headers})
  }

  let new_post: Post
  try {
      new_post = await request.json();     
  } catch(e) {
      return new Response("Internal Server Error: Cannot retrieve json data from post request", {status: 500, headers: headers})
  } 

    // Check that posted JSON matches the required schema
  if (!validate20(new_post)) {
    return new Response("Bad Request: Incorrect json fields", {status: 400, headers: headers})
  }

  // a post must have a title
  if (new_post["title"] == "") {
    return new Response("Bad Request: Title field cannot be empty", {status: 400, headers: headers})
  }
  
  // a post must have a username
  if (new_post["username"] == "") {
    return new Response("Bad Request: Username field cannot be empty", {status: 400, headers: headers})
  }

  // post must have content
  if (new_post["content"] == "") {
    return new Response("Bad Request: Content field cannot be empty", {status: 400, headers: headers})
  }
  
  // insert an image field if the post does not have it
  if (!new_post.hasOwnProperty("img")) {
    new_post["img"] = ""
  }

    // insert a like field if the post does not have it
  if (!new_post.hasOwnProperty("link")) {
    new_post["link"] = ""
  }
  
  try {
    await updateKV(new_post)
  }
  catch(e) {
    console.log(e)
    return new Response("Internal Server Error: Cannot store this post", {status: 500, headers: headers})
  }

  // succesful post
  return new Response("Ok", {status: 200, headers: headers})
}