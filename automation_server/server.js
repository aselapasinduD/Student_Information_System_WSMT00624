require('dotenv').config();
const express = require("express");
const api = require("./middleware/api");
const auth = require("./controllers/helper/auth");

const port = 3002;

const app = express();
app.use(express.json());

app.use(auth);

app.use("/api", api);

app.get("*",(req, res) =>{
	res.send("404 Error Not Found Any API");
});

app.listen(port,() => console.log(`Server Is Running on: http://localhost:${port} `));
