const _ = require('lodash')

const dummy = (blogs) => {
    return 1
}

const totalLikes = (blogs) => {
    return blogs.reduce(
        (accumulator, currentVal) => accumulator + currentVal.likes,
        0
    )
}

const favoriteBlog = (blogs) => {
    const faveBlog =
        blogs.sort((blogOne, blogTwo) => {
            return blogTwo.likes - blogOne.likes
        })[0] ?? null

    return (
        faveBlog && {
            title: faveBlog.title,
            author: faveBlog.author,
            likes: faveBlog.likes,
        }
    )
}

const mostBlogs = (blogs) => {
    // get all unique authors
    const uniqueAuthors = _.uniqBy(blogs, (blog) => blog.author)

    // get all the number of blogs of the uniqueAuthors
    const authorsWithBookCount = uniqueAuthors.map((blog) => ({
        author: blog.author,
        blogs: _.filter(blogs, { author: blog.author }).length ?? 0,
    }))

    return (
        authorsWithBookCount.sort((authorOne, authorTwo) => {
            return authorTwo.blogs - authorOne.blogs
        })[0] ?? null
    )
}

const mostLikes = (blogs) => {
    // get all unique authors
    const uniqueAuthors = _.uniqBy(blogs, (blog) => blog.author)

    // get all the number of likes of the uniqueAuthors
    const authorsWithLikes = uniqueAuthors.map((blog) => ({
        author: blog.author,
        likes: blogs
            .filter((blogItem) => blogItem.author ===  blog.author)
            .reduce(
                (accumulator, currentVal) => accumulator + currentVal.likes,
                0
            ),
    }))

    return (
        authorsWithLikes.sort((authorOne, authorTwo) => {
            return authorTwo.likes - authorOne.likes
        })[0] ?? null
    )
}

module.exports = {
    dummy,
    totalLikes,
    favoriteBlog,
    mostBlogs,
    mostLikes,
}
