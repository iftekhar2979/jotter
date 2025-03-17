// src/ocr/ocr.service.ts
import { Injectable } from '@nestjs/common';
import { join, resolve } from 'path';
import { Worker } from 'worker_threads';
import * as Tesseract from 'tesseract.js';

@Injectable()
export class OcrService {
  async performOcr(imagePath: string): Promise<string> {
    try {
        // console.log(ima)
        console.log(imagePath)
      const { data: { text } } = await Tesseract.recognize(
        imagePath,
        'eng',
      );
      return text; 
    } catch (error) {
      console.error('Error performing OCR:', error);
    //   throw new Error('OCR failed');
    }
  }

  async performOcrWithWorker(imageBuffer: Buffer): Promise<string> {
    
    return new Promise((resolve, reject) => {
      const worker = new Worker(join(__dirname, '../common/worker/ocr-worker.ts'), {
        workerData: { imageBuffer },
      });

      // When the worker sends back a message
      worker.on('message', (result) => {
        if (result.error) {
          reject(result.error);
        } else {
          resolve(result.text);  // OCR result text
        }
      });

      // Handle worker errors
      worker.on('error', (error) => {
        reject(`Worker error: ${error}`);
      });

      // Handle worker exit (in case the process is closed)
      worker.on('exit', (code) => {
        if (code !== 0) {
          reject(`Worker stopped with exit code ${code}`);
        }
      });
    });
  }
}

