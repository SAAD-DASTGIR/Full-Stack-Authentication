import  express  from 'express'
import { Low } from 'lowdb'
import { JSONFile } from 'lowdb/node'
import * as url from 'url';
import bcrypt from 'bcryptjs';
import * as jwtJsDecode from 'jwt-js-decode';
import base64url from "base64url";
import SimpleWebAuthnServer from '@simplewebauthn/server';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

const app = express()
app.use(express.json())

const adapter = new JSONFile(__dirname + '/auth.json');
const db = new Low(adapter);
await db.read();
db.data ||= { users: [] }

const rpID = "localhost";
const protocol = "http";
const port = 5050;
const expectedOrigin = `${protocol}://${rpID}:${port}`;

app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));

const finduser=(email)=>{
  const result=db.data.users.filter(u=>u.email=email)
  if(result==null||result.length==0){
    return null;
  }
  return result[0];
}
app.post("/auth/login",(req,res)=>{
  const user=finduser(req.body.email);
  if(user==null){
    res.status(400).send("invalid email or password");
    return;
  }
  else{
    const passwordisvalid=bcrypt.compareSync(req.body.password,user.password);
    if(!passwordisvalid){
      res.status(400).send("invalid email or password");
      return;
    }
    else{
      res.status(200).send({
        ok:true,
        message:"User logged in successfully"
      })
    }
  }
})
app.post("/auth/register",(req,res)=>{
  const hashedPassword=bcrypt.hashSync(req.body.password,10);
  const user={
    name:req.body.name,
    email:req.body.email,
    password:hashedPassword
  }
  const userfound=finduser(user.email)
  if(userfound){
    res.status(400).send("User already exists")
    return;
  }
  else{
    db.data.users.push(user);
    db.write();
    res.status(200).send("User created successfully")
  }
})



app.get("*", (req, res) => {
    res.sendFile(__dirname + "/public/index.html"); 
});

app.listen(port, () => {
  console.log(`App listening on port ${port}`)
});