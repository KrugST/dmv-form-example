import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { spawn } from 'node:child_process';
import { join } from 'node:path';
import { CreateReg156Dto } from './dto/create-reg156.dto';

@Injectable()
export class Reg156Service {
  async generateFilledPdf(payload: CreateReg156Dto): Promise<Buffer> {
    const scriptPath = join(__dirname, '..', '..', 'scripts', 'fill_reg156.py');
    const templatePath = join(
      __dirname,
      '..',
      '..',
      '..',
      'REG-156-R11-2024-ASB-WWW.pdf',
    );

    return new Promise((resolve, reject) => {
      const process = spawn('python', [scriptPath, templatePath], {
        stdio: ['pipe', 'pipe', 'pipe'],
      });

      const chunks: Buffer[] = [];
      const errors: Buffer[] = [];

      process.stdout.on('data', (chunk: Buffer) => chunks.push(chunk));
      process.stderr.on('data', (chunk: Buffer) => errors.push(chunk));
      process.on('error', (err) => {
        reject(
          new InternalServerErrorException(
            `Failed to start PDF process: ${err.message}`,
          ),
        );
      });

      process.on('close', (code) => {
        if (code !== 0) {
          reject(
            new InternalServerErrorException(
              `PDF generation failed: ${Buffer.concat(errors).toString()}`,
            ),
          );
          return;
        }

        const output = Buffer.concat(chunks);
        if (!output.length) {
          reject(
            new InternalServerErrorException(
              'PDF generation returned empty output.',
            ),
          );
          return;
        }
        resolve(output);
      });

      process.stdin.write(JSON.stringify(payload));
      process.stdin.end();
    });
  }
}
