import sharp from 'sharp';
import * as fs from 'fs/promises';

import * as github from './github';
import * as messages from './messages';

const [metadataPath] = process.argv.slice(2);

github.run(async () => {
  const image = sharp(metadataPath);

  const errors: string[] = [];
  const { size } = await fs.stat(metadataPath);
  const { hasAlpha, width = 0, height = 0, format } = await image.metadata();
  
  if (format !== 'png') {
    errors.push('The image format should be PNG');
  }

  if (size > 1024 * 1024) {
    errors.push('The image is too large. The maximum size is 1MB');
  }

  if (!hasAlpha) {
    errors.push('The image background should be transparent');
  }

  if (width != 256 || height != 256) {
    errors.push('The image size must be 256x256 pixels');
  }

  if (errors.length) {
    await github.addComment(messages.invalidLogo(errors));

    throw new Error('The logo is invalid');
  }
});