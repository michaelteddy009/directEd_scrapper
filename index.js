import { Worker } from 'worker_threads';
import fs from 'fs';
import path from 'path';
import {
    fetchAttorneyData,
    getStatesLinks,
    appendDataListToJsonFile,
    getUserLinks,
    getLastPageValue,
    createJsonFileIfNotExists,
} from './main.js';  // Import your main functions

const maxWorkers = process.argv[3] ?? 1;  // Limit the number of concurrent workers
const workerPool = [];  // Pool of workers
let taskQueue = [];  // Queue to hold pending attorney links

// Create workers
for (let i = 0; i < maxWorkers; i++) {
    const worker = new Worker('./worker.js');  // Create a worker thread
    worker.on('message', handleWorkerResponse);
    worker.on('error', handleWorkerError);
    worker.busy = false;  // Track if the worker is busy
    workerPool.push(worker);
}

// Function to create directory if it doesn't exist
function createDirectoryIfNotExists(dirPath) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        console.log(`Created directory: ${dirPath}`);
    }
}

// Function to track progress of scraping for each practiceName
async function trackProgress(state, practiceName) {
    const progressFilePath = `./trackers/progress.json`;  // Path for progress file
    let progress = {};

    // Create directories if they do not exist
    createDirectoryIfNotExists(path.dirname(progressFilePath));  // Create parent directory

    // Initialize progress if the file does not exist
    if (!fs.existsSync(progressFilePath)) {
        progress[state] = {};
    } else {
        progress = JSON.parse(fs.readFileSync(progressFilePath));
    }

    // Ensure the practice is tracked
    if (!progress[state][practiceName]) {
        progress[state][practiceName] = { last_page: 0, current_page: 0 };
    }

    return { progress, currentProgress: progress[state][practiceName] };
}

// Function to run worker for each attorney link
function assignTaskToWorker(attorneyLink) {
    return new Promise((resolve, reject) => {
        const availableWorker = workerPool.find(worker => !worker.busy);
        if (availableWorker) {
            availableWorker.busy = true;
            availableWorker.resolve = resolve;
            availableWorker.reject = reject;
            availableWorker.postMessage(attorneyLink);  // Send attorney link to the worker
        } else {
            // Add task to the queue if no worker is available
            taskQueue.push({ attorneyLink, resolve, reject });
        }
    });
}

// Handle worker responses and assign the next task in the queue
function handleWorkerResponse(message) {
    const worker = this;
    worker.busy = false;  // Mark the worker as available
    if (message.success) {
        worker.resolve(message.data);  // Resolve with attorney data
    } else {
        worker.reject(new Error(`Failed to fetch data: ${message.error}`));
    }

    // Assign next task in the queue, if available
    if (taskQueue.length > 0) {
        const nextTask = taskQueue.shift();
        assignTaskToWorker(nextTask.attorneyLink).then(nextTask.resolve).catch(nextTask.reject);
    }
}

// Handle worker errors
function handleWorkerError(error) {
    console.error(`Worker error: ${error.message}`);
}

// Function to scrape data for a state and practice area
// Function to scrape data for a state and practice area
async function scrap(state, practiceName, currUrl) {
    createJsonFileIfNotExists(`./storage/${state}/`, `${practiceName}.json`, {});

    const progressFilePath = `./trackers/progress.json`;  // Define the path for the progress file
    const { progress, currentProgress } = await trackProgress(state, practiceName);
    let lastPage = await getLastPageValue(state, practiceName, currUrl);
    currentProgress.last_page = lastPage;  // Update last page
    let attorneyDataList = [];

    // Start scraping from the next page
    for (let currPage = currentProgress.current_page + 1; currPage <= lastPage; currPage++) {
        console.log(`Scraping page ${currPage} of ${lastPage}`);
        const url = currPage === 1 ? currUrl : `${currUrl}?page=${currPage}`;

        let attorneyLinks = await getUserLinks(url);
        console.log(`Scraping attorneys from page: ${url}`);

        // Create worker pool for attorney links
        let promises = attorneyLinks.map(async (attorneyLink) => await assignTaskToWorker(attorneyLink));
        const results = await Promise.allSettled(promises);

        results.forEach((result, index) => {
            if (result.status === 'fulfilled') {
                console.log(`Promise ${index} resolved with username:`, result.value.name);
                attorneyDataList.push(result.value);  // Only include successful results
            } else {
                console.error(`Promise ${index} rejected with reason:`, result.reason);
            }
        });

        // Append results to the JSON file
        appendDataListToJsonFile(`./storage/${state}/${practiceName}.json`, attorneyDataList);
        console.log("\n\n\n\n\n\n\n\n\n\n");

        // Update progress in the tracking file
        currentProgress.current_page = currPage;
        fs.writeFileSync(progressFilePath, JSON.stringify(progress, null, 2));  // Save progress after each page
    }

    console.log(`Completed scraping for ${practiceName} in ${state}.`);
}


// Initialization function
async function init() {
    try {
        const args = process.argv;
        if (args.length < 3) {
            console.error('Please provide a state argument.');
            process.exit(1);
        } else {
            const state = args[2];
            let links = await getStatesLinks(state);
            if (links.length > 0) {
                for (let i = 0; i < links.length; i++) {
                    let practice = links[i].split('/');
                    let practiceName = practice[practice.length - 2];
                    let url = `https://www.avvo.com${links[i]}`;
                    await scrap(state, practiceName, url);
                }
            } else {
                console.log(`No links found for state: ${state}`);
            }
        }
    } catch (error) {
        console.error('Error during initialization:', error);
    }
}

// Start the scraping process
init();
