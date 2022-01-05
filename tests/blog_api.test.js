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

test('add blog with POST method', async () => {
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

test('"likes" is 0 when given no value', async () => {
  const blog = {
    "title": "New Blog 5",
    "author": "New Person 5",
    "url": "New URL 5",
  }

  const postResponse = await api
    .post('/api/blogs')
    .send(blog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const addedBlog = postResponse.body
  const response = await api.get('/api/blogs')

  expect(addedBlog.likes).toBe(0)
  expect(response.body).toContainEqual({ ...addedBlog, likes: 0 })
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
      .send(noUrl)
      .expect(400)
  })
})

test('get existing blog', async () => {
  const blogsInDb = await api.get('/api/blogs')
  const blog = blogsInDb.body[0]
  await api.get(`/api/blogs/${blog.id}`).expect(200)
})

test('delete existing blog', async () => {
  const blogsInDb = await api.get('/api/blogs')
  const blog = blogsInDb.body[0]
  await api.delete(`/api/blogs/${blog.id}`).expect(204)
})

test('update existing blog', async () => {
  const blogsInDb = await api.get('/api/blogs')
  const blog = blogsInDb.body[0]
  const updatedBlog = {...blog, likes: 999}
  await api
    .put(`/api/blogs/${blog.id}`)
    .send(updatedBlog)
    .expect(200)
})

afterAll(() => {
  mongoose.connection.close()
})
