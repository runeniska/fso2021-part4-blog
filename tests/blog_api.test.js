const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const Blog = require('../models/blog')
const initialBlogs = [
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

beforeEach(async () => {
  await Blog.deleteMany({})
  await Blog.insertMany(initialBlogs)
})

test('blogs are returned as json', async () => {
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)
})

test('the application returns correct number of blogs', async () => {
  const response = await api.get('/api/blogs')
  expect(response.body).toHaveLength(initialBlogs.length)
})

test('each blog includes "id" field', async () => {
  const response = await api.get('/api/blogs')
  response.body.forEach(blog => expect(blog.id).toBeDefined())
})

test.only('add blog with POST method', async () => {
  const blog = {
    "title": "New Blog 4",
    "author": "New Person 4",
    "url": "New URL 4",
    "likes": 400,
  }

  const postResponse = await api
    .post('/api/blogs')
    .send(blog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const addedBlog = postResponse.body
  const response = await api.get('/api/blogs')

  // verify that one blog is added
  expect(response.body).toHaveLength(initialBlogs.length + 1)
  // verify that the added blog is received with GET
  expect(response.body).toContainEqual(addedBlog)
})

afterAll(() => {
  mongoose.connection.close()
})
