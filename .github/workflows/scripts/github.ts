import * as core from '@actions/core';
import * as github from '@actions/github';

const token = process.env.GITHUB_TOKEN;
const headers = {
  'X-GitHub-Api-Version': '2022-11-28',
};

if (!token) {
  core.setFailed('GITHUB_TOKEN env variable is required');
  process.exit(1);
}

const octokit = github.getOctokit(token);

export type ReviewComment = {
  path: string;
  body: string;
  line?: number;
  position?: number;
};

export type Review = {
  body?: string;
  comments?: ReviewComment[];
};

export const addComment = async (body: string) => {
  const { owner, repo, number } = github.context.issue;

  await octokit.rest.issues.createComment({ owner, repo, issue_number: number, body, headers });
};

export const addReview = async (review: Review) => {
  const { owner, repo, number } = github.context.issue;

  await octokit.rest.pulls.createReview({
    owner,
    repo,
    pull_number: number,
    event: 'COMMENT',
    headers,
    ...review,
  });
};

export const run = async (command: () => Promise<void>) => {
  try {
    await command();
  } catch (error) {
    core.setFailed(error.message);
  }
};
