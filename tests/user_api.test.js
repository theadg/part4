const supertest = require('supertest')
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const User = require('../models/user')
const helper = require('./test_helper')
const app = require('../app')
const api = supertest(app)

beforeEach(async () => {
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('badg', 10)
    const user = new User({ username: 'badg', name: 'badg', passwordHash })

    await user.save()
})

describe('where there is initially one user in db', () => {
    test('creation succeeds with a fresh username', async () => {
        const usersAtStart = await helper.usersInDb()

        const newUser = {
            username: 'badg1',
            name: 'Bernard Andrew De Guzman',
            password: 'password',
        }

        const response = await api
            .post('/api/users')
            .send(newUser)
            .expect(201)
            .expect('Content-Type', /application\/json/)

        const usersAtEnd = await helper.usersInDb()
        expect(usersAtEnd).toHaveLength(usersAtStart.length + 1)

        // Checks if the users contain the newly added user
        // const usernames = usersAtEnd.map(u => u.username)
        // expect(usernames).toContain(newUser.username)

        // console.log(response)

        delete newUser.password
        expect(response.body).toMatchObject(newUser)
    })

    test('creation fails with proper statuscode and message if username already taken', async () => {
        const usersAtStart = await helper.usersInDb()

        // no need to hash the password now since this is a failing test
        const newUser = {
            username: 'badg',
            name: 'badg',
            password: 'badg',
        }

        const result = await api
            .post('/api/users')
            .send(newUser)
            .expect(400)
            .expect('Content-Type', /application\/json/)

        expect(result.body.error).toContain('expected `username` to be unique')

        const usersAtEnd = await helper.usersInDb()
        expect(usersAtEnd).toEqual(usersAtStart)
    })
})

afterAll(async () => {
    await mongoose.connection.close()
})
