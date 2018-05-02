
import { generateDeclaration } from '../src/generator';
import { PRIMITIVE_TYPES } from '../src/types';

describe('generateDeclaration', () => {
  const DEFAULT_CONFIG = { openClasses: true };
  const STRICT_CONFIG = { openClasses: false };

  /*******
   * array
   *******/

  describe('array', () => {
    it(`Should build an array declaration.`, () => {
      const field = {
        id: '#definitions/Array',
        items: {
          id: 'unused',
          name: 'unused',
          type: 'boolean',
        },
        name: 'Array',
        type: 'array',
      };

      expect(generateDeclaration(field, new Map(), DEFAULT_CONFIG)).toMatchSnapshot();
    });

    it(`Should use mixed if items is undefined.`, () => {
      const field = {
        id: '#definitions/Array',
        items: undefined,
        name: 'Array',
        type: 'array',
      };

      expect(generateDeclaration(field, new Map(), DEFAULT_CONFIG)).toMatchSnapshot();
    });

    it(`Should build an array declaration with a reference type.`, () => {
      const lookupTable = new Map(Object.entries({
        '#definitions/Count': {
          id: '#definitions/Count',
          name: 'Count',
          type: 'integer'
        },
      }));

      const field = {
        id: '#definitions/Array',
        items: {
          id: 'unused',
          name: 'unused',
          ref: '#definitions/Count',
          type: 'ref',
        },
        name: 'Array',
        type: 'array',
      };

      expect(generateDeclaration(field, lookupTable, DEFAULT_CONFIG)).toMatchSnapshot();
    });

  });

  /*******
   * enum
   *******/

  describe('enum', () => {
    it(`Should build a basic declaration for an enum.`, () => {
      const field = {
        id: '#definitions/Enum',
        name: 'Enum',
        type: 'enum',
        values: ['value1', 'value2', 'value3'],
      };

      expect(generateDeclaration(field, new Map(), DEFAULT_CONFIG)).toMatchSnapshot();
    });

    it(`Should sort the enum values.`, () => {
      const field = {
        id: '#definitions/Enum',
        name: 'Enum',
        type: 'enum',
        values: ['red', 'green', 'blue'],
      };

      expect(generateDeclaration(field, new Map(), DEFAULT_CONFIG)).toMatchSnapshot();
    });
  });

  /*******
   * object
   *******/

  describe('object', () => {
    it(`Should build a basic object declaration.`, () => {
      const fields = new Map(Object.entries({
        field1: {
          id: 'unused',
          name: 'unused',
          type: 'boolean',
        },
      }));

      const field = {
        additionalProperties: false,
        fields: fields,
        id: '#definitions/Object',
        name: 'Object',
        required: [],
        type: 'object',
      };

      expect(generateDeclaration(field, new Map(), DEFAULT_CONFIG)).toMatchSnapshot();
    });

    it(`Should build an exact object declaration.`, () => {
      const fields = new Map(Object.entries({
        field1: {
          id: 'unused',
          name: 'unused',
          type: 'boolean',
        },
      }));

      const field = {
        additionalProperties: false,
        fields: fields,
        id: '#definitions/Object',
        name: 'Object',
        required: [],
        type: 'object',
      };

      expect(generateDeclaration(field, new Map(), STRICT_CONFIG)).toMatchSnapshot();
    });

    it(`Should build a loose object declaration if additionalProperties is set.`, () => {
      const fields = new Map(Object.entries({
        field1: {
          id: 'unused',
          name: 'unused',
          type: 'boolean',
        },
      }));

      const field = {
        additionalProperties: true,
        fields: fields,
        id: '#definitions/Object',
        name: 'Object',
        required: [],
        type: 'object',
      };

      expect(generateDeclaration(field, new Map(), STRICT_CONFIG)).toMatchSnapshot();
    });

    it(`Should build a basic object with multiple fields declaration.`, () => {
      const fields = new Map(Object.entries({
        field1: {
          id: 'unused',
          name: 'unused',
          type: 'boolean',
        },
        field2: {
          id: 'unused',
          name: 'unused',
          type: 'boolean',
        },
      }));

      const field = {
        additionalProperties: false,
        fields: fields,
        id: '#definitions/Object',
        name: 'Object',
        required: [],
        type: 'object',
      };

      expect(generateDeclaration(field, new Map(), DEFAULT_CONFIG)).toMatchSnapshot();
    });

    it(`Should build a nested object with multiple fields declaration.`, () => {
      const fields = new Map(Object.entries({
        field1: {
          id: 'unused',
          name: 'unused',
          type: 'boolean',
        },
        field2: {
          additionalProperties: false,
          fields: new Map(Object.entries({
            nestedField1: {
              id: 'unused',
              name: 'unused',
              type: 'string',
            },
          })),
          id: '#definitions/Object',
          name: 'Object',
          required: [],
          type: 'object',
        },
      }));

      const field = {
        additionalProperties: false,
        fields: fields,
        id: '#definitions/Object',
        name: 'Object',
        required: [],
        type: 'object',
      };

      expect(generateDeclaration(field, new Map(), DEFAULT_CONFIG)).toMatchSnapshot();
    });

  });

  /*******
   * primitives
   *******/

  describe('primitives', () => {
    PRIMITIVE_TYPES.forEach((type) => {
      it(`Should build a declaration for a ${type} primitive`, () => {
        const field = {
          id: '#definitions/Primitive',
          name: 'Primitive',
          type,
        };

        expect(generateDeclaration(field, new Map(), DEFAULT_CONFIG)).toMatchSnapshot();
      });
    });
  });

  /*******
   * ref
   *******/

  describe('ref', () => {
    it(`Should build a declaration for a ref.`, () => {
      const lookupTable = new Map(Object.entries({
        '#definitions/Count': {
          id: '#definitions/Count',
          name: 'Count',
          type: 'integer'
        },
      }));

      const field = {
        id: '#definitions/Ref',
        name: 'Ref',
        ref: '#definitions/Count',
        type: 'ref',
      };

      expect(generateDeclaration(field, lookupTable, DEFAULT_CONFIG)).toMatchSnapshot();
    });

    it(`Should use "mixed" if the ref doesn't exist.`, () => {
      const field = {
        id: '#definitions/Ref',
        name: 'Ref',
        ref: '#definitions/Missing',
        type: 'ref',
      };

      expect(generateDeclaration(field, new Map(), DEFAULT_CONFIG)).toMatchSnapshot();
    });

  });
});
