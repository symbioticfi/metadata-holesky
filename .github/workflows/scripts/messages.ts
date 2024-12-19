const contributionGuidelines = `Please, follow the [contribution guidelines](../../../../README.md).`;

export const notAllowedChanges = (files: string[]) =>
  `We detected changes in the pull request that are not allowed. ${contributionGuidelines}

  **Not allowed files:**
  ${files.map((file) => `- ${file}`).join('\n')}
`;

export const onlyOneEntityPerPr = (dirs: string[]) =>
  `It is not allowed to change more than one entity in a single pull request. ${contributionGuidelines}

  **Entities:**
  ${dirs.map((file) => `- ${file}`).join('\n')}
`;

export const invalidStructure = (entityDir: string, files: string[]) =>
  `The sctucture of the entity folder is invalid. ${contributionGuidelines}

  **Current structure:**
  - ${entityDir}
    ${files.map((file) => `- ${file}`).join('\n')}
`;

export const invalidInfoJson = (errors: string[]) =>
  `The info.json file is invalid. ${contributionGuidelines}

  **Errors:**
  ${errors.filter(Boolean).map((error) => `- ${error}`).join('\n')}
`;

export const invalidLogo = (errors: string[]) =>
  `The logo image is invalid. ${contributionGuidelines}

  **Errors:**
  ${errors.filter(Boolean).map((error) => `- ${error}`).join('\n')}
`;