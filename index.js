
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

function scrapAreasOfPractice(doc) {
    const main = doc.querySelector('.chart-legend-list').outerHTML;
    const dom = new JSDOM(main);
    const document = dom.window.document;

    
    let areas = [];
    let starRatings = document.querySelectorAll('li');
    starRatings.forEach((starRating) => {
        let practice = starRating.querySelector('div').textContent.replace(/^\n+|\n+$/g, '');;
        let percentage= starRating.querySelector('.chart-legend-percent').textContent.replace(/^\n+|\n+$/g, '');
        let duration_and_cases = starRating.querySelector('p').textContent.replace(/^\n+|\n+$/g, '')

        areas.push({'practice': practice, 'percentage': percentage, 'duration_and_cases': duration_and_cases});
    })

    return areas;
}

function scrapRatings(doc) {
    const main = doc.querySelector('.reviews-container').outerHTML;
    const dom = new JSDOM(main);
    const document = dom.window.document;

    let review = {
        'average': document.querySelector('.overall-review-score').textContent, 
        'number_of_reviews': document.querySelector('.total-reviews').textContent,
        'star_ratings': {}
    }

    let starRatings = document.querySelectorAll('.review-overall-rating-row');
    starRatings.forEach((starRating) => {
        let label = starRating.querySelector('.histogram-rating').innerHTML;
        let percentage = starRating.querySelector('.histogram-rating-percent').innerHTML
        review.star_ratings[label] = percentage;
    })

    return review;
}

function scrapDescription(doc) {
    const main = doc.querySelector('.about-bio').outerHTML;
    const dom = new JSDOM(main);
    const document = dom.window.document;

    let des = document.querySelector('p').textContent;
    return des;
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
    
    let htmlString = decoder.decode(uint8Array).replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
    browser.close();
    
    // Create a new DOMParser instance
    const dom = new JSDOM(htmlString);
    return dom.window.document;
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
async function getLastPageValue(state, practiceName, url) {
    console.log('getting last page from : ' + url);
    let doc = await getPageDocument(url);
    const nav = doc.querySelector('nav.pagination').querySelector('a.last').textContent;

    if (nav) {
        console.log(`Lastpage for ${state} is set to ${nav}`);
        return nav
    } else {
        console.log(`Failed to fetch lastpage for ${state}:${practiceName}, we will use 500 as default laspage.`)
        return 500;
    }
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
    let userLinks = [];
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
        'description': scrapDescription(doc),
        'address': scrapAddress(document),
        'phones': scrapPhones(document),
        'website': scrapWebsite(document),
        'cost': scrapCost(doc),
        'licenses': scrapLicenses(doc),
        'ratings': scrapRatings(doc),
        'areas_of_practice': scrapAreasOfPractice(doc),
        ...resumeSecionDetails
    }

    return userData;
}


function appendDataListToJsonFile(filePath, newData) 
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
    for (data of newData) {
        fileData.push(data)
        
    }

    // Write the updated data back to the file
    try {
        fs.writeFileSync(filePath, JSON.stringify(fileData, null, 2), 'utf8');
        console.log('Data successfully appended to the file.');
    } catch (error) {
        console.error('Error writing to file:', error);
    }
}

async function scrap(state, practiceName, currUrl)
{
    createJsonFileIfNotExists(`./storage/${state}/`, `${practiceName}.json`, {});

    // console.log(url);
    let attorneyDataList = [];
    let lastPage = await getLastPageValue(state, practiceName, currUrl);
    for (let currPage = 1; currPage <= lastPage; currPage++) {
        console.log(`page ${currPage} of ${lastPage}`);
        const url = currPage == 1
            ? currUrl
            : `${currUrl}?page=${currPage}`;

        let attorneyLinks = await getUserLinks(url);
        console.log(`For url:${url} we will scrap the following attorney's`);
        console.log(attorneyLinks);

        // Sequentially scrape each attorney's data
        for (const attorneyLink of attorneyLinks) {
            try {
                let attorneyData = await fetchAttorneyData(attorneyLink);
                if (attorneyData) {
                    attorneyDataList.push(attorneyData)
                }
            } catch (error) {
                console.error(`Failed to fetch data for ${attorneyLink}:`, error);
            }
        }
        appendDataListToJsonFile(`./storage/${state}/${practiceName}.json`, attorneyDataList)
        console.log('\n\n\n\n\n\n');
    }

}

async function getStatesLinks(state) {
    let doc = await getPageDocument('https://www.avvo.com/find-a-lawyer');
    console.log(doc.outerHTML);

    const main = doc.querySelector('#js-top-state-link-farm').outerHTML;
    const dom = new JSDOM(main);
    const document = dom.window.document;

    let states = {};
    const statesSection =  document.querySelectorAll('a');
    statesSection.forEach((state, index) => {
        states[state.textContent.toLowerCase().split(' ').join('_')] = state.href; 

    })
    
    let currentStateUrl = `https://www.avvo.com${states[state]}`;
    let doc1 = await getPageDocument(currentStateUrl);
    const main1 = doc1.querySelector('.top-pa-items').outerHTML;
    const dom1 = new JSDOM(main1);
    const document1 = dom1.window.document;

    let practiceAreasLinks = [];
    const practiceAreasList = document1.querySelectorAll('li');
    practiceAreasList.forEach((pa) => {
        practiceAreasLinks.push(pa.querySelector('a').href.replace(/^\n+|\n+$/g, '')); 
    })

    return practiceAreasLinks;
}
// 
async function init() {
    // Get the command line arguments
    const args = process.argv;

    // Check if the required argument is provided
    if (args.length < 3) {
        console.error('Please provide a required argument.');
        process.exit(1);
    } else {
        const state = args[2]; // Change index as needed
        let links = await getStatesLinks(state);
        for (let i = 1; i <= links.length; i++) {
            let practice = links[i].split('/')
            let practiceName = practice[practice.length - 2];
            let url = `https://www.avvo.com${links[i]}`;
            
            await scrap(state, practiceName, url);
        }
    }
}

init()
