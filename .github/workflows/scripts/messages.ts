export const notAllowedChanges = (files: string[]) =>
  `We detected changes in the pull request that are not allowed. Please, follow the [contribution guidelines](README.md).

  **Not allowed changes:**
  ${files.map((file) => `- ${file}`).join('\n')}
`;

export const onlyOneEntityPerPr = (dirs: string[]) =>
  `It is not allowed to change more than one entity in a single pull request. Please, follow the [contribution guidelines](README.md).

  **Changed entities:**
  ${dirs.map((file) => `- ${file}`).join('\n')}
`;

export const invalidStructure = (entityDir: string, files: string[]) =>
  `The sctucture of the entity folder is invalid. Please, follow the [contribution guidelines](README.md).

  **Current structure:**
  - ${entityDir}
    ${files.map((file) => `- ${file}`).join('\n')}
`;
