import yaml from 'js-yaml';

import parse from '../src/parser';
import { DEFAULT_PARSER_CONFIG } from './constants';

describe('parse', () => {
  describe('array', () => {
    it('Should parse a basic array', () => {
      const input = yaml.safeLoad(`
definitions:
  basicArray:
    type: array
    items:
      type: string
`);
      expect(parse(input, DEFAULT_PARSER_CONFIG).items).toMatchSnapshot();
    });

    it('Should parse arrays of arrays.', () => {
      const input = yaml.safeLoad(`
definitions:
  basicArray:
    type: array
    items:
      type: array
      items:
        type: string
`);
      expect(parse(input, DEFAULT_PARSER_CONFIG).items).toMatchSnapshot();
    });

    it('Should parse arrays of objects.', () => {
      const input = yaml.safeLoad(`
definitions:
  basicArray:
    type: array
    items:
      type: object
      properties:
        field1:
          type: string
`);
      expect(parse(input, DEFAULT_PARSER_CONFIG).items).toMatchSnapshot();
    });
  });
});
