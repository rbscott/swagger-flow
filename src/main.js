// @flow

import fs from 'fs';
import jsyaml from 'js-yaml';

import type { CommandLineOptions } from './command_line';

import generateFlowTypes from './generator';
import parse from './parser';

const main = (commandLineOptions: CommandLineOptions) => {
  const {
    generatorConfig,
    parserConfig,
    swaggerPath,
  } = commandLineOptions;

  const swaggerContents = fs.readFileSync(swaggerPath, 'utf8');
  const swaggerDoc = jsyaml.safeLoad(swaggerContents);

  const schema = parse(swaggerDoc, parserConfig);

  console.log(generateFlowTypes(schema, generatorConfig));
};

export default main;
