const express = require('express');
var jwt = require('jsonwebtoken');
// npm install jsonwebtoken
const bcrypt = require('bcrypt');
const app = express();
const mongoose=require('mongoose');
const User = require('./User')
const { body, validationResult } = require('express-validator');


mongoose.connect('mongodb://localhost:27017/node',{
    useNewUrlParser:true,
    useUnifiedTopology:true
}).then(()=>{
    console.log("connected to database")
}).catch(()=>{
    console.log("error connecting to database")
})



var cookieParser = require('cookie-parser');
app.use(cookieParser());
app.set('view engine', 'ejs');
app.use(express.urlencoded({extended:true}))
app.listen(4000,()=>{
    console.log('listening on port 4000')
})
app.get('/getData',(req,res)=>{
    res.render('home.ejs',{rand:99999999999})
})
app.get('/',(req,res)=>{
    res.render('hello.ejs')
})
app.get('/userData',(req,res)=>{
    // req.query
    const {name} =req.query;
    res.send(name)
})
app.get('/qwerty/:id',(req,res)=>{
    const id=req.params.id;
    res.send(id)
})
app.get('/signup',(req,res)=>{
    res.render('signup.ejs');
})
app.post('/q', body('name').isLength({ min: 5 }),async (req,res)=>{
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.send('wrong')
       }
       res.cookie('user', req.body.name);
       const {name}=req.body;
       const {password} = req.body
       const salt=await bcrypt.genSalt(10)
       
       const securedPassword=await bcrypt.hash(password,salt)
       User.find({username:name}).then((data)=>{
        if(data.length==0) {{
            User.insertMany([{username:name,password:securedPassword}]).then((data)=>{
          
                res.render('signin.ejs')
            })
     
        }}
        else{
            res.send('user already exist')
        }
           
       })
      

})
app.get('/fetch',(req,res)=>{
    User.find({}).then((data)=>{
        res.send(data)
    })
})
app.get('/signin',(req,res)=>{
    res.render('signin.ejs')
})
app.post('/login',
   async (req, res) => {
    let success = false;
    // If there are errors, return Bad request and the errors
   
  
    const { name, password } = req.body;
    try {
      let user = await User.findOne({ username:name });
     
      if (!user) {
        success = false
        return res.status(400).json({ error: "Please try to login with correct credentials" });
      }
  
      const passwordCompare = await bcrypt.compare(password, user.password);
      if (!passwordCompare) {
        success = false
        return res.status(400).json({ success, error: "Please try to login with correct credentials"+user.password });
      }
  
      const data = {
        user: {
          id: user.id
        }
      }
      const token = jwt.sign(data, 'secret')
      
	// console.log("token:", token)

	// // set the cookie as the token string, with a similar max age as the token
	// // here, the max age is in milliseconds, so we multiply by 1000
	res.cookie("token", token)
    res.redirect('/dashboard')
    // console.log(res.cookie('token'))
    // res.send(res.cookie('token'))
  
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal Server Error");
    }
  
  
  });
  const fetchuser =async (req, res, next) => {
    const token = await req.cookies.token
    if (!token) {
        res.status(401).send({ error: "Please authenticate using a valid token1" })
    }
    try {
        // res.send(token)
        const data = jwt.verify(token, 'secret');
        req.user = data.user;
        // res.send(data)
        userId = req.user.id;
        // const user = await User.findById(userId).select("-password")
        next();
    } catch (error) {
        res.status(401).send({ error: "Please authenticate using a valid token" })
    }

}
app.get('/dashboard', fetchuser,  async (req, res) => {

    res.send("hello ")
  })  
// database =>mongoose
// mongoose=>file.js=>schema,model
// index.js<=import
// model->use to perform crud operations
// db create , connect db