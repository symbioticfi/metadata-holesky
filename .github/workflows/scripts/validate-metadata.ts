import * as fs from 'fs/promises';
import * as path from 'path';
import { Ajv, ErrorObject } from 'ajv';
import addFormats from 'ajv-formats';
import { parse } from 'json-source-map';

import * as github from './github';
import * as messages from './messages';

const [metadataPath] = process.argv.slice(2);
const schemaPath = path.join(__dirname, 'schemas', 'info.json');
const ajv = new Ajv({ allErrors: true });

addFormats(ajv);

const normalizeErrors = (error: ErrorObject, lineMap: any) => {
  const { instancePath, message, params } = error;
  const allowedValues = params?.allowedValues ? `: ${params.allowedValues.join(', ')}` : '';
  const line = lineMap[instancePath]?.value?.line || 1;
  const capMessage =  message && message.charAt(0).toUpperCase() + message.slice(1);

  return {
    line: line + 1,
    message: `${capMessage}${allowedValues}`,
  };
};

github.run(async () => {
  const metadataContent = await fs.readFile(metadataPath, 'utf8');
  const { data: metadata, pointers: lineMap } = parse(metadataContent);
  const schema = JSON.parse(await fs.readFile(schemaPath, 'utf8'));

  ajv.validate(schema, metadata);

  const errors = ajv.errors?.map((error) => normalizeErrors(error, lineMap)).filter(Boolean) || [];

  if (errors.length) {
    await github.addReview({
      body: messages.invalidInfoJson(metadataPath, errors),
      comments: errors.map(({ message, line }) => ({
        line,
        path: metadataPath,
        body: message,
      })),
    });

    throw new Error('The `info.json` file is invalid');
  }
});
