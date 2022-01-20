interface PostDB {
    index: number,
    title: string,
    username: string,
    content: string,
    img: string,
    link: string,
    likes: number,
    comment_index: number,
    comments: PostComment[]
}