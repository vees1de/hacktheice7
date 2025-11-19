import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { spawn } from 'child_process';
import * as path from 'path';

@Injectable()
export class SmartSearchService {
  private readonly logger = new Logger(SmartSearchService.name);

  async searchBenefits(query: string) {
    const scriptPath = path.resolve(
      process.cwd(),
      'smartsearch/python/benefit_search.py'
    );

    this.logger.log(`Smart search spawn for query="${query}"`);

    return new Promise((resolve, reject) => {
      const pythonBinary = process.env.SMART_SEARCH_PYTHON || 'python3';
      const proc = spawn(pythonBinary, [scriptPath, query], {
        env: process.env
      });

      let stdout = '';
      let stderr = '';

      proc.stdout.on('data', data => {
        stdout += data.toString();
      });

      proc.stderr.on('data', data => {
        stderr += data.toString();
      });

      proc.on('error', err => {
        reject(
          new BadRequestException(
            `Failed to start smart search: ${err.message}`
          )
        );
      });

      proc.on('close', code => {
        if (stderr.trim()) {
          this.logger.error(`Smart search stderr: ${stderr}`);
        }

        if (code !== 0) {
          return reject(
            new BadRequestException(
              `Smart search exited with code ${code}: ${stderr || stdout}`
            )
          );
        }

        try {
          const parsed = JSON.parse(stdout.trim());
          if (parsed.ok === false) {
            return reject(
              new BadRequestException(
                parsed.error || 'Smart search reported an error'
              )
            );
          }
          resolve(parsed);
        } catch (err) {
          reject(
            new BadRequestException(
              `Smart search returned invalid JSON: ${stdout}`
            )
          );
        }
      });
    });
  }
}
