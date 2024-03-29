const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')

usersRouter.get('/', async (request, response) => {
  const allUsers = await User.find({}).populate('blogs', { user: 0, likes: 0 })
  response.json(allUsers)
})

usersRouter.post('/', async (request, response) => {
  const body = request.body

  if (body.password === undefined) {
    return response.status(400).json({ error: 'password is not defined' })
  }
  if (body.password.length < 3) {
    return response.status(400).json({ error: 'password is less than 3 characters long' })
  }

  const saltRounds = 10
  const passwordHash = await bcrypt.hash(body.password, saltRounds)

  const user = new User({
    username: body.username,
    name: body.name,
    passwordHash,
  })

  const savedUser = await user.save()

  response.json(savedUser)
})


module.exports = usersRouter
