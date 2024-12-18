
import path from 'path';
import { setOutput } from '@actions/core';

const addressRegex = /^0x[a-fA-F0-9]{40}$/;
const allowedTypes = ['vaults', 'operators', 'networks', 'tokens'];
const allowedFiles = ['info.json', 'logo.png'];
const files = JSON.parse(process.argv[2]) as string[];

const notAllowedChanges = files.filter((filePath) => {
  const [type, address, fileName] = filePath.split(path.sep);

  return !allowedTypes.includes(type) || !addressRegex.test(address) || !allowedFiles.includes(fileName);
});

if (notAllowedChanges.length) {
  /**
   * TODO: Post message to PR with the list of allowed changes
   */
  console.error('Not allowed changes:', notAllowedChanges.join(', '));

  process.exit(1);
}

if (files.length > allowedFiles.length) {
  console.error('You can add only one entity per pull request');

  process.exit(1);
}

const [metadata, logo] = allowedFiles.map((name) => files.find((file) => file.endsWith(name)));

if (!metadata) {
  console.error('`info.json` file is required');

  process.exit(1);
}

setOutput('metadata', metadata);
setOutput('logo', logo);
