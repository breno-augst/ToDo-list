const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

// Middleware
function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find(user => user.username === username);

  if (!user) {
    return response.status(404).json( { error: 'User not found' });
  }

    request.user = user;

  return next();
}

// Should be able to create a new user
// Should not be able to create a new user when username already exists
app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const userAlreadyExists = users.find(user => user.username === username);

  if (userAlreadyExists) {
    return response.status(400).json( { error: 'Username already exists'});
  }

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: []
  };

  users.push(user);

  return response.status(201).json(user);

});

// Should be able to list all user's todos
app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.json(user.todos);
});

// Should be able to create a new todo
app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;
  
  const newTodo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  };

  user.todos.push(newTodo);

  return response.status(201).json(newTodo);
});

// Should be able to update a todo
// Should not be able to update a non existing todo
app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;
  const { id } = request.params;

  const todo = user.todos.find(todo => todo.id === id);

 if (!todo){
    return response.status(404).json({ error: 'Todo Not Found' });
  }  

  todo.title = title;
  todo.deadline = new Date(deadline);

  return response.json(todo);
});

// Should be able to mark a todo as done
// Should not be able to mark a non existing todo as done
app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const todo = user.todos.find(todo => todo.id === id);

  if (!todo){
     return response.status(404).json({ error: 'Todo Not Found' });
   }  

  todo.done = true;

  return response.json(todo);

});

// Should be able to delete a todo
// Should not be able to delete a non existing todo
app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const todoIndex = user.todos.findIndex(todo => todo.id === id);

  if (todoIndex === -1) {
    return response.status(404).json({ error: 'ToDo ot Found' });
  } 

  user.todos.splice(todoIndex, 1)

  return response.status(204).json();
});

module.exports = app;
