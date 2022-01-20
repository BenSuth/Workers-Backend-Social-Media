import { addComment } from "../kv"
import { headers } from "../headers/headers"

let validate20 = require("../schema-validators/validate_comment_schema.js") // On build, ajx-cli precompiles json validators to ensure only the correct values are being accepted by the endpoint

// comments endpoint, add the posted comment to the proper post
export const UpdateComments = async (request: Request): Promise<Response> => {
    if (request.headers.get("Content-Type") != "application/json") {
        return new Response("Bad Request: Must post json content type", {status: 400, headers: headers})
    }
    
    let new_comment: PostComment
    try {
        new_comment = await request.json();     
    } catch(e) {
        return new Response("Internal Server Error: Cannot retrieve json data from post request", {status: 500, headers: headers})
    } 

    // Check that posted JSON matches the required schema
    if (!validate20(new_comment)) {
        return new Response("Bad Request: Incorrect json fields", {status: 400, headers: headers})
    }

    // posts cannot have a negative index
    if (new_comment["index"] < 1) {
        return new Response("Bad Request: Index cannot be less than 1", {status: 400, headers: headers})
    }

    // username cannot be null
    if (new_comment["username"] === "") {
        return new Response("Bad Request: Username field cannot be empty", {status: 400, headers: headers})
    }

    // does not allow blank comments
    if (new_comment["content"] === "") {
        return new Response("Bad Request: Content field cannot be empty", {status: 400, headers: headers})
    }

    try {
        let res = await addComment(new_comment)
        if (!res){
            return new Response("Bad Request: Index not found", {status: 400, headers: headers})
        }
    } catch(e) {
        console.log(e)
        return new Response("Bad Request: Index not found", {status: 400, headers: headers})
    }

    // succesful post
    return new Response("Ok", {status: 200, headers: headers})
}