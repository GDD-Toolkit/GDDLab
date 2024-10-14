/* -- BACKEND SET UP -- */
const portNumber = 9000;
const path = require("path");
const express = require("express");
const multer = require('multer');
const { MongoClient, ServerApiVersion } = require("mongodb");
const { AssetType, Priority, BugType, bugResponse, requestResponse } = require('./types');

const app = express();
app.set("views", path.resolve(__dirname, "views/templates"));
app.set("view engine", "ejs");
app.use(express.static(__dirname + '/assets'));
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

require("dotenv").config({ path: path.resolve(__dirname, "./.env") });

const uri = process.env.MONGO_DB_URI;
const client = new MongoClient(uri, {
  serverApi: ServerApiVersion.v1,
});

//database and collections
const database = client.db(process.env.MONGO_DB_NAME);
const bugResponses = database.collection(process.env.MONGO_BUG_COLLECTION);
const requestResponses = database.collection(process.env.MONGO_REQUEST_COLLECTION);

/* -- DISPLAYING PAGES -- */
app.get("/", (request, response) => {
    response.render("index", { activeTab: 'home' });
});

app.get("/requestForm", (request, response) => {
    response.render("requestForm", { activeTab: 'requestform' });
});

app.get("/bugForm", (request, response) => {
    response.render("bugForm", { activeTab: 'bugform' });
});

app.get("/schedule", (request, response) => {
    response.render("index", { activeTab: 'schedule' });
});

/* -- BACKEND STUFF FOR PAGES -- */
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/'); // Directory where files will be stored
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + '-' + file.originalname); // Rename file to avoid conflicts
    }
  });
  
const upload = multer({ storage: storage });

app.post("/submitBug", upload.single('file'), async (req, res) => {
    try {
      await client.connect();
      // Grab form data
      const { name, email, module, location, description, priority, due_date } = req.body;
  
      // Map to bugResponse structure
      const newBugResponse = {
        name: name || '',
        email: email || '',
        moduleTeam: module || '',
        bugType: BugType.TOOLKIT, // Assuming it's from toolkit for now
        bugLocation: location || '',
        bugMedia: req.file ? req.file.path : null, // Store file path
        bugDesc: description || '',
        priority: priority || Priority.NA,
        targetDate: due_date ? new Date(due_date) : new Date(),
      };
  
      // Insert the bug response into MongoDB
      await bugResponses.insertOne(newBugResponse);
  
      // Redirect or send a success message
      res.send("Bug report submitted successfully!");
      console.log(newBugResponse);
    } catch (error) {
      console.error("Error submitting bug report:", error);
      res.status(500).send("Error submitting bug report.");
    } finally {
      await client.close();
    }
  });
/* -- KEEP THIS AT BOTTOM -- */
console.log(`Web server started and running at http://localhost:${portNumber}`);
app.listen(portNumber);