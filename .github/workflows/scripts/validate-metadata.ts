import * as fs from 'fs/promises';
import * as path from 'path';
import { Ajv, ErrorObject } from 'ajv';
import addFormats from 'ajv-formats';

import * as github from './github';
import * as messages from './messages';

const [metadataPath] = process.argv.slice(2);
const schemaPath = path.join(__dirname, 'schemas', 'info.json');
const ajv = new Ajv({ allErrors: true });

addFormats(ajv);

const normalizeErrors = (error: ErrorObject) => {
  const { instancePath, message, params } = error;
  const allowedValues = params?.allowedValues ? `: ${params.allowedValues.join(', ')}` : '';

  return `**${instancePath}**: ${message}${allowedValues}`;
};

github.run(async () => {
  const metadata = JSON.parse(await fs.readFile(metadataPath, 'utf8'));
  const schema = JSON.parse(await fs.readFile(schemaPath, 'utf8'));

  ajv.validate(schema, metadata);

  const errors = ajv.errors?.map(normalizeErrors).filter(Boolean) || [];

  if (errors.length) {
    await github.addReview({
      body: messages.invalidInfoJson(errors),
      comments: errors.map((body) => ({
        line: 1,
        path: metadataPath,
        body,
      })),
    });

    throw new Error('The `info.json` file is invalid');
  }
});
