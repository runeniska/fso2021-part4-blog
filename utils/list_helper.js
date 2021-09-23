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

const mostLiked = (blogs) => {
  /* Reducer expects a sorted list.
   * If the new @blog is from the same author as previous blog,
   * the amount of likes for the author is updated. If the new
   * @blog is from another author, it is appended to the list.
   */
  const reducer = (sumList, blog) => {
    const length = sumList.length
    if (length === 0) {
      return [blog]
    } else {
      const prevBlog = sumList[length - 1]
      if (prevBlog.author === blog.author) {
        sumList.pop()
        sumList.push(new Object({ author: blog.author, likes: prevBlog.likes + blog.likes }))
        return sumList
      } else {
        sumList.push(blog)
        return sumList
      }
    }
  }

  // Filter only relevant information (author and likes)
  const mapped = blogs.map((blog) => new Object({ author: blog.author, likes: blog.likes}))
  // Prepare list for reducer algorithm
  const sorted = _.sortBy(mapped, (object) => object.author)
  // Count total likes for each author
  const reduced = sorted.reduce(reducer, [])
  // Find the author with most likes
  const result = _.maxBy(reduced, (object) => object.likes)

  return result
}

module.exports = {
  dummy, totalLikes, favoriteBlog, mostBlogs, mostLiked
}
