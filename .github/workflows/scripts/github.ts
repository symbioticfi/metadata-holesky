import * as core from '@actions/core';
import * as github from '@actions/github';

let octokit: ReturnType<typeof github.getOctokit>;

const getOctokit = () => {
  const token = process.env.GITHUB_TOKEN;

  if (!token) {
    throw new Error('GITHUB_TOKEN env variable is required');
  }

  octokit = octokit || github.getOctokit(token);

  return octokit;
};

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

export const repoPath = [github.context.repo.owner, github.context.repo.repo].join('/');

export const addComment = async (body: string) => {
  const { owner, repo, number } = github.context.issue;

  await getOctokit().rest.issues.createComment({ owner, repo, issue_number: number, body });
};

export const addReview = async (review: Review) => {
  const { owner, repo, number } = github.context.issue;

  await getOctokit().rest.pulls.createReview({
    owner,
    repo,
    pull_number: number,
    event: 'COMMENT',
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
