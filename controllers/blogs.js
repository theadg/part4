const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')

blogsRouter.get('/', async (request, response) => {
    const blogs = await Blog.find({}).populate('user', {
        name: 1,
        username: 1,
        id: 1,
    })
    response.json(blogs)
})

blogsRouter.post('/', async (request, response) => {
    const { body } = request

    if (!body.title || !body.url) {
        response.status(400).json({ error: 'Incomplete fields' })
    }

    const user = await User.findById(body.userId)
    console.log(user)

    const blog = new Blog({
        title: body.title,
        author: body.author,
        url: body.url,
        likes: body.likes ?? 0,
        user: user.id,
    })

    const newBlog = await blog.save()
    user.blogs = user.blogs.concat(blog._id)
    await user.save()

    response.status(201).json(newBlog)
})

blogsRouter.get('/:id', async (request, response) => {
    const { id } = request.params
    const blog = await Blog.findById(id)
    if (blog) {
        response.json(blog)
    } else {
        response.status(404).end()
    }
})

blogsRouter.put('/:id', async (request, response) => {
    const { id } = request.params
    const { body } = request

    const blog = {
        title: body.title,
        author: body.author,
        url: body.url,
        likes: body.likes ?? 0,
    }

    const updatedBlog = await Blog.findByIdAndUpdate(id, blog, {
        new: true,
        runValidators: true,
    })

    if (updatedBlog) {
        response.status(201).json(updatedBlog)
    } else {
        response.status(404).end()
    }
})

blogsRouter.delete('/:id', async (request, response) => {
    const { id } = request.params
    // const blogToDelete = await Blog.findById
    const deletedBlog = await Blog.findByIdAndDelete(id)

    if (deletedBlog) {
        response.status(204).end()
    } else {
        response.status(404).end()
    }
})

module.exports = blogsRouter
