
import * as fs from 'fs/promises';
import * as path from 'path';
import * as github from './github';
import { Ajv } from 'ajv'

const [metadataPath] = process.argv.slice(2);
const schemaPath = path.join(__dirname, '..', 'schemas', 'info.json');

github.run(async () => {
  const ajv = new Ajv();
  const metadata = JSON.parse(await fs.readFile(metadataPath, 'utf8'));
  const schema = JSON.parse(await fs.readFile(schemaPath, 'utf8'));

  ajv.validate(schema, metadata);

  if (ajv.errors) {
    await github.addComment(`The metadata file is invalid. Please, follow the [contribution guidelines](/README.md).`);

    throw new Error('The `info.json` file is invalid');
  }
});
