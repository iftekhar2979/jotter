// src/ocr/ocr.service.ts
import { Injectable } from '@nestjs/common';
import * as Tesseract from 'tesseract.js';

@Injectable()
export class OcrService {
  async performOcr(imagePath: string): Promise<string> {
    try {
        // console.log(ima)
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
}

