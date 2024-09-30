const portNumber = 5000;
const path = require("path");
const express = require("express");
const { MongoClient, ServerApiVersion } = require("mongodb");

const app = express();
app.set("views", path.resolve(__dirname, "views/templates"));
app.set("view engine", "ejs");
app.use(express.static(__dirname + '/assets'));
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

require("dotenv").config({ path: path.resolve(__dirname, "./.env") });

app.get("/", (request, response) => {
    response.render("index", { activeTab: 'home' });
});

app.get("/requestForm", (request, response) => {
    response.render("index", { activeTab: 'requestform' });
});

app.get("/bugForm", (request, response) => {
    response.render("index", { activeTab: 'bugform' });
});

app.get("/schedule", (request, response) => {
    response.render("index", { activeTab: 'schedule' });
});






console.log(`Web server started and running at http://localhost:${portNumber}`);
app.listen(portNumber);