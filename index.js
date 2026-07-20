require('dotenv').config()
const express = require('express')
//MONGOOSE MODEL
const Person = require('./models/person')
//Middleware Morgan
const morgan = require('morgan')
const cors = require('cors')
const app = express()
app.use(express.static('dist'))
app.use(express.json())
app.use(cors())
//Use this for static Frontend build file
app.use(express.static('dist'))

//Token for POST request data
morgan.token('post_data', function (req, res) {
  //console.log(req.body); //undefined when GET
  //Cannot convert undefined or null to object
  //return in string format
  return req.body && req.body.length !== 0 ? JSON.stringify(req.body) : '-'
})

//app.use(morgan('tiny'));
//':method :url :status :res[content-length] - :response-time ms :post_data'
app.use(
  morgan(
    ':method :url :status :res[content-length] - :response-time ms :post_data',
  ),
)

//MONGOOSE TEST
/*
const mongoose = require('mongoose');
const url = process.env.MONGODB_URI;

mongoose.set('strictQuery', false);
mongoose
  .connect(url, { family: 4 })
  .then((result) => {
    console.log('Connecting to ' + url);
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.log('error connecting to MongoDB:', error.message);
  });

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
});

const Person = mongoose.model('Person', personSchema);

personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});
*/
//LOCALHOST
app.get('/', (request, response) => {
  response.send('<h1>Hello World!</h1>')
})

//All persons
app.get('/api/persons', (request, response, next) => {
  //MONGOOSE
  Person.find({})
    .then((persons) => {
      response.json(persons)
    })
    .catch((error) => next(error))
})

//GET by ID
app.get('/api/persons/:id', (request, response, next) => {
  //const id = Number(request.params.id);
  Person.findById(request.params.id)
    .then((person) => {
      if (person) {
        response.json(person)
      } else {
        response.status(404).end()
      }
    })
    .catch((error) => {
      next(error)
      //console.log(error);
      //response.status(400).send({ error: 'malformatted id' });
    })
  /*
  const person = persons.find((person) => person.id === id);
  if (person) {
    response.json(person);
  } else {
    response.status(404).end();
  }
    */
})

//DELETE
app.delete('/api/persons/:id', (request, response, next) => {
  console.log('Clicked Delete')
  Person.findByIdAndDelete(request.params.id)
    .then((result) => {
      response.status(204).end()
    })
    .catch((error) => next(error))
})

//POST
app.post('/api/persons', (request, response, next) => {
  //Content from body
  const body = request.body

  /** REPLACED WITH Mongoose validation
  if (!body.name) {
    //Name or number missing
    console.log(error.name);
    return response.status(400).json({
      error: 'name missing',
    });
  } else if (!body.number) {
    return response.status(400).json({
      error: 'number missing',
    });
  }
*/
  /*{
    return response.status(400).json({
      error: 'name missing',
    });
    return response.status(400).json({
      error: 'number missing',
    });
  }*/

  const person = new Person({
    name: body.name,
    number: body.number,
  })
  //Save new phone number
  person
    .save()
    .then((savedNote) => {
      response.json(savedNote)
    })
    .catch((error) => next(error))
})

//PUT (Change existing person's phone number)
app.put('/api/persons/:id', (request, response, next) => {
  const { name, number } = request.body
  console.log('Changing number for: ' + name)
  console.log('New number: ' + number)
  Person.findById(request.params.id)
    .then((person) => {
      if (!person) {
        return response.status(404).end()
      }

      person.name = name
      person.number = number

      return person.save().then((updatedPerson) => {
        response.json(updatedPerson)
      })
    })
    .catch((error) => next(error))
})

//Show page info
app.get('/info', (request, response, next) => {
  let time = new Date().toString()
  console.log(time)
  //Get all phonebook items and count them
  let personsCount = 0
  Person.find({})
    .then((persons) => {
      personsCount = personsCount + persons.length
      console.log('Phonebook entries: ' + personsCount)

      //Send info AFTER receiving database response
      response.send(`<div>
        <p>Phonebook has info for ${personsCount} people</p>
        <p> ${time} </p>
        </div>`)
    })
    .catch((error) => next(error))

  /*
    //Send info AFTER receiving database response
      response.send(`<div>
    <p>Phonebook has info for ${personsCount} people</p>
    <p> ${time} </p>
    </div>`);
    */
})

//Error handling
const errorHandler = (error, request, response, next) => {
  /*
  Possible errors:
  CastError
  ValidationError (Failed custom validations, missing required fields, schema violations)
  StrictmodeError , not valid currently
  */
  console.error(error.name)
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    //This takes both number length and Regex form errors
    return response.status(400).json({ error: error.message })
  }
  //This goes to default express handler
  next(error)
}

//AFTER ROUTES
const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)
// This for last
app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
