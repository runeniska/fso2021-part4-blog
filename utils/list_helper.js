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

module.exports = {
  dummy, totalLikes, favoriteBlog
}
