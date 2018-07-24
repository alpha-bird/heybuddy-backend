const utilities = require('../lib/utilities'),
      wrapper = require('co-express'),
      moment = require('moment'),
      _Todo = require('../models/todo');

const todoModule = {
    getTodoList : wrapper(function*( req, res ) {
        var user = req.session.user

        var todolist = yield _Todo.getTodoCreatedBySomeone(user._id)
        res.send({ success : true, todolist : todolist })
    }),
    addTodo : wrapper(function*(req, res) {
        var user = req.session.user
        var data = {
            title : req.body.title,
            description : req.body.description ? req.body.description : '',
            createdTime : moment(Date.now()).utc().format(),
            createdBy : user._id,
            alarmTime : req.body.alarmTime
        }

        var todoObj = new _Todo(data)
        yield todoObj.saveToDataBase()
        res.send({ success : true, todo : todoObj })
    }),
    removeTodo : wrapper(function*(req, res) {
        var todoId = req.body.todoId
        var todoObj = yield _Todo.findOneById(todoId)
        yield todoObj.removeFromDataBase()
        res.send({ success : true })
    })
}

module.exports = todoModule;