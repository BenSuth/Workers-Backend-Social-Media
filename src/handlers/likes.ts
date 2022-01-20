import { setLikes } from "../kv"
import { headers } from "../headers/headers"

let validate20 = require("../schema-validators/validate_like_schema.js") // On build, ajx-cli precompiles json validators to ensure only the correct values are being accepted by the endpoint

// update the likes of a post
export const UpdateLikes = async (request: Request): Promise<Response> => {
    if (request.headers.get("Content-Type") != "application/json") {
        return new Response("Bad Request: Must post json content type", {status: 400, headers: headers})
      }
    
    let new_post: Like
    try {
        new_post = await request.json(); 
    } catch(e) {
        return new Response("Internal Server Error: Cannot retrieve json data from post request", {status: 500, headers: headers})
    }

    // Check that posted JSON matches the required schema
    if (!validate20(new_post)) {
        return new Response("Bad Request: Incorrect json fields", {status: 400, headers: headers})
    }

    // posts cannot have a negative index
    if (new_post["index"] < 1) {
        return new Response("Bad Request: Index cannot be less than 1", {status: 400, headers: headers})
    }
    
    // likes can only be positive
    if (new_post["likes"] < 0) {
        return new Response("Bad Request: Like field cannot be negative", {status: 400, headers: headers})
    }

    try {
        const res: number = await setLikes(new_post["index"], new_post["likes"]);

        if (res == -1) {
            return new Response("Bad Request: Index not found", {status: 400, headers: headers})
        }
    } catch (e) {
        return new Response("Bad Request: Index not found", {status: 400, headers: headers})
    }

    // succesful post
    return new Response("Ok", {status: 200, headers: headers})
}