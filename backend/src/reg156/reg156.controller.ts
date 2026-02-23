import { Body, Controller, Post, Res } from '@nestjs/common';
import type { Response } from 'express';
import { CreateReg156Dto } from './dto/create-reg156.dto';
import { Reg156Service } from './reg156.service';

@Controller('reg-156')
export class Reg156Controller {
  constructor(private readonly reg156Service: Reg156Service) {}

  @Post('pdf')
  async generatePdf(@Body() body: CreateReg156Dto, @Res() res: Response) {
    const pdfBuffer = await this.reg156Service.generateFilledPdf(body);
    const timestamp = new Date().toISOString().slice(0, 10);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=\"reg-156-filled-${timestamp}.pdf\"`,
    );
    res.send(pdfBuffer);
  }
}
