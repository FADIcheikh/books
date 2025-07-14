import { t } from 'fyo';
import { promises as fs } from 'fs';
import { tmpdir } from 'os';
import path from 'path';
import { randomUUID } from 'crypto';
import { execFile } from 'child_process';

/**
 * Run OCR on the provided image buffer using the official PaddleOCR
 * Python package. Requires `paddleocr` to be installed in the system
 * Python environment.
 */
export async function ocrBuffer(buffer: Buffer): Promise<string> {
  const tmpPath = path.join(tmpdir(), `ocr-${randomUUID()}`);
  const imagePath = path.join(tmpPath, 'input.png');
  const scriptPath = path.join(__dirname, '../../scripts/paddleocr_cli.py');

  await fs.mkdir(tmpPath, { recursive: true });
  await fs.writeFile(imagePath, buffer);

  try {
    const { stdout } = await new Promise<{ stdout: string }>(
      (resolve, reject) => {
        execFile(
          'python3',
          [scriptPath, imagePath],
          { encoding: 'utf8' },
          (err, stdout, stderr) => {
            if (err) {
              console.error(stderr);
              reject(err);
              return;
            }
            resolve({ stdout });
          }
        );
      }
    );

    const { text } = JSON.parse(stdout) as { text: string };
    return text;
  } catch (error) {
    console.error('PaddleOCR error', error);
    throw new Error(t`OCR failed: ${String(error)}`);
  } finally {
    await fs.rm(tmpPath, { recursive: true, force: true });
  }
}
