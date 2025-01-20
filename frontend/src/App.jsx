/**
 * Exercises 2.6-2.17
 */

import { useState, useEffect } from 'react';
import personService from './services/persons';
import Persons from "./components/Persons";
import PersonForm from "./components/PersonForm";
import Filter from './components/filter';
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
        id: String(persons.length + 1),
      };

      personService
        .create(personObject)
        .then(response => {
          setPersons(persons.concat(response.data));
          setPopupMessage({ message: `Added ${newName}.`, type: 'added' });
          setTimeout(() => setPopupMessage(null), 5000);
          setNewName('');
          setNewNumber('');
        })
        .catch(() => {
          setPopupMessage({ message: 'Failed to add person to the server.', type: 'deleted' });
          setTimeout(() => setPopupMessage(null), 5000);
        });
    }
  };

  const deletePerson = (id, name) => {
    if (window.confirm(`Delete ${name}?`)) {
      personService
        .delete(id)
        .then(() => {
          setPersons(persons.filter(person => person.id !== id));
          setPopupMessage({ message: `Deleted ${name}.`, type: 'deleted' });
          setTimeout(() => setPopupMessage(null), 5000);
        })
        .catch(() => {
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
