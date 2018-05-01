import yaml from 'js-yaml';

import parse from '../src/parser';

describe('parse', () => {
  describe('primitives', () => {
    it('Should parse an integer primitives', () => {
      const input = yaml.safeLoad(`
definitions:
  basicInteger:
    type: integer
`);
      expect(parse(input).items).toMatchSnapshot();
    });

    it('Should parse an number primitives', () => {
      const input = yaml.safeLoad(`
definitions:
  basicNumber:
    type: number
`);
      expect(parse(input).items).toMatchSnapshot();
    });

    it('Should parse a string primitives', () => {
      const input = yaml.safeLoad(`
definitions:
  basicString:
    type: string
`);
      expect(parse(input).items).toMatchSnapshot();
    });

    it('Should parse an boolean primitives', () => {
      const input = yaml.safeLoad(`
definitions:
  basicBoolean:
    type: boolean
`);
      expect(parse(input).items).toMatchSnapshot();
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
      expect(parse(input).items).toMatchSnapshot();
    });
  });

  describe('array', () => {
    it('Should parse a basic array', () => {
      const input = yaml.safeLoad(`
definitions:
  basicArray:
    type: array
    items:
      type: string
`);
      expect(parse(input).items).toMatchSnapshot();
    });

    it('Should parse an additional items boolean', () => {
      const input = yaml.safeLoad(`
definitions:
  basicArray:
    type: array
    items:
      type: string
    additionalItems: true
`);
      expect(parse(input).items).toMatchSnapshot();
    });

    it('Should parse an additional items boolean (false)', () => {
      const input = yaml.safeLoad(`
definitions:
  basicArray:
    type: array
    items:
      type: string
    additionalItems: false
`);
      expect(parse(input).items).toMatchSnapshot();
    });

    it('Should parse an additional items schema', () => {
      const input = yaml.safeLoad(`
definitions:
  basicArray:
    type: array
    items:
      type: string
    additionalItems:
      type: number
`);
      expect(parse(input).items).toMatchSnapshot();
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
      expect(parse(input).items).toMatchSnapshot();
    });

  });
});
