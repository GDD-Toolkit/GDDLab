// ENUMS
const AssetType = {
    NA: 'NA',
    CONTENT: 'CONTENT',
    FEATURE: 'FEATURE',
};

const Priority = { 
     NA: 'NA',
     LOW: 'LOW',
     MEDIUM: 'MEDIUM',
     HIGH: 'HIGH'
}

const BugType = {
	TOOLKIT: 'TOOLKIT',
	TOOL: 'TOOL'
}

// Structure of responses
const requestResponse = {
    name: '', // string
    email: '', // string
    moduleTeam: '', // string
    assetType: AssetType.NA,
    assetLocation: '', // string
    assetTitle: '', // string
    assetMedia: null, // any type, initially set to null
    assetDesc: '', // string
    priority: Priority.NA,
    targetDate: new Date(), // Date
};

const bugResponse = {
    name: '', // string
    email: '', // string
    moduleTeam: '', // string
    bugType: BugType.TOOLKIT || BugType.TOOL,
    bugLocation: '', // string
    bugMedia: null, // any type, initially set to null
    bugDesc: '', // string
    priority: Priority.NA,
    targetDate: new Date(), // Date
};

module.exports = {
    AssetType,
    BugType,
    Priority,
    requestResponse,
    bugResponse
}