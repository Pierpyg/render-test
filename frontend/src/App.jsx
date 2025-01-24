/**
 * Exercises 2.6-2.17
 */

import { useState, useEffect } from 'react';
import personService from './services/persons';
import Persons from "./components/Persons";
import PersonForm from "./components/PersonForm";
import Filter from './components/Filter';
import './App.css';

const Notification = ({ message, type }) => {
  if (!message) {
    return null;
  }

  const notificationClass = type === 'added' ? 'addedPerson' : 'deletedPerson';

  return (
    <div className={notificationClass}>
      {message}
    </div>
  );
};

const App = () => {
  const [persons, setPersons] = useState([]);
  const [newName, setNewName] = useState('');
  const [newNumber, setNewNumber] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [popupMessage, setPopupMessage] = useState(null);

  useEffect(() => {
    personService
      .getAll()
      .then(response => {
        console.log('Fetched persons:', response.data)
        setPersons(response.data);
      });
  }, []);

  const addPerson = (event) => {
    event.preventDefault();

    const existingPerson = persons.find(person => person.name === newName);

    if (existingPerson) {
      if (window.confirm(`${newName} is already added to phonebook, replace the old number with a new one?`)) {
        const updatedPerson = { ...existingPerson, number: newNumber };

        personService
          .update(existingPerson.id, updatedPerson)
          .then(response => {
            setPersons(persons.map(person =>
              person.id !== existingPerson.id ? person : response.data
            ));
            setPopupMessage({ message: `Updated ${newName}'s number.`, type: 'added' });
            setTimeout(() => setPopupMessage(null), 5000);
            setNewName('');
            setNewNumber('');
          })
          .catch(() => {
            setPopupMessage({ message: `The information for ${newName} could not be updated on the server.`, type: 'deleted' });
            setTimeout(() => setPopupMessage(null), 5000);
          });
      }
    } else {
      const personObject = {
        name: newName,
        number: newNumber,
        
      };

      personService
        .create(personObject)
        .then(response => {
          console.log('Added person:', response.data)
          setPersons(persons.concat(response.data));
          setPopupMessage({ message: `Added ${newName}.`, type: 'added' });
          setTimeout(() => setPopupMessage(null), 5000);
          setNewName('');
          setNewNumber('');
        })
        .catch(error => {
          if (error.response && error.response.data.error) {
            setPopupMessage({ 
              message: error.response.data.error, 
              type: 'error' 
            });
          } else {
            setPopupMessage({ 
              message: 'An unexpected error occurred.', 
              type: 'error' 
            });
          }
          setTimeout(() => setPopupMessage(null), 5000);
        });
    }
  };

  const deletePerson = (id, name) => {
    console.log(`Attempting to delete person with ID: ${id}, Name: ${name}`)
    if (window.confirm(`Delete ${name}?`)) {
      personService
        .delete(id)
        .then(() => {
          console.log(`Successfully deleted person with ID: ${id}`)
          setPersons(persons.filter(person => person.id !== id));
          setPopupMessage({ message: `Deleted ${name}.`, type: 'deleted' });
          setTimeout(() => setPopupMessage(null), 5000);
        })
        .catch(error => {
          console.error(`Error deleting person with ID: ${id}`, error)
          setPopupMessage({ message: `Information of '${name}' has already been removed from server`, type: 'deleted' });
          setTimeout(() => setPopupMessage(null), 5000);
          setPersons(persons.filter(person => person.id !== id));
        });
    }
  };

  const filteredPersons = persons.filter(person =>
    person.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <h1>Phonebook</h1>
      <Notification message={popupMessage?.message} type={popupMessage?.type} />
      <Filter searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      <h2>add a new</h2>
      <PersonForm
        addPerson={addPerson}
        newName={newName}
        setNewName={setNewName}
        newNumber={newNumber}
        setNewNumber={setNewNumber}
      />
      <h2>Numbers</h2>
      <Persons
        persons={searchTerm === '' ? persons : filteredPersons}
        deletePerson={deletePerson}
      />
      <br /><br /><br />
      <div>debug: {newName}</div>
    </div>
  );
};

export default App;
