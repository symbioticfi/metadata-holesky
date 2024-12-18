
import { info, setOutput } from '@actions/core';

console.log('Args', process.argv);

setOutput('logo', 'logog-path');
setOutput('metadata', 'metadata-path');

info('Validate file structure');
