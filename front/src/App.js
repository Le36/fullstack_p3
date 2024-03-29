import {useEffect, useState} from 'react'
import personService from "./services/persons"
import Notification from "./components/Notification";
import './index.css'

const Persons = ({newFilter, persons, remove}) => {
    return (
        <>
            <ul>
                {persons.filter(person => {
                    return person.name.toLowerCase().includes(newFilter.toLowerCase())
                }).map(({id, name, number}) =>
                    <li key={name}>{name} {number}
                        <button onClick={() => remove({id: id, name: name})}>delete</button>
                    </li>
                )}
            </ul>
        </>
    )
}

const PersonForm = ({onChange, onChange1, onSubmit, value, value1}) => {
    return <form onSubmit={onSubmit}>
        <div>
            name: <input value={value} onChange={onChange}/>
        </div>
        <div>
            number: <input value={value1} onChange={onChange1}/>
        </div>
        <div>
            <button type="submit">add</button>
        </div>
    </form>;
}


const Filter = ({onChange, value}) => {
    return <form>
        <div>
            filter shown with: <input value={value} onChange={onChange}/>
        </div>
    </form>;
}


const App = () => {
    const [persons, setPersons] = useState([])

    useEffect(() => {
        personService.getAll().then(initialPersons => {
            setPersons(initialPersons)
        })
    }, [])

    const [newName, setNewName] = useState('')
    const [newNumber, setNewNumber] = useState('')
    const [newFilter, setNewFilter] = useState('')
    const [errorMessage, setErrorMessage] = useState(null)

    const addNew = (event) => {
        event.preventDefault()
        const personObject = {
            name: newName,
            number: newNumber
        }
        if (persons.map(person => person.name).includes(newName)) {
            if (window.confirm(`${newName} is already in phonebook, replace the old number with a new one?`)) {
                const id = persons.find(person => person.name === newName).id
                personService.update(id, personObject)
                    .then(returnedPerson => {
                        setPersons(persons.map(person => person.id !== id ? person : returnedPerson))
                        setErrorMessage(`Updated ${newName} number successfully`)
                    }).catch(() => {
                    setErrorMessage(`error: Cannot update ${newName}, their data has been deleted already`)
                })
            }

        } else {
            personService.create(personObject).then(returnedPerson => {
                setPersons(persons.concat(returnedPerson))
                setErrorMessage(`Added ${returnedPerson.name} successfully`)
            }).catch(error => {
                setErrorMessage(`error: ${error.response.data.error}`)
            })
        }
        setNewName("")
        setNewNumber("")
        setTimeout(() => {
            setErrorMessage(null)
        }, 4000)
    }

    const removePerson = ({id, name}) => {
        if (window.confirm(`Delete ${name}?`))
            personService.remove(id).then(() => {
                setPersons(persons.filter(person => person.id !== id))
                setErrorMessage(`Deleted ${name} successfully`)
            }).catch(() => {
                setErrorMessage(`error: was already deleted`)
            })
        setTimeout(() => {
            setErrorMessage(null)
        }, 4000)
    }


    const handleNameChange = ({target}) => setNewName(target.value)
    const handleNumberChange = ({target}) => setNewNumber(target.value)
    const handleFilterChange = ({target}) => setNewFilter(target.value)

    return (
        <div>
            <h2>Phonebook</h2>
            <Notification message={errorMessage}/>
            <Filter value={newFilter} onChange={handleFilterChange}/>
            <h2>Add a new</h2>
            <PersonForm onSubmit={addNew} value={newName} onChange={handleNameChange} value1={newNumber}
                        onChange1={handleNumberChange}/>
            <h2>Numbers</h2>
            <Persons persons={persons} newFilter={newFilter} remove={removePerson}></Persons>
        </div>
    )

}

export default App