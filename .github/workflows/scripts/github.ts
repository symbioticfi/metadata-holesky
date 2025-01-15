import * as github from '@actions/github';

export const repoPath = [github.context.repo.owner, github.context.repo.repo].join('/');
