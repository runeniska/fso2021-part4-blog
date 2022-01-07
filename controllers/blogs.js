const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
const jwt = require('jsonwebtoken')

blogsRouter.get('/', async (request, response) => {
  const allBlogs = await Blog.find({}).populate('user', { blogs: 0 })
  response.json(allBlogs)
})

blogsRouter.get('/:id', async (request, response) => {
  const blog = await Blog.findById(request.params.id)
  if (blog) {
    response.json(blog.toJSON())
  } else {
    response.status(404).end()
  }
})

blogsRouter.post('/', async (request, response) => {
  const decodedToken = jwt.verify(request.token, process.env.SECRET)
  if (!decodedToken.id) {
    return response.status(401).json({ error: 'invalid token' })
  }
  const user = await User.findById(decodedToken.id)

  const blog = new Blog({ user: user._id, ...request.body })

  const result = await blog.save()
  user.blogs = user.blogs.concat(result._id)
  await user.save()

  response.status(201).json(result)
})

blogsRouter.put('/:id', async (request, response) => {
  const body = request.body
  const blog = {
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes,
  }

  const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, blog, { new: true})
  response.json(updatedBlog.toJSON())
})

blogsRouter.delete('/:id', async (request, response) => {
  const decodedToken = jwt.verify(request.token, process.env.SECRET)
  if (!decodedToken.id) {
    return response.status(401).json({ error: 'invalid token' })
  }
  
  const blog = await Blog.findById(request.params.id)
  if (!blog) {
    return response.status(404).json({ error: 'blog has been already deleted' })
  }

  if (decodedToken.id === blog.user.toString()) {
    await Blog.findByIdAndRemove(request.params.id)
    const user = await User.findById(decodedToken.id)
    user.blogs = user.blogs.filter(b => b._id !== blog._id)
    await user.save()
  } else {
    return response.status(401).json({ error: 'unauthorized' })
  }

  response.status(204).end()
})

// Clear DB from blogs (ony for testing)
blogsRouter.delete('/', async () => {
  const allUsers = await User.find({})

  await Blog.deleteMany({})
  allUsers.forEach((user) => {
    user.blogs = []
    user.save()
  })
})

module.exports = blogsRouter