const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers

  const user = users.find(user => user.username === username)

  if(!user){
    return response.status(404).json({ error: "Customer not found!" })
  }

  request.user = user

  return next()
}

function checkExistsIdTodo(request, response, next){

  const { username } = request.headers

  const { id } = request.params

  const user = users.find(user => user.username === username)

  const userTodo = user.todos.find(idTodo => idTodo.id === id)

  if(!userTodo){
    return response.status(404).json({ error: "Id not found!"})
  }

  request.userTodo = userTodo

  next()
  
}

app.post('/users', (request, response) => {
  const { username, name } = request.body

  const userAlreadyExists = users.some((user) => user.username === username)

  if(userAlreadyExists){
    return response.status(400).json({ error: "Customer already exists!" })
  }

  users.push({
    username,
    name,
    id: uuidv4(),
    todos: []
  })

  const createdUser = users.find(user => user.username === username)

  return response.status(201).json(createdUser)
});

// testar após a criação do todo
app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request
 
  return response.status(201).json(user.todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  
  const { title, done, deadline } = request.body
  
  const { user } = request

  const todoPayload = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  user.todos.push(todoPayload)

  return response.status(201).json(todoPayload)

});

app.put('/todos/:id', checksExistsUserAccount, checkExistsIdTodo, (request, response) => {
  const { title, deadline } = request.body

  const { userTodo } = request

  userTodo.title = title
  userTodo.deadline = new Date(deadline)

  const respBody = {
    title: userTodo.title,
    deadline: userTodo.deadline,
    done: userTodo.done
  }

   return response.status(201).json(respBody)

});

app.patch('/todos/:id/done', checksExistsUserAccount, checkExistsIdTodo, (request, response) => {

  const { userTodo } = request

  userTodo.done = true

  return response.status(201).json(userTodo)

});

app.delete('/todos/:id', checksExistsUserAccount, checkExistsIdTodo, (request, response) => {
  
  const { userTodo } = request
  
  const { user } = request

  const indice = user.todos.indexOf(userTodo)

  user.todos.splice(indice, 1)

  return response.status(204).send()

});

module.exports = app;