const mongoose = require('mongoose')
const supertest = require('supertest')
const jwt = require('jsonwebtoken')
const app = require('../app')
const api = supertest(app)
const Blog = require('../models/blog')
const User = require('../models/user')
let initialBlogs = [
  {
    "title": "New Blog",
    "author": "New Person",
    "url": "New URL",
    "likes": 100,
  },
  {
    "title": "New Blog 2",
    "author": "New Person 2",
    "url": "New URL 2",
    "likes": 200,
  },
  {
    "title": "New Blog 3",
    "author": "New Person 3",
    "url": "New URL 3",
    "likes": 300,
  }
]
const user = {
  "name": "Test User",
  "username": "test",
  "password": "pwd123"
}
const login = {
  "username": "test",
  "password": "pwd123"
}
const auth = {}
let blogsInDb = {}

beforeAll(async () => {
  await User.deleteMany({})
  await api
    .post('/api/users')
    .send(user)
    .expect(200)
    .expect('Content-Type', /application\/json/)
  const response = await api
    .post('/api/login')
    .send(login)
    .expect(200)
    .expect('Content-Type', /application\/json/)
  auth.token = response.body.token
  const userId = jwt.verify(auth.token, process.env.SECRET).id
  initialBlogs = initialBlogs.map(blog => ({ ...blog, "user": userId.toString() }))  
})

beforeEach(async () => {
  await Blog.deleteMany({})
  blogsInDb = await Blog.insertMany(initialBlogs)
})

test('blogs are returned as json', async () => {
  await api
    .get('/api/blogs')
    .set('Authorization', `Bearer ${auth.token}`)
    .expect(200)
    .expect('Content-Type', /application\/json/)
})

test('the application returns correct number of blogs', async () => {
  const response = await api
    .get('/api/blogs')
    .set('Authorization', `Bearer ${auth.token}`)
  expect(response.body).toHaveLength(initialBlogs.length)
})

test('each blog includes "id" field', async () => {
  const response = await api
    .get('/api/blogs')
    .set('Authorization', `Bearer ${auth.token}`)
  response.body.forEach(blog => expect(blog.id).toBeDefined())
})

test('add blog with POST method', async () => {
  const blog = {
    "title": "New Blog 4",
    "author": "New Person 4",
    "url": "New URL 4",
    "likes": 400,
  }

  const postResponse = await api
    .post('/api/blogs')
    .set('Authorization', `Bearer ${auth.token}`)
    .send(blog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const addedBlog = postResponse.body
  const response = await api
    .get('/api/blogs')
    .set('Authorization', `Bearer ${auth.token}`)

  // verify that one blog is added
  expect(response.body).toHaveLength(initialBlogs.length + 1)
  // verify that the added blog is received with GET
  const titles = response.body.map(blog => blog.title)
  expect(titles).toContainEqual(addedBlog.title)
})

test('"likes" is 0 when given no value', async () => {
  const blog = {
    "title": "New Blog 5",
    "author": "New Person 5",
    "url": "New URL 5",
  }

  const postResponse = await api
    .post('/api/blogs')
    .set('Authorization', `Bearer ${auth.token}`)
    .send(blog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const addedBlog = postResponse.body
  const response = await api
    .get('/api/blogs')
    .set('Authorization', `Bearer ${auth.token}`)

  expect(addedBlog.likes).toBe(0)
  const titlesAndLikes = response.body.map(blog => ({ title: blog.title, likes: blog.likes }))
  expect(titlesAndLikes).toContainEqual({ title: addedBlog.title, likes: 0 })
})

describe('blog must include', () => {
  test('title', async () => {
    const noTitle = {
      "author": "New Person 6",
      "url": "New URL 6",
      "likes": 0,
    }

    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${auth.token}`)
      .send(noTitle)
      .expect(400)
  })

  test('url', async () => {
    const noUrl = {
      "title": "New Blog 7",
      "author": "New Person 7",
      "likes": 0,
    }

    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${auth.token}`)
      .send(noUrl)
      .expect(400)
  })
})

test('get existing blog', async () => {
  const blog = blogsInDb[0]
  await api
    .get(`/api/blogs/${blog.id}`)
    .set('Authorization', `Bearer ${auth.token}`)
    .expect(200)
})

test('delete existing blog', async () => {
  const blog = blogsInDb[0]
  await api
    .delete(`/api/blogs/${blog.id}`)
    .set('Authorization', `Bearer ${auth.token}`)
    .expect(204)
})

test('update existing blog', async () => {
  const blog = blogsInDb[0]
  const updatedBlog = {...blog, likes: 999}
  await api
    .put(`/api/blogs/${blog.id}`)
    .set('Authorization', `Bearer ${auth.token}`)
    .send(updatedBlog)
    .expect(200)
})

afterAll(() => {
  mongoose.connection.close()
})
