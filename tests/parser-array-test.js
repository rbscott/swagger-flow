import yaml from 'js-yaml';

import parse from '../src/parser';

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
      expect(parse(input).items).toMatchSnapshot();
    });
  });
});
