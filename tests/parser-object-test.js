import yaml from 'js-yaml';

import parse from '../src/parser';
import { DEFAULT_PARSER_CONFIG } from './constants';

describe('parse', () => {
  describe('object', () => {
    it('Should parse a basic object', () => {
      const input = yaml.safeLoad(`
definitions:
  basicObject:
    type: object
    properties:
      field1:
        type: string
`);
      expect(parse(input, DEFAULT_PARSER_CONFIG).items).toMatchSnapshot();
    });

    it('Should parse the required field object', () => {
      const input = yaml.safeLoad(`
definitions:
  basicObject:
    type: object
    properties:
      field1:
        type: string
    required:
      - field1
`);
      expect(parse(input, DEFAULT_PARSER_CONFIG).items).toMatchSnapshot();
    });

  });
});
