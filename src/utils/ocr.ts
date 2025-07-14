import { t } from 'fyo';
import fs from 'fs';
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

  const devScript = path.join(__dirname, '../../scripts/paddleocr_cli.py');
  const prodScript = path.join(process.resourcesPath, 'paddleocr_cli.py');
  const scriptPath = fs.existsSync(prodScript) ? prodScript : devScript;

  await fs.mkdir(tmpPath, { recursive: true });
  await fs.writeFile(imagePath, buffer);

  try {
    const pythonCmds =
      process.platform === 'win32'
        ? ['python', 'python3', 'py']
        : ['python3', 'python'];

    const { stdout } = await new Promise<{ stdout: string }>(
      (resolve, reject) => {
        const tryRun = (cmds: string[]): void => {
          if (cmds.length === 0) {
            reject(new Error('Python is not installed'));
            return;
          }

          const cmd = cmds[0];
          execFile(
            cmd,
            [scriptPath, imagePath],
            { encoding: 'utf8' },
            (err, stdout, stderr) => {
              if (err) {
                if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
                  // try next command
                  tryRun(cmds.slice(1));
                } else {
                  console.error(stderr);
                  reject(err);
                }
                return;
              }
              resolve({ stdout });
            }
          );
        };

        tryRun(pythonCmds);
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
