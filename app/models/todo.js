const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const todoSchema = new Schema({
    title : {
        type : String,
        required : true
    },
    description : {
        type : String,
        default : ''
    },
    createdTime : {
        type : String,
        required : true
    },
    createdBy : {
        type : Schema.Types.ObjectId,
        ref: 'user',
        required : true
    },
    alarmTime : {
        type : String,
        required : true
    }
});

todoSchema.methods.saveToDataBase = function( ) {
    return new Promise((resolve, reject) => {
        this.save(function(err){
            if(err) reject(err);
            else resolve(true);
        })
    });
}

todoSchema.methods.removeFromDataBase = function() {
    return new Promise((resolve, reject) => {
        this.remove(function(err){
            if(err) reject(err);
            else resolve();
        });
    });
}

const todoModel = mongoose.model('todo', todoSchema);

todoModel.getTodoCreatedBySomeone = function( userId ) {
    return new Promise( (resolve, reject) => {
        todoModel.find({ createdBy : userId }, (error, todos) => {
            if(error) reject(error);
            else resolve(todos);
        });
    } );
}

todoModel.findOneById = function( todoId ) {
    return new Promise( (resolve, reject) => {
        todoModel.findById( todoId, (error, todo) => {
            if(error) reject(error);
            else resolve(todo);
        });
    } );
}

module.exports = todoModel;