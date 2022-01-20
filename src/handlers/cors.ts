import { headers } from "../headers/headers"

export const cors = async (request: Request): Promise<Response> => {
    return new Response("Ok", {headers: headers})
}