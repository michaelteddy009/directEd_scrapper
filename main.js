
import { connect } from "puppeteer-real-browser";
import fs from 'fs';
import path from 'path';
import { JSDOM } from 'jsdom';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

// Use stealth plugin to avoid detection
puppeteer.use(StealthPlugin());


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
        return ''
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
    try {
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
    } catch (error) {
        return []
    }
}

function scrapRatings(doc) {
    try {
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
    } catch (error) {
        return ''
    }
}

function scrapDescription(doc) {
    try {
        const main = doc.querySelector('.about-bio').outerHTML;
        const dom = new JSDOM(main);
        const document = dom.window.document;
    
        let des = document.querySelector('p').textContent;
        return des;
    } catch (error) {
        return ''
    }
}

function scrapResumeSection(doc) {
    const main = doc.querySelector('#resume').outerHTML;
    const dom = new JSDOM(main);
    const document = dom.window.document;

    let data = {};
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

        args:  ['--no-sandbox', '--disable-setuid-sandbox'],

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

    await page.setJavaScriptEnabled(true);
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36');
 
    await page.cookies();
    // console.log(cookies);

    let res = await page.goto(url)
    let contentUnit8Array = await res.content();
    
    const uint8Array = new Uint8Array(contentUnit8Array); // Example Uint8Array
    const decoder = new TextDecoder('utf-8'); // Specify the encoding
    
    let htmlString = decoder.decode(uint8Array).replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
    browser.close();
    
    // Create a new DOMParser instance
    const dom = new JSDOM(htmlString);
    return dom.window.document;






    // // Launch Puppeteer in non-headless mode for debugging
    // const browser = await puppeteer.launch({
    //     headless: true,

    //     args:  ['--no-sandbox', '--disable-setuid-sandbox'],

    //     customConfig: {},

    //     turnstile: true,

    //     connectOption: {},

    //     disableXvfb: true,
    //     ignoreAllFlags: false
    //     // proxy:{
    //     //     host:'<proxy-host>',
    //     //     port:'<proxy-port>',
    //     //     username:'<proxy-username>',
    //     //     password:'<proxy-password>'
    //     // }
    // });
    // const page = await browser.newPage();

    // // Set a modern user-agent string to avoid "outdated browser" issues
    // await page.setJavaScriptEnabled(true);
    // await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36');
    // await page.cookies();

    
    // let res = await page.goto(url, { waitUntil: 'networkidle2' });
    // // let res = await page.goto(url)
    // let contentUnit8Array = await res.content();
    
    // const uint8Array = new Uint8Array(contentUnit8Array); // Example Uint8Array
    // const decoder = new TextDecoder('utf-8'); // Specify the encoding
    
    // let htmlString = decoder.decode(uint8Array).replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
    // // browser.close();
    
    // // Create a new DOMParser instance
    // const dom = new JSDOM(htmlString);
    // return dom.window.document;
}

export function createJsonFileIfNotExists(directory, fileName, defaultData = {}) {
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
export async function getLastPageValue(state, practiceName, url) {
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

export async function getUserLinks(url) 
{
    try {
        let doc = await getPageDocument(url);
        console.log(url);
        const main = doc.querySelector('.organic-results').outerHTML;
    
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
    } catch (error) {
        return [];
    }
}

export async function fetchAttorneyData(url)
{
   
    // console.log(`${main}`);

    // return userData;


    try {
        console.log(`fetching user url:${url}`);
        let doc = await getPageDocument(url);
    
        const main = doc.querySelector('.profile-main').outerHTML;
        // Use JSDOM to create a new document
        const dom = new JSDOM(main);
        
        const document = dom.window.document;
        let name = scrapeUsername(document);
        let description = scrapDescription(doc) ?? '';
        let address =  scrapAddress(document);
        let phones = scrapPhones(document)
        let website = scrapWebsite(document)
        let cost = scrapCost(doc)
        let licenses = scrapLicenses(doc)
        let ratings = scrapRatings(doc)
        let areas_of_practice = scrapAreasOfPractice(doc)
        let resumeSecionDetails = scrapResumeSection(doc);
        
        let userData = {
            'name':  name,
            'description': description,
            'address':  address,
            'phones':  phones,
            'website':  website,
            'cost':  cost,
            'licenses':  licenses,
            'ratings':  ratings,
            'areas_of_practice': areas_of_practice,
            ...resumeSecionDetails
        }
        return { success: true, data: userData};  // Return success with data
    } catch (error) {
        console.log(error);
        return { success: false, error: error.message };  // Return failure with error
    }
}

export function appendDataListToJsonFile(filePath, newData) 
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
    fileData.push(...newData)

    // Write the updated data back to the file
    try {
        fs.writeFileSync(filePath, JSON.stringify(fileData, null, 2), 'utf8');
        console.log('Data successfully appended to the file.');
    } catch (error) {
        console.error('Error writing to file:', error);
    }
}



export async function getStatesLinks(state) {
    try {
        let doc = await getPageDocument('https://www.avvo.com/find-a-lawyer');
    
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
    } catch (error) {
        return error
    }
}

export default fetchAttorneyData;
