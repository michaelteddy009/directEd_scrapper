
const { connect } = require("puppeteer-real-browser")
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');


function scrapCost(doc)
{
    try {
        const main = doc.querySelector('#payments').outerHTML
        const dom = new JSDOM(main);
        const document = dom.window.document;
        
        let costs = {}
        let payments =  document.querySelectorAll('li');
        payments.forEach((payment, index) => {
            let val = []
            let statusEl = payment.querySelectorAll('span')
            statusEl.forEach(s => val.push(s.textContent.replace(/^\n+|\n+$/g, '')))
            costs[val[0]] = val[1];
        });
    
        return costs;
    } catch (error) {
        return {}
    }
}

function scrapLicenses(doc)
{
    try {
        const main = doc.querySelector('.licenses-section').outerHTML;
        const dom = new JSDOM(main);
        const document = dom.window.document;
        
        let licenses = []
        let licensesCards =  document.querySelectorAll('.license-card');
        licensesCards.forEach((card, index) => {
            let cardDetails = card.querySelectorAll('.section')
            
            let c = {}
            cardDetails.forEach((section, index1) => {
                if(index1 == 1 || index1 == 2) {
                    let val = []
                    let statusEl = section.querySelectorAll('span')
                    statusEl.forEach(s => val.push(s.textContent.replace(/^\n+|\n+$/g, '')))
                    c[val[0]] = val[1]
                } else if(index1 == 3) {
                    let val = []
                    let statusEl = section.querySelectorAll('.content > span')
                    statusEl.forEach(s => val.push(s.textContent.replace(/^\n+|\n+$/g, '')))
                    c['status'] = val[0];
                    c['disciplinary'] = val[1]
                }
            });
            licenses.push(c)
        });
    
        return licenses;
    } catch (error) {
        return [];
    }
}

function scrapeUsername(document) {
    try {
        return document.querySelector('.lawyer-name').textContent
    } catch (error) {
        return ''
    }
}

function scrapAddress(document) {
    try {
        let result = document.querySelector('.contact-address').textContent
        return result.replace(/^\n+|\n+$/g, '')
    } catch (error) {
        return ''
    }
}

function scrapPhones(document) {
    try {
        let result = document.querySelector('.contact-phones').textContent
        return result.replace(/^\n+|\n+$/g, '')
    } catch (error) {
        
    }
}

function scrapWebsite(document) {
    try {
        let result = document.querySelector('.contact-website').textContent
        return result.replace(/^\n+|\n+$/g, '')
    } catch (error) {
        return '';
    }
}



async function getPageDocument(url)
{
    const { browser, page } = await connect({

        headless: false,

        args: [],

        customConfig: {},

        turnstile: true,

        connectOption: {},

        disableXvfb: false,
        ignoreAllFlags: false
        // proxy:{
        //     host:'<proxy-host>',
        //     port:'<proxy-port>',
        //     username:'<proxy-username>',
        //     password:'<proxy-password>'
        // }

    })

    let res = await page.goto(url)
    let contentUnit8Array = await res.content();
    
    const uint8Array = new Uint8Array(contentUnit8Array); // Example Uint8Array
    const decoder = new TextDecoder('utf-8'); // Specify the encoding
    
    let htmlString = decoder.decode(uint8Array);
    browser.close();
    
    // Create a new DOMParser instance
    const dom = new JSDOM(htmlString);
    return dom.window.document;
}

function createFile(filePath, content) {

    // Ensure directory exists
    const dirPath = path.dirname(filePath);

    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }

    // Write the content to the file
    fs.writeFileSync(filePath, content, (err) => {
        if (err) {
            console.error('Error writing to the file:', err);
            return false;
        } else {
            console.log('File has been written successfully!');
            return true;
        }
    });
}

function createJsonFileIfNotExists(directory, fileName, defaultData = {}) {
    const filePath = path.join(directory, fileName);

    // Check if the directory exists
    if (!fs.existsSync(directory)) {
        fs.mkdirSync(directory, { recursive: true }); // Create the directory if it doesn't exist
    }

    // Check if the file exists
    if (!fs.existsSync(filePath)) {
        // Create the file with default data if it doesn't exist
        fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2), 'utf8');
        console.log(`${fileName} created at ${directory}`);
    } else {
        console.log(`${fileName} already exists in ${directory}`);
    }
}

// Function to scrape data from the HTML string
async function getLastPageValue(town) {
    let doc = await getPageDocument(`https://www.avvo.com/all-lawyers/co/${town}.html`);
    const nav = doc.querySelector('nav.pagination').querySelector('a.last').textContent;

    if (nav) {
        console.log(`Lastpage for ${town} is set to ${nav}`);
        return nav
    } else {
        console.log(`Failed to fetch lastpage for ${town}, we will use 500 as default laspage.`)
    }
    
    return 500;
}

async function getUserLinks(url) 
{
    let doc = await getPageDocument(url);

    const main = doc.querySelector('div.organic-results').outerHTML;

    // Use JSDOM to create a new document
    const dom = new JSDOM(main);
    const document = dom.window.document;

    // Query the document for elements
    const userCards = document.querySelectorAll('.profile-name');

    // extract links
    let userLinks = ['https://www.avvo.com/attorneys/80202-co-kyle-bachus-1283315.html'];
    userCards.forEach(userCard => {
        userLinks.push(userCard.querySelector('a').href);
    });
    
    return userLinks;
}

async function fetchAttorneyData(url)
{
    console.log(`fetching user url:${url}`);
    let doc = await getPageDocument(url);

    const main = doc.querySelector('.profile-main').outerHTML;

    // Use JSDOM to create a new document
    const dom = new JSDOM(main);
    const document = dom.window.document;

    let resumeSecionDetails = scrapResumeSection(doc);
    let userData = {
        'name': scrapeUsername(document),
        'address': scrapAddress(document),
        'phones': scrapPhones(document),
        'website': scrapWebsite(document),
        'licenses': scrapLicenses(doc),
        'cost': scrapCost(doc),
        ...resumeSecionDetails
    }
    

    return userData;
}

function scrapResumeSection(doc) {
    const main = doc.querySelector('#resume').outerHTML;
    const dom = new JSDOM(main);
    const document = dom.window.document;

    data = {};
    let sections =  document.querySelectorAll('.resume-section');
    sections.forEach((section, index) => {

        let heading = section.querySelector('h2')
        
        if (heading.textContent == 'Associations') {
            let associations = section.querySelectorAll('ul');

            let userAss = []
            associations.forEach((assoc, index) => {
                    let val = []
                    assoc.querySelectorAll('li').forEach((ass) => val.push(ass.textContent.replace(/^\n+|\n+$/g, '')))
                    userAss.push(val)
            })
            data['associations'] = userAss
        } else if (heading.textContent == 'Education'){
            let associations = section.querySelectorAll('ul');

            let userAss = []
            associations.forEach((assoc, index) => {
                    let val = []
                    assoc.querySelectorAll('li').forEach((ass) => val.push(ass.textContent.replace(/^\n+|\n+$/g, '')))
                    userAss.push(val)
                
            })
            data['Education'] = userAss;
        } else if (heading.textContent == 'Work Experience'){
            let associations = section.querySelectorAll('ul');

            let userAss = []
            associations.forEach((assoc, index) => {
                    let val = []
                    assoc.querySelectorAll('li').forEach((ass) => val.push(ass.textContent.replace(/^\n+|\n+$/g, '')))
                    userAss.push(val)
                
            })
            data['Work Experience'] = userAss;
        } else if (heading.textContent == 'Honors and Awards'){
            let associations = section.querySelectorAll('ul');

            let userAss = []
            associations.forEach((assoc, index) => {
                    let val = []
                    assoc.querySelectorAll('li').forEach((ass) => val.push(ass.textContent.replace(/^\n+|\n+$/g, '')))
                    userAss.push(val)
                
            })
            data['Honors and Awards'] = userAss;
        } else if (heading.textContent == 'Publications'){
            let associations = section.querySelectorAll('ul');

            let userAss = []
            associations.forEach((assoc, index) => {
                    let val = []
                    assoc.querySelectorAll('li').forEach((ass) => val.push(ass.textContent.replace(/^\n+|\n+$/g, '')))
                    userAss.push(val)
                
            })
            data['Publications'] = userAss;
        }

    })
      
    return data;
}

function addDataToJsonFile(filePath, newData) {
    let fileData = [];

    // Check if the file exists, if so, read the file
    if (fs.existsSync(filePath)) {
        const jsonData = fs.readFileSync(filePath, 'utf8');
        try {
            fileData = JSON.parse(jsonData); // Parse the file content as JSON
            
            // Ensure fileData is an array
            if (!Array.isArray(fileData)) {
                fileData = []; // If the content is not an array, initialize it as an empty array
            }
        } catch (error) {
            console.error('Error parsing JSON data:', error);
            fileData = []; // If JSON is invalid, initialize an empty array
        }
    }

    // Add new data to the existing JSON array
    fileData.push(newData);

    // Write the updated data back to the file
    fs.writeFileSync(filePath, JSON.stringify(fileData, null, 2), 'utf8');
    console.log(`Data successfully added to ${filePath}`);
}


function appendDataToJsonFile(filePath, newData) 
{
    let fileData = [];
    
    // Check if the file exists and read it
    if (fs.existsSync(filePath)) {
        try {
            const data = fs.readFileSync(filePath, 'utf8');
            fileData = JSON.parse(data);
        } catch (error) {
            console.error('Error reading or parsing file:', error);
        }
    }
    
    // Ensure that fileData is an array
    if (!Array.isArray(fileData)) {
        fileData = [];
    }
    
    // Append new data to the array
    fileData.push(newData);

    // Write the updated data back to the file
    try {
        fs.writeFileSync(filePath, JSON.stringify(fileData, null, 2), 'utf8');
        console.log('Data successfully appended to the file.');
    } catch (error) {
        console.error('Error writing to file:', error);
    }
}

async function scrap(town)
{
    createJsonFileIfNotExists('./storage', `${town}.json`, {});

    let lastPage = 1;//await getLastPageValue(town)
    for (let currPage = 1; currPage <= lastPage; currPage++) {
        const url = currPage == 1
            ? `https://www.avvo.com/all-lawyers/co/${town}.html`
            : `https://www.avvo.com/all-lawyers/co/${town}.html?page=${currPage}`;
        
        const fileName = currPage == 1
            ? town + '.txt'
            : town +  currPage + '.txt';


        let attorneyLinks = await getUserLinks(url);
        console.log(`For url:${url} we will scrap the following attorney's`);
        console.log(attorneyLinks);

        // Sequentially scrape each attorney's data
        for (const attorneyLink of attorneyLinks) {
            try {
                let attorneyData = await fetchAttorneyData(attorneyLink);
                if (attorneyData) {
                    appendDataToJsonFile(`./storage/${town}.json`, attorneyData)
                }
            } catch (error) {
                console.error(`Failed to fetch data for ${attorneyLink}:`, error);
            }
        }
    }

}

function init() {
    // Get the command line arguments
    const args = process.argv;

    // Check if the required argument is provided
    if (args.length < 3) {
        console.error('Please provide a required argument.');
        process.exit(1);
    } else {
        const town = args[2]; // Change index as needed
        scrap(town);
    }
}

init()
