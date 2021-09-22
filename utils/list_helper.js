var _ = require('lodash')

const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) => {
  return blogs.reduce((sum, blog) => sum + blog.likes, 0)
}

const favoriteBlog = (blogs) => {
  const reducer = (favorite, blog) => {
    if (typeof favorite.likes === 'undefined')
      return blog
    else
      return blog.likes > favorite.likes ? blog : favorite
  }
  return blogs.reduce(reducer, {})
}

const mostBlogs = (blogs) => {
  const occurrences = _.countBy(blogs, (blog) => blog.author)
  const authorBlogs = _.maxBy(Object.entries(occurrences), (obj) => obj[1])
  const result = {
    "author": authorBlogs[0],
    "blogs": authorBlogs[1]
  }
  return result
}

module.exports = {
  dummy, totalLikes, favoriteBlog, mostBlogs
}
