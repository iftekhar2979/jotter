// src/ocr/ocr.controller.ts
import { Controller, Post, Body } from '@nestjs/common';
import { OcrService } from './ocr.service';

@Controller('ocr')
export class OcrController {
  constructor(private readonly ocrService: OcrService) {}

  @Post('recognize')
  async recognizeText(@Body('imagePath') imagePath: string): Promise<string> {
    return this.ocrService.performOcr(imagePath);
  }
}
