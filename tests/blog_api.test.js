const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('./test_helper')
const app = require('../app')

const api = supertest(app)

const Blog = require('../models/blog')

beforeEach(async () => {
    await Blog.deleteMany({})
    const blogObjects = helper.initialBlogs.map((blog) => new Blog(blog))
    const promiseArray = blogObjects.map((blog) => blog.save())
    await Promise.all(promiseArray)
})

describe('when there are initial blogs', () => {
    test('gets all the blogs', async () => {
        const res = await api
            .get('/api/blogs')
            .expect(200)
            .expect('Content-type', /application\/json/)

        expect(res.body).toHaveLength(helper.initialBlogs.length)
    })

    test('blogs have id property', async () => {
        const res = await api
            .get('/api/blogs')
            .expect(200)
            .expect('Content-type', /application\/json/)

        res.body.forEach((blog) => {
            expect(blog.id).toBeDefined()
        })
    })
})

describe('saves a blog', () => {
    test('gets 401 error with no auth header', async () => {
        const newBlog = {
            title: 'Getting better',
            author: 'Bernard',
            url: 'secretblog.com',
            likes: 69,
        }

        const res = await api
            .post('/api/blogs')
            .send(newBlog)
            .expect(401)
            .expect('Content-Type', /application\/json/)
    })

    test('creates blog with a header', async () => {
        const newBlog = {
            title: 'Getting better',
            author: 'Bernard',
            url: 'secretblog.com',
            likes: 69,
            user: '65b669d1eabdcdc29608eaf2',
        }

        const res = await api
            .post('/api/blogs')
            .send(newBlog)
            .set(
                'Authorization',
                'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImJhZGciLCJpZCI6IjY1YjY2OWQxZWFiZGNkYzI5NjA4ZWFmMiIsImlhdCI6MTcwNjQ1NTYwNCwiZXhwIjoxNzA2NDU5MjA0fQ.WYUwzp60eh4z6PM_WrpvEJdsUxjHj9Q9mmLtkOTAw2I'
            )
            .expect(201)
            .expect('Content-Type', /application\/json/)

        const blogs = await helper.blogsInDb()
        expect(blogs).toHaveLength(helper.initialBlogs.length + 1)

        expect(res.body).toMatchObject(newBlog)
    })

    test('blog likes defaults to 0', async () => {
        const newBlog = {
            title: 'Getting better',
            author: 'Bernard',
            url: 'secretblog.com',
            user: '65b669d1eabdcdc29608eaf2',
        }

        const res = await api
            .post('/api/blogs')
            .send(newBlog)
            .set(
                'Authorization',
                'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImJhZGciLCJpZCI6IjY1YjY2OWQxZWFiZGNkYzI5NjA4ZWFmMiIsImlhdCI6MTcwNjQ1NTYwNCwiZXhwIjoxNzA2NDU5MjA0fQ.WYUwzp60eh4z6PM_WrpvEJdsUxjHj9Q9mmLtkOTAw2I'
            )
            .expect(201)
            .expect('Content-Type', /application\/json/)

        const blogs = await helper.blogsInDb()
        expect(blogs).toHaveLength(helper.initialBlogs.length + 1)
        expect(res.body).toHaveProperty('likes', 0)
    })

    test('fails with status code 400 if data invalid', async () => {
        const newBlog = {
            author: 'Bernard',
        }

        await api
            .post('/api/blogs')
            .send(newBlog)
            .set(
                'Authorization',
                'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImJhZGciLCJpZCI6IjY1YjY2OWQxZWFiZGNkYzI5NjA4ZWFmMiIsImlhdCI6MTcwNjQ1NTYwNCwiZXhwIjoxNzA2NDU5MjA0fQ.WYUwzp60eh4z6PM_WrpvEJdsUxjHj9Q9mmLtkOTAw2I'
            )
            .expect(400)
    })
})

describe('updates a blog', () => {
    test('blog gets updated on the db', async () => {
        const initialBlogs = await helper.blogsInDb()
        const blogToUpdate = initialBlogs[0]
        blogToUpdate.title = 'Updated blog'
        blogToUpdate.likes = 500

        const response = await api
            .put(`/api/blogs/${blogToUpdate.id}`)
            .send(blogToUpdate)
            .expect(201)
            .expect('Content-Type', /application\/json/)

        expect(response.body).toMatchObject(blogToUpdate)
    })

    test('returns 400 if blog id is malformatted', async () => {
        const initialBlogs = await helper.blogsInDb()
        const blogToUpdate = initialBlogs[0]
        blogToUpdate.id = 555

        await api
            .put(`/api/blogs/${blogToUpdate.id}`)
            .send(blogToUpdate)
            .expect(400)
    })

    test('returns 404 if blog is not found', async () => {
        const notExistingId = new mongoose.Types.ObjectId(
            '4edd40c86762e0fb12000003'
        )
        await api.put(`/api/blogs/${notExistingId}`).expect(404)
    })
})

describe('deletes a blog', () => {
    test.only('succeeds with status code 204 if id is valid', async () => {
        const initialBlogs = await helper.blogsInDb()
        const blogToDelete = initialBlogs[0]

        await api
            .delete(`/api/blogs/${blogToDelete.id}`)
            .set(
                'Authorization',
                'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImJhZGciLCJpZCI6IjY1YjY2OWQxZWFiZGNkYzI5NjA4ZWFmMiIsImlhdCI6MTcwNjQ1NTYwNCwiZXhwIjoxNzA2NDU5MjA0fQ.WYUwzp60eh4z6PM_WrpvEJdsUxjHj9Q9mmLtkOTAw2I'
            )
            .expect(204)

        const finalBlogs = await helper.blogsInDb()

        expect(finalBlogs).toHaveLength(helper.initialBlogs.length - 1)
        expect(finalBlogs).not.toContain(blogToDelete)
    })

    test('returns 400 if blog id is malformatted', async () => {
        const initialBlogs = await helper.blogsInDb()
        const blogToDelete = initialBlogs[0]
        blogToDelete.id = 555

        await api
            .delete(`/api/blogs/${blogToDelete.id}`)
            .send(blogToDelete)
            .expect(400)
    })

    test('returns 404 if blog is not found', async () => {
        const notExistingId = new mongoose.Types.ObjectId(
            '4edd40c86762e0fb12000003'
        )
        await api.delete(`/api/blogs/${notExistingId}`).expect(404)
    })
})

afterAll(async () => {
    await mongoose.connection.close()
})
