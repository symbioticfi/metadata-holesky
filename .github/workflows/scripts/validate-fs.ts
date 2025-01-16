import path from 'path';
import fs from 'fs';
import * as core from '@actions/core';
import * as github from './github';
import * as messages from './messages';

const addressRegex = /^0x[a-fA-F0-9]{40}$/;
const allowedTypes = ['vaults', 'operators', 'networks', 'tokens'];
const allowedFiles = ['info.json', 'logo.png'];
const changedFiles = process.argv.slice(2);

github.run(async () => {
  const notAllowed = new Set<string>();
  const entityDirs = new Set<string>();

  for (const filePath of changedFiles) {
    const dir = path.dirname(filePath);
    const [type, address, fileName] = filePath.split(path.sep);
    const isValid =
      allowedTypes.includes(type) && addressRegex.test(address) && allowedFiles.includes(fileName);

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
    await github.addComment(messages.notAllowedChanges([...notAllowed]));

    throw new Error(
      `The pull request includes changes outside the allowed directories:\n ${[...notAllowed].join(
        ', '
      )}`
    );
  }

  /**
   * Validate that only one entity is changed per pull request
   */
  if (entityDirs.size > 1) {
    await github.addComment(messages.onlyOneEntityPerPr([...entityDirs]));

    throw new Error('Several entities are changed in one pull request');
  }

  const [entityDir] = entityDirs;
  const existingFiles = await fs.promises.readdir(entityDir);

  const [metadataPath, logoPath] = allowedFiles.map((name) => {
    return existingFiles.includes(name) ? path.join(entityDir, name) : undefined;
  });

  const [isMetadataChanged, isLogoChanged] = allowedFiles.map((name) => {
    return changedFiles.some((file) => path.basename(file) === name);
  });

  /**
   * Validate that metadata present in the entity folder.
   */
  if (!metadataPath) {
    await github.addComment(messages.noInfoJson(entityDir, existingFiles));

    throw new Error('`info.json` is not found in the entity folder');
  }

  /**
   * Send metadata to the next validation step only if the file was changed and exists.
   */
  if (isMetadataChanged && metadataPath) {
    core.setOutput('metadata', metadataPath);
  }

  /**
   * Send logo to the next validation step only if the file was changed and exists.
   */
  if (isLogoChanged && logoPath) {
    core.setOutput('logo', logoPath);
  }
});
