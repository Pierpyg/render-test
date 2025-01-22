const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
require('dotenv').config()
const Person = require('./models/person')

const app = express()
app.use(cors({
  origin: 'https://render-test-frontend-dpnp.onrender.com'
}))

app.use(express.json())
app.use(morgan('tiny'))

morgan.token('body', (req) => JSON.stringify(req.body))
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

// Recupera tutte le persone
app.get('/api/persons', (request, response) => {
  Person.find({}).then(persons => {
    response.json(persons)
  })
})

// Recupera una persona per ID
app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then(person => {
      if (person) {
        response.json(person)
      } else {
        response.status(404).end()
      }
    })
    .catch(error => next(error))
})

// Mostra le informazioni del Phonebook
app.get('/info', (request, response) => {
  Person.countDocuments({}).then(count => {
    const currentTime = new Date()
    response.send(`
      <p>Phonebook has info for ${count} people</p>
      <p>${currentTime}</p>
    `)
  })
})

// Elimina una persona per ID
app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndRemove(request.params.id)
    .then(() => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

// Aggiunge una nuova persona
app.post('/api/persons', (request, response, next) => {
  const body = request.body

  if (!body.name || !body.number) {
    return response.status(400).json({ error: 'content missing' })
  }

  Person.findOne({ name: body.name }).then(existingPerson => {
    if (existingPerson) {
      return response.status(400).json({ error: 'name must be unique' })
    } else {
      const person = new Person({
        name: body.name,
        number: body.number,
      })

      person.save()
        .then(savedPerson => {
          response.json(savedPerson)
        })
        .catch(error => next(error))
    }
  })
})

// Porta dal file .env
const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

// Gestione errori middleware
app.use((error, request, response, next) => {
  console.error(error.message)
  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  }
  next(error)
})

