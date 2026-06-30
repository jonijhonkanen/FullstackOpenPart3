const express = require('express');
//Middleware Morgan
const morgan = require('morgan');
const cors = require('cors');
const app = express();
app.use(express.static('dist'));
app.use(express.json());
app.use(cors());
//Use this for static Frontend build file
app.use(express.static('dist'));

//Token for POST request data
morgan.token('post_data', function (req, res) {
  //console.log(req.body); //undefined when GET
  //Cannot convert undefined or null to object
  //return in string format
  return req.body && req.body.length != 0 ? JSON.stringify(req.body) : '-';
  //return Object.entries(req.body).length != 0 ? JSON.stringify(req.body) : '-';
});

//app.use(morgan('tiny'));
//':method :url :status :res[content-length] - :response-time ms :post_data'
app.use(
  morgan(
    ':method :url :status :res[content-length] - :response-time ms :post_data',
  ),
);
//Random id generation
const generateId = () => {
  //0 <= x < 1
  return Math.floor(Math.random() * 6000);
};

let persons = [
  { id: 1, name: 'Arto Hellas', number: '040-6657935' },
  { id: 2, name: 'Jani Tapiola', number: '050-7157732' },
  { id: 3, name: 'Liisa Kario', number: '041-66989132' },
];

//LOCALHOST
app.get('/', (request, response) => {
  response.send('<h1>Hello World!</h1>');
});

//All persons
app.get('/api/persons', (request, response) => {
  response.json(persons);
});

//GET by ID
app.get('/api/persons/:id', (request, response) => {
  //console.log('get by id');
  //const id = request.params.id;
  const id = Number(request.params.id);
  const person = persons.find((person) => person.id === id);
  if (person) {
    response.json(person);
  } else {
    response.status(404).end();
  }
});

//DELETE
app.delete('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id);
  persons = persons.filter((person) => person.id !== id);

  response.status(204).end();
});

//POST
app.post('/api/persons', (request, response) => {
  //Content from body
  const body = request.body;
  //Id generated
  const id = generateId();
  //console.log(id);
  //console.log(body.name);
  //console.log(body.number);

  //Name or number missing
  if (!body.name) {
    return response.status(400).json({
      error: 'name missing',
    });
  } else if (!body.number) {
    return response.status(400).json({
      error: 'number missing',
    });
  }

  //Name not unique
  if (persons.find((person) => person.name === body.name)) {
    return response.status(400).json({
      error: 'name must be unique',
    });
  }

  //Form new person note
  const person = {
    id: id,
    name: body.name,
    number: body.number,
  };

  //Add person to array on server
  persons = persons.concat(person);

  //Response with added person
  response.json(person);
});

//Show page info
app.get('/info', (request, response) => {
  let time = new Date().toString();
  console.log(time);

  response.send(`<div>
    <p>Phonebook has info for ${persons.length} people</p>
    <p> ${time} </p>
    </div>`);
});

//AFTER ROUTES
const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' });
};

app.use(unknownEndpoint);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
