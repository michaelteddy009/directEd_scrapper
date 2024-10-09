// worker.js
import { parentPort } from 'worker_threads';
import { fetchAttorneyData } from './main.js';  // Ensure this path points to the fetchAttorneyData function

// Listen for messages from the main thread
parentPort.on('message', async (attorneyLink) => {
    let data = await fetchAttorneyData(attorneyLink);
    parentPort.postMessage(data);
});
