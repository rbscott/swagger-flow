import yaml from 'js-yaml';

import parse from '../src/parser';
import { DEFAULT_PARSER_CONFIG } from './constants';

describe('parse', () => {
  describe('primitives', () => {
    it('Should parse an integer primitives', () => {
      const input = yaml.safeLoad(`
definitions:
  basicInteger:
    type: integer
`);
      expect(parse(input, DEFAULT_PARSER_CONFIG).items).toMatchSnapshot();
    });

    it('Should parse an number primitives', () => {
      const input = yaml.safeLoad(`
definitions:
  basicNumber:
    type: number
`);
      expect(parse(input, DEFAULT_PARSER_CONFIG).items).toMatchSnapshot();
    });

    it('Should parse a string primitives', () => {
      const input = yaml.safeLoad(`
definitions:
  basicString:
    type: string
`);
      expect(parse(input, DEFAULT_PARSER_CONFIG).items).toMatchSnapshot();
    });

    it('Should parse an boolean primitives', () => {
      const input = yaml.safeLoad(`
definitions:
  basicBoolean:
    type: boolean
`);
      expect(parse(input, DEFAULT_PARSER_CONFIG).items).toMatchSnapshot();
    });

  });

  describe('enum', () => {
    it('Should parse a basic enum', () => {
      const input = yaml.safeLoad(`
definitions:
  basicEnum:
    type: string
    enum:
      - value1
      - value2
      - value3
`);
      expect(parse(input, DEFAULT_PARSER_CONFIG).items).toMatchSnapshot();
    });
  });

  describe('reference', () => {
    it('Should parse a reference', () => {
      const input = yaml.safeLoad(`
definitions:
  basicRef:
    $ref: '#/definitions/anotherType'
`);
      expect(parse(input, DEFAULT_PARSER_CONFIG).items).toMatchSnapshot();
    });

  });
});
