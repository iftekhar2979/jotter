import { error } from 'console';
const { parentPort, workerDate } = require('worker_threads');
import Tesseract from 'tesseract.js';

parentPort.on('message', async (data) => {
  try {
    const { imageBuffer } = data;
    const {
      data: { text },
    } = await Tesseract.recognize(imageBuffer, 'eng');
    parentPort.postMessage({ text });
  } catch (error) {
    parentPort.postMessage({ error: 'Error during OCR process' });
  }
});
