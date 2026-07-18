const mongoose = require('mongoose');

/*
if (process.argv.length < 3) {
  console.log('give password as argument');
  process.exit(1);
}
*/

//const password = process.argv[2];
const name = process.argv[3];
const number = process.argv[4];

/*
console.log(password);
console.log(name);
console.log(number);
*/

const url = process.env.MONGODB_URI;
console.log('Connecting to ' + url);

mongoose.set('strictQuery', false);
mongoose
  .connect(url, { family: 4 })
  .then((result) => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.log('error connecting to MongoDB:', error.message);
  });

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
});

personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

const Person = mongoose.model('Person', personSchema);

const person = new Person({
  name: name,
  number: number,
});

//Only send password
/*
if (process.argv.length > 3) {
  person.save().then((result) => {
    //console.log(result);
    console.log(`Added ${result.name} number ${result.number} to phonebook`);
    mongoose.connection.close();
  });
} else {
  //Log each phonenumber
  Person.find({}).then((persons) => {
    persons.forEach((person) => {
      console.log(`${person.name} ${person.number}`);
    });
    mongoose.connection.close();
  });
}
*/
module.exports = mongoose.model('Person', personSchema);
