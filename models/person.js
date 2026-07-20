const mongoose = require('mongoose')

//const password = process.argv[2];
const name = process.argv[3]
const number = process.argv[4]

/*
console.log(password);
console.log(name);
console.log(number);
*/

const url = process.env.MONGODB_URI
console.log('Connecting to ' + url)

mongoose.set('strictQuery', false)
mongoose
  .connect(url, { family: 4 })
  .then((result) => {
    console.log('Connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connecting to MongoDB:', error.message)
  })

//Custom validator for phone number length (min 8 characters)
function numberLengthValidator(val) {
  console.log('Number length: ' + val.length)
  return val.length >= 8
}

//Custom validator for phone number form (regex) xxx-xxxx
/*
RegEx:
/.../ = the beginning and end of the regular expression pattern in languages like JavaScript
\d = Match any single numeric digit from 0 to 9
{number} / {3} = Quantifier for how many times the preceding (\d) element must repeat
{2,3} = Quantifier, atleast 2 and max 3
{7,} = Quantifier, atleast 7 or more
- = Matches the literal hyphen character separating the number blocks
*/
function numberFormValidator(val) {
  //RegExp.test() returns boolean value for given string
  console.log('Given number: ' + val)
  ///\d{2,3}-\d{5,8}/
  ///[0-9]{2,3}-[0-9]{5,10}/
  return /^\d{2,3}-\d{7,}$/.test(val)
}

//All custom validators in array
const numberValidators = [
  {
    validator: numberLengthValidator,
    message: 'Phone number minimum length is 8 digits long',
  },
  {
    validator: numberFormValidator,
    message:
      'Phone number must contain only numbers 0-9 and hyphen: first part must be 2 or 3 digits long, second part atleast 7 digits long',
  },
]

//Person schema with Mongoose inbuilt validation methods
const personSchema = new mongoose.Schema({
  name: {
    type: String,
    minlength: 3,
    required: true,
  },
  number: {
    type: String,
    validate: numberValidators,
    required: true,
  },
})

//Set schema form
personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  },
})

//Create with defined schema
const Person = mongoose.model('Person', personSchema)
const person = new Person({
  name: name,
  number: number,
})

module.exports = mongoose.model('Person', personSchema)
