
import path from 'path';
import fs from 'fs';
import { setOutput } from '@actions/core';

const addressRegex = /^0x[a-fA-F0-9]{40}$/;
const allowedTypes = ['vaults', 'operators', 'networks', 'tokens'];
const allowedFiles = ['info.json', 'logo.png'];
const changedFiles = process.argv.slice(2);

const notAllowed = new Set<string>();
const entityDirs = new Set<string>();

for (const filePath of changedFiles) {
  const dir = path.dirname(filePath);
  const [type, address, fileName] = filePath.split(path.sep);
  const isValid = allowedTypes.includes(type) && addressRegex.test(address) && allowedFiles.includes(fileName);
  
  if (isValid) {
    entityDirs.add(dir);
  } else {
    notAllowed.add(filePath);
  }
}

/**
 * Validate that there are only allowed changes
 */
if (notAllowed.size) {
  console.error('Not allowed changes:', [...notAllowed].join(', '));

  process.exit(1);
}

/**
 * Validate that only one entity is changed per pull request
 */
if (entityDirs.size > 1) {
  console.error('You can add/change only one entity per pull request');

  process.exit(1);
}

const [entityDir] = entityDirs;
const existingFiles = fs.readdirSync(entityDir);

const [metadataPath, logoPath] = allowedFiles.map((name) => {
  return existingFiles.includes(name) ? path.join(entityDir, name) : undefined;
})

const [isMetadataChanged, isLogoChanged] = allowedFiles.map((name) => {
  return changedFiles.some((file) => path.basename(file) === name);
})

/**
 * Validate that metadata present in the entity folder.
 */
if (!metadataPath) {
  console.error('`info.json` is required');

  process.exit(1);
}

/**
 * Send metadata to the next validation step only if the file was changed and exists.
 */
if (isMetadataChanged && metadataPath) {
  setOutput('metadata', metadataPath);
}

/**
 * Send logo to the next validation step only if the file was changed and exists.
 */
if (isLogoChanged && logoPath) {
  setOutput('logo', logoPath);
}
