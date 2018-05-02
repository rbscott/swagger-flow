
import { generateDeclaration } from '../src/generator';
import { PRIMITIVE_TYPES } from '../src/types';

describe('generateDeclaration', () => {
  const DEFAULT_CONFIG = { openClasses: true };
  const STRICT_CONFIG = { openClasses: false };

  /*******
   * allOf, anyOf, oneOf. Using the same tests for all of them.
   *******/

  ['allOf', 'anyOf', 'oneOf'].forEach((type) => {
    describe(type, () => {
      const name = type.charAt(0).toUpperCase() + type.slice(1);

      it(`Should build an ${type} declaration.`, () => {
        const objectFields = new Map(Object.entries({
          field1: {
            id: 'unused',
            name: 'unused',
            type: 'boolean',
          },
        }));

        const objectField = {
          additionalProperties: false,
          fields: objectFields,
          id: '#/definitions/Object',
          name: 'Object',
          required: [],
          type: 'object',
        };

        const field = {
          choices: [objectField],
          id: `#/definitions/${name}`,
          name,
          required: [],
          type,
        };

        expect(generateDeclaration(field, new Map(), DEFAULT_CONFIG)).toMatchSnapshot();
      });

      it(`Should build an ${type} declaration with multiple objects.`, () => {
        const object1Fields = new Map(Object.entries({
          field1: {
            id: 'unused',
            name: 'unused',
            type: 'boolean',
          },
        }));

        const object1Field = {
          additionalProperties: false,
          fields: object1Fields,
          id: '#/definitions/Object1',
          name: 'Object1',
          required: [],
          type: 'object',
        };

        const object2Fields = new Map(Object.entries({
          field2: {
            id: 'unused',
            name: 'unused',
            type: 'boolean',
          },
        }));

        const object2Field = {
          additionalProperties: false,
          fields: object2Fields,
          id: '#/definitions/Object2',
          name: 'Object2',
          required: [],
          type: 'object',
        };


        const field = {
          choices: [object1Field, object2Field],
          id: `#/definitions/${name}`,
          name,
          required: [],
          type,
        };

        expect(generateDeclaration(field, new Map(), DEFAULT_CONFIG)).toMatchSnapshot();
      });

      it(`Should build an ${type} declaration with references.`, () => {
        const lookupTable = new Map(Object.entries({
          // It doesn't matter what the references are for this test.
          '#/definitions/Count1': {
            id: '#/definitions/Count1',
            name: 'Count1',
            type: 'integer'
          },
          '#/definitions/Count2': {
            id: '#/definitions/Count2',
            name: 'Count2',
            type: 'integer'
          },
        }));

        const ref1Field = {
          id: 'unused',
          name: 'unused',
          ref: '#/definitions/Count1',
          type: 'ref',
        };

        const ref2Field = {
          id: 'unused',
          name: 'unused',
          ref: '#/definitions/Count2',
          type: 'ref',
        };

        const field = {
          choices: [ref1Field, ref2Field],
          id: `#/definitions/${name}`,
          name,
          required: [],
          type,
        };

        expect(generateDeclaration(field, lookupTable, DEFAULT_CONFIG)).toMatchSnapshot();
      });
    });
  });


});
