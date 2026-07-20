import { execFile } from 'child_process';
import { promisify } from 'util';
import { randomUUID } from 'crypto';
import { tmpdir } from 'os';
import { join } from 'path';
import { writeFile, readFile, unlink } from 'fs/promises';
import ffmpegPath from 'ffmpeg-static';

const execFileAsync = promisify(execFile);

// Product videos are commonly recorded on phones, which default to H.264
// High Profile. Firefox doesn't ship its own H.264 decoder (patent
// licensing) — it relies on Cisco's OpenH264 plugin or the OS decoder, and
// High Profile support there is inconsistent, so those videos fail to play
// in Firefox while working fine in Chrome/Edge. Re-encoding to Baseline
// profile trades some compression efficiency for playback that works
// everywhere.
export async function transcodeToCompatibleH264(input: Buffer): Promise<Buffer> {
  if (!ffmpegPath) {
    throw new Error('ffmpeg binary not available');
  }

  const workDir = tmpdir();
  const id = randomUUID();
  const inputPath = join(workDir, `${id}-in.mp4`);
  const outputPath = join(workDir, `${id}-out.mp4`);

  try {
    await writeFile(inputPath, input);

    await execFileAsync(ffmpegPath, [
      '-y',
      '-i', inputPath,
      '-c:v', 'libx264',
      '-profile:v', 'baseline',
      '-level', '3.1',
      '-pix_fmt', 'yuv420p',
      '-crf', '23',
      '-preset', 'veryfast',
      '-c:a', 'aac',
      '-b:a', '128k',
      '-movflags', '+faststart',
      outputPath,
    ]);

    return await readFile(outputPath);
  } finally {
    await Promise.all([
      unlink(inputPath).catch(() => {}),
      unlink(outputPath).catch(() => {}),
    ]);
  }
}
