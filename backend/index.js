const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
require('dotenv').config()
const Person = require('./models/person')

const app = express()
app.use(cors({
  origin: 'https://render-test-frontend-dpnp.onrender.com',
  methods: ['GET', 'POST', 'PUT', 'DELETE'], 
}))


app.use(express.json())
app.use(morgan('tiny'))

morgan.token('body', (req) => JSON.stringify(req.body))
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))


app.get('/api/persons', (request, response) => {
  Person.find({}).then(persons => {
    response.json(persons)
  })
})


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


app.get('/info', (request, response) => {
  Person.countDocuments({}).then(count => {
    const currentTime = new Date()
    response.send(`
      <p>Phonebook has info for ${count} people</p>
      <p>${currentTime}</p>
    `)
  })
})


app.delete('/api/persons/:id', (request, response, next) => {
  const id = request.params.id;
  console.log(`Received request to delete person with ID: ${id}`); 

  Person.findByIdAndDelete(id)
    .then(result => {
      if (!result) {
        console.log(`No person found with ID: ${id}`); 
        return response.status(404).json({ error: 'Person not found' });
      }
      console.log(`Successfully deleted person with ID: ${id}`); 
      response.status(204).end();
    })
    .catch(error => {
      console.error(`Error in delete handler:`, error.message); 
      next(error);
    });
});



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

app.put('/api/persons/:id', (request, response, next) => {
  const { name, number } = request.body; 

  
  const updatedPerson = {
    name,
    number,
  };

  
  Person.findByIdAndUpdate(
    request.params.id, 
    updatedPerson, 
    { new: true, runValidators: true, context: 'query' } 
  )
    .then(updated => {
      if (updated) {
        response.json(updated);
      } else {
        response.status(404).json({ error: 'Person not found' });
      }
    })
    .catch(error => next(error)); 
});


const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})


app.use((error, request, response, next) => {
  console.error('Error middleware:', error.message); 

  if (error.name === 'CastError' && error.kind === 'ObjectId') {
    return response.status(400).send({ error: 'Malformatted ID' });
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message });
  }

  next(error);
});



