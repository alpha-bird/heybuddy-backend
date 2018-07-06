const todoController = require('../controllers/todo.controller'),
      _AuthCheck = require('../auth');

module.exports = ( router ) => {
    router.get('/todos', _AuthCheck, todoController.getTodoList);
    router.post('/todo/create', _AuthCheck, todoController.addTodo);
    router.post('/todo/delete', _AuthCheck, todoController.removeTodo);
}