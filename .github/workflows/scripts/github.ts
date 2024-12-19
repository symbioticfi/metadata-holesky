import * as core from '@actions/core';
import * as github from '@actions/github';

const token = core.getInput('github-token');
const octokit = github.getOctokit(token);

export const addComment = async (body: string) => {
  const { owner, repo, number } = github.context.issue;

  await octokit.rest.issues.createComment({ owner, repo, issue_number: number, body });
};
