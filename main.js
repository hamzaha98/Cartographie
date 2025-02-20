const { error } = require("console")
var express =require("express")
var mysql =require("mysql")
var app =express()
app.use(express.json())

const con=mysql.createConnection({
    host:'localhost',
    user:'root',
    password: 'Raja1998.',
    database: 'StageDb'
})

con.connect((err)=>{
    if(err){
        console.log("Connexion réussi !!")
    }
})