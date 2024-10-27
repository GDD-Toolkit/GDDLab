/* -- BACKEND SET UP -- */
const portNumber = 8000;
const path = require("path");
const express = require("express");
const session = require("express-session");
const { MongoClient, ServerApiVersion } = require("mongodb");
const {
  AssetType,
  Priority,
  BugType,
  bugResponse,
  requestResponse,
} = require("./types");
const fs = require("fs"); //for reading files

const app = express();
app.set("views", path.resolve(__dirname, "views/templates"));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/assets"));
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
const requestResponses = database.collection(
  process.env.MONGO_REQUEST_COLLECTION
);

/* -- DISPLAYING PAGES -- */
//home page
app.get("/", (request, response) => {
  response.render("index", { activeTab: "home" });
});

//module pages
app.get("/infrastructure-and-interface", (request, response) => {
  const filePath = path.join(__dirname, "assets/moduleGroupList");
  const moduleGroupPath = path.join(filePath, "infrastructure.txt");
  const fileContent = fs.readFileSync(moduleGroupPath, "utf-8");

  const lines = fileContent.split("\n").map((line) => line.trim());

  // Extract the meeting time (first line) and team members (remaining lines)
  const meetingTime = lines[0]; // "Mondays at 2:30 pm to 3:30 pm"
  const teamMembers = lines.slice(1); // Array of team members

  response.render("module-pages/infrastructure", {
    meetingTime: meetingTime,
    teamMembers: teamMembers,
  });
});

// about pages
app.get("/about-page", (request, response) => {
  response.render("About", { activeTab: "about", activeFooterTab: "About" });
});

app.get("/2020-cohort", (request, response) => {
  response.render("cohort-pages/2020cohort", {
    activeTab: "about",
    activeFooterTab: "2020",
  });
});

app.get("/2021-cohort", (request, response) => {
  response.render("cohort-pages/2021cohort", {
    activeTab: "about",
    activeFooterTab: "2021",
  });
});

app.get("/2022-cohort", (request, response) => {
  response.render("cohort-pages/2022cohort", {
    activeTab: "about",
    activeFooterTab: "2022",
  });
});

app.get("/2023-cohort", (request, response) => {
  response.render("cohort-pages/2023cohort", {
    activeTab: "about",
    activeFooterTab: "2023",
  });
});

app.get("/2024-cohort", (request, response) => {
  response.render("cohort-pages/2024cohort", {
    activeTab: "about",
    activeFooterTab: "2024",
  });
});

//form pages
app.get("/requestForm", (request, response) => {
  response.render("requestForm", { activeTab: "requestform" });
});

app.get("/bugForm", (request, response) => {
  response.render("bugForm", { activeTab: "bugform" });
});

//confirmation page
app.get("/confirmation-page", (request, response) => {
  const email = request.query.email;
  const formType = request.query.formType === 'bugForm' ? 'Bug Form' : 'Request Form';
  response.render("confirmationPage", { activeTab: "none", email: email, formType: formType });
});

/* -- BACKEND STUFF FOR PAGES -- */
//Form Backend
app.post("/confirmation-page", async (req, res) => {
  const { formType, name, email, moduleTeam } = req.body;

  // Establish default redirect with query params
  const redirectUrl = `/confirmation-page?formType=${encodeURIComponent(formType)}&email=${encodeURIComponent(email)}`;

  try {
    await client.connect();

    // Common fields across forms
    const commonData = {
      name: name || "",
      email: email || "",
      moduleTeam: moduleTeam || "",
      priority: Priority[req.body.priority?.toUpperCase()] || Priority.NA,
      targetDate: req.body.year && req.body.month && req.body.day
        ? new Date(req.body.year, req.body.month - 1, req.body.day)
        : new Date(),
    };

    if (formType === "requestForm") {
      const requestResponse = {
        ...commonData,
        assetType: req.body.assetType === "CONTENT" ? AssetType.CONTENT : AssetType.FEATURE,
        assetLocation: req.body.assetLocation || "",
        assetTitle: req.body.assetTitle || "",
        assetGoogleDrive: req.body.assetGoogleDrive || "",
        assetDesc: req.body.assetDesc || "",
      };

      await requestResponses.insertOne(requestResponse);
    } else if (formType === "bugForm") {
      const bugResponse = {
        ...commonData,
        bugType: req.body.bugType === "TOOL" ? BugType.TOOL : BugType.TOOLKIT,
        bugLocation: req.body.bugLocation || "",
        bugGoogleDrive: req.body.bugGoogleDrive || "",
        bugDesc: req.body.bugDesc || "",
      };

      await bugResponses.insertOne(bugResponse);
    }

    res.redirect(redirectUrl);

  } catch (error) {
    console.error("Error handling form submission:", error);
    res.status(500).send("An error occurred while processing your request.");
  } finally {
    await client.close();
  }
});

//clear collections
async function clearBugResponsesCollection() {
  try {
    await client.connect();
    bugResponses.deleteMany({});
  } catch (error) {
    console.error("Something went wrong with deleting documents in the BugResponses collection");
  } finally {
    await client.close();
  }
}

async function clearRequestResponsesCollection() {
  try {
    await client.connect();
    bugResponses.deleteMany({});
  } catch (error) {
    console.error("Something went wrong with deleting documents in the RequestResponses collection");
  } finally {
    await client.close();
  }
}

/* -- KEEP THIS AT BOTTOM -- */
console.log(`Web server started and running at http://localhost:${portNumber}`);
app.listen(portNumber);
