// @flow

import process from 'process';

import parseCommandLine from './command_line';
import main from './main';

const commandLinesOptions = parseCommandLine(process.argv);
if (commandLinesOptions) {
  main(commandLinesOptions);
}
