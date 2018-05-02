import yaml from 'js-yaml';

import parse from '../src/parser';

describe('parse', () => {
  const types = ['allOf', 'anyOf', 'oneOf'];

  describe('complexType', () => {

    types.forEach((type) => {
      it(`Should parse a ${type} complex type`, () => {
        const input = yaml.safeLoad(`
  definitions:
    complexType:
      ${type}:
      - type: object
        properties:
          field1:
            type: string
      - type: object
        properties:
          field2:
            type: string
  `);
        expect(parse(input).items).toMatchSnapshot();
      });
    });

    it('Should parse a few complex types with required fields', () => {
      const input = yaml.safeLoad(`
definitions:
  complexType:
    allOf:
    - type: object
      properties:
        field1:
          type: string
    - type: object
      properties:
        field2:
          type: string
    required:
      - field1
      - field2
`);
      expect(parse(input).items).toMatchSnapshot();
    });


  });
});
