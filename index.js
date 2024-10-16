/* -- BACKEND SET UP -- */
const portNumber = 8000;
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
//Request Form Backend
app.post("/submit", async(request, response) => {
    const name = request.body.name;
    const email = request.body.email;
    const moduleTeam = request.body.moduleTeam;
    if(request.body.assetType == 'CONTENT'){
        assetType = AssetType.CONTENT;
    } else if(request.body.assetType == 'FEATURE'){
        assetType = AssetType.FEATURE;
    } else {
        assetType = AssetType.NA;
    }
    const assetLocation = request.body.assetLocation;
    const assetTitle = request.body.assetTitle;
    const assetMedia = request.body.bugMedia;
    const assetDesc = request.body.assetDesc;
    if(request.body.priority == 'LOW'){
        priority = Priority.LOW;
    } else if(request.body.priority == 'MEDIUM'){
        priority = Priority.MEDIUM;
    } else if(request.body.priority == 'HIGH'){
        priority = Priority.HIGH;
    } else {
        priority = Priority.NA;
    }
    const priority = request.body.priority;
    const targetDate = new Date(request.body.year, request.body.month, request.body.day);
    
    try {
        await client.connect();
    
        const requestReponse = {
            name: name,
            email: email,
            moduleTeam: moduleTeam,
            assetType: assetType,
            assetLocation: assetLocation,
            assetTitle: assetTitle,
            assetMedia: assetMedia,
            assetDesc: assetDesc,
            priority: priority,
            targetDate: targetDate
        };
    
        await requestReponses.insertOne(requestResponse);
    } catch(e){
        console.error(e);
    } finally {
        await client.close();
    }
    });

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/'); // Directory where files will be stored
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + '-' + file.originalname); // Rename file to avoid conflicts
    }
  });
  
const upload = multer({ storage: storage });

app.post("/submitBug", upload.single('bugMedia'), async (req, res) => {
    try {
      await client.connect();
      // Grab form data
      const { name, email, moduleTeam, bugType, bugLocation, bugGoogleDrive, bugDesc, priority, month, day, year } = req.body;
  
      // Map to bugResponse structure
      const newBugResponse = {
        name: name || '',
        email: email || '',
        moduleTeam: moduleTeam || '',
        bugType: bugType === 'TOOL' ? BugType.TOOL : BugType.TOOLKIT,
        bugLocation: bugLocation || '',
        bugMedia: req.file ? req.file.path : null, // Store file path
        bugGoogleDrive: bugGoogleDrive || '',
        bugDesc: bugDesc || '',
        priority: priority || Priority.NA,
        targetDate: month && day && year ? new Date(year, month - 1, day) : new Date(),
      };

      console.log(newBugResponse);
   
      // Insert the bug response into MongoDB
      await bugResponses.insertOne(newBugResponse);
  
      // Redirect or send a success message -- need to change after creating confirmation page
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
