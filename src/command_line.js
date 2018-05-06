// @flow

import { Command } from 'commander';

import type { ParserConfig } from './parser';
import type { GeneratorConfig } from './generator';

export type CommandLineRun = {|
  generatorConfig: GeneratorConfig,
  parserConfig: ParserConfig,
  swaggerPath: string,
|};

export type CommandLineOptions = CommandLineRun;

const PROGRAM_VERSION = '0.1.0';

const parseCommandLine = (argv: Array<string>): ?CommandLineOptions => {
  const program = new Command();

  program
    .version(PROGRAM_VERSION, '-v, --version')
    .usage('[options]')
    .arguments('<swagger-path>')
    .option(
      '--controller-key <controller-key>',
      'Name of the key to select the controller (e.g. x-swagger-router-controller).'
    )
    .option('--no-open-classes', 'Enable exact class definitions on types.')
    .option('--no-split-body', 'Treat a body parameter named body as just another parameter.')
    .parse(argv);

  if (program.args.length !== 1) {
    program.outputHelp();
    return null;
  }

  return {
    parserConfig: {
      controllerKey: program.controllerKey,
      splitBody: program.splitBody,
    },
    generatorConfig: {
      openClasses: program.openClasses,
    },
    swaggerPath: program.args[0],
  };
};

export default parseCommandLine;
