/* -- BACKEND SET UP -- */
const portNumber = 8000;
const path = require("path");
const express = require("express");
const { MongoClient, ServerApiVersion } = require("mongodb");
const { AssetType, Priority, BugType, bugResponse, requestResponse } = require('./types');
const fs = require("fs"); //for reading files

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
//home page
app.get("/", (request, response) => {
    response.render("index", { activeTab: 'home' });
});

//module pages
app.get("/infrastructure-and-interface", (request, response) => {
  const filePath = path.join(__dirname, "assets/moduleGroupList");
  const moduleGroupPath = path.join(filePath, 'infrastructure.txt');
  const fileContent = fs.readFileSync(moduleGroupPath, "utf-8");

  const lines = fileContent.split("\n").map(line => line.trim());

  // Extract the meeting time (first line) and team members (remaining lines)
  const meetingTime = lines[0]; // "Mondays at 2:30 pm to 3:30 pm"
  const teamMembers = lines.slice(1); // Array of team members

  response.render("module-pages/infrastructure", {
    meetingTime: meetingTime,
    teamMembers: teamMembers,
  });
})

// about pages
app.get("/about-page", (request, response) => {
  response.render("About", {activeTab: 'about', activeFooterTab: 'About'});
})

app.get("/2023-cohort", (request, response) => {
  response.render("cohort-pages/2023cohort", {activeTab: 'home', activeFooterTab: '2023'});
})

//form pages
app.get("/requestForm", (request, response) => {
    response.render("requestForm", { activeTab: 'requestform' });
});

app.get("/bugForm", (request, response) => {
    response.render("bugForm", { activeTab: 'bugform' });
});

//confirmation page
app.get("/confirmation-page", (request, response) => {
    response.render('confirmationPage');
});

/* -- BACKEND STUFF FOR PAGES -- */
//Request Form Backend
app.post("/confirmation-page", async (request, response) => {
    const name = request.body.name;
    const email = request.body.email;
    const moduleTeam = request.body.moduleTeam;
    const assetLocation = request.body.assetLocation;
    const assetTitle = request.body.assetTitle;
    const assetGoogleDrive = request.body.assetGoogleDrive;
    const assetDesc = request.body.assetDesc;
    const assetType = request.body.assetType === 'CONTENT'? AssetType.CONTENT : AssetType.FEATURE;
    const priority = Priority[request.body.priority.toUpperCase()] || Priority.NA;
    const targetDate = new Date(request.body.year, request.body.month, request.body.day);

    try {
        await client.connect();
    
        const requestResponse = {
            name: name,
            email: email,
            moduleTeam: moduleTeam,
            assetType: assetType,
            assetLocation: assetLocation,
            assetTitle: assetTitle,
            assetGoogleDrive: assetGoogleDrive,
            assetDesc: assetDesc,
            priority: priority,
            targetDate: targetDate
        };
        console.log(requestResponse);

       await requestResponses.insertOne(requestResponse);
    } catch(e){
        console.error(e);
    } finally {
        await client.close();
    }
    });

app.post("/confirmation-page", async (req, res) => {
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
