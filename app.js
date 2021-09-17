const express = require('express')
const app = express()
const cors = require('cors')
const mongoose = require('mongoose')

const logger = require('./utils/logger')
const config = require('./utils/config')
const blogsRouter = require('./controllers/blogs')

mongoose.connect(config.MONGODB_URI)
  .then(() => {
    logger.info('Connected to MongoDB')
  })
  .catch((error) => {
    logger.error('error connection to MongoDB:', error.message)
  })

app.use(cors())
app.use(express.json())
app.use('/api/blogs', blogsRouter)

module.exports = app