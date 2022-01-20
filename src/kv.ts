/* Functions that update and create KV indices */

/*
    MY KV layout uses 2 keys: index and posts

    index simply stores the current size of the post array

    posts if an array of objects, storing the information of the post
    they're indexed inorder of insertion.

*/

// Add a new post to the KV
export const updateKV = async (data: Post) => {
    let cached_index, cached_post_list

    // retrieve what is already in the posts
    try {
        cached_index = await WORKERS_API_KV.get("index");
        cached_post_list = await WORKERS_API_KV.get("posts");
    } catch (e) {
        console.log(e)
        return
    }

    let kv_index = 1;
    
    if (cached_index) {
        kv_index = parseInt(cached_index);
    }

    // if there is already posts in the KV, push the new post onto the end
    if (cached_post_list) {
        let post_list = JSON.parse(cached_post_list)
        post_list["posts"].push({
            index: kv_index,
            title: data.title,
            username: data.username,
            content: data.content,
            img: data.img,
            link: data.link,
            likes: 0,
            comment_index: 1,
            comments: []
        });

        let post_list_string = JSON.stringify(post_list)

        try {
            await WORKERS_API_KV.put("posts", post_list_string)
        } catch (e) {
            console.log(e)
            return
        }
    // if there is new posts, initialize the "posts" key value
    } else {
        let init_list = {
            posts: [
                {
                    index: kv_index,
                    title: data.title,
                    username: data.username,
                    content: data.content,
                    img: data.img,
                    link: data.link,
                    likes: 0,
                    comment_index: 1,
                    comments: []
                }
            ]
        }

        const init_list_string = JSON.stringify(init_list)
        await WORKERS_API_KV.put("posts", init_list_string)
    }

    // now that a post is added, increment index
    kv_index += 1

    try {
        await WORKERS_API_KV.put("index", kv_index.toString())
    } catch(e) {
        console.log(e)
        return
    }
}

/* 
* Retrieve posts from KV
* Returns Posts JSON on success, empty JSON on fail (or no posts)
*/
export const getPosts = async () => {
    let post_list_string
    try {
        post_list_string = await WORKERS_API_KV.get("posts")
    } catch(e) {
        console.log(e)
        return {
            posts: []
        }
    }

    if (!post_list_string) {
        return {
            posts: []
        }
    } else {
        let post_list = JSON.parse(post_list_string!)
        return post_list
    }
}

/* 
* Sets the number of likes for a specific post
* index: the internal post index 
* like_count: the new number of likes
* returns like_count on success, -1 on failure
*/
export const setLikes = async (index: number, like_count: number): Promise<number> => {
    let post_list_string
    try {
        post_list_string = await WORKERS_API_KV.get("posts")
    } catch(e) {
        console.log(e)
        return -1
    }

    let update_flag = false; // keeps track of if the post is found

    if (!post_list_string) {
        return -1
    }
    
    let post_list = JSON.parse(post_list_string!)
    const search_list: PostDB[] = post_list["posts"]

    for (let post of search_list) {
        if (post["index"] == index) {
            post["likes"] = like_count + 1
            update_flag = true;
            break;
        }
    }

    // if we updated a post, update the KV and return success
    if (update_flag) {
        let construct_list = {
            posts: search_list
        }

        const construct_list_string = JSON.stringify(construct_list)
        try {
            await WORKERS_API_KV.put("posts", construct_list_string)
        } catch(e) {
            console.log(e)
            return -1
        }

        return like_count
    }

    return -1;
}

/*
* Update the comment array for a given post
* data: an object sent from the frontend
* Returns a booleam, true if updated
*/
export const addComment = async (data: PostComment): Promise<boolean> => {
    let post_list_string: string | null = ""
    try {
        post_list_string = await WORKERS_API_KV.get("posts")
    } catch(e) {
        console.log(e)
        false
    }

    let update_flag = false // keeps track of if the post is found

    if (!post_list_string) {
        return false
    }
    
    let post_list = JSON.parse(post_list_string!)
    const search_list: PostDB[] = post_list["posts"] // reach the list of posts from the KV

    // search for the post, update the post if we find the index
    for (let post of search_list) {
        if (post["index"] == data.index) {
            const comment: PostComment = {
                index: post["comment_index"],
                username: data.username,
                content: data.content,
            }
            post["comment_index"] += 1;
            post["comments"].push(comment)
            update_flag = true
            break
        }
    }

    // if we found the post, return success and update KV
    if (update_flag) {
        let construct_list = {
            posts: search_list
        }

        const construct_list_string = JSON.stringify(construct_list)

        try {
            await WORKERS_API_KV.put("posts", construct_list_string)
        } catch(e) {
            console.log(e)
            return false
        }

        return true
    }

    return false;
}