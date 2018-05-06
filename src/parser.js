// @flow

import {
  PRIMITIVE_TYPES,
  PRIMITIVE_TYPE_INTEGER,
  PRIMITIVE_TYPE_NUMBER,
  PRIMITIVE_TYPE_STRING,
} from './types';

import type {
  Field,
  Schema,
  SwaggerArray,
  SwaggerEnum,
  SwaggerObject,
  SwaggerPrimitive,
  SwaggerReference,
} from './types';

import parseArray from './parser-array';
import parseComplexType from './parser-complex';
import parseObject from './parser-object';
import parseMethods from './parser-request';

/**
 * Parse the schema for a primitive type. If the definition is not for a primitive type,
 * return null.
 */
const parsePrimitive = (name: string, id: string, itemSchema: Object): ?SwaggerPrimitive => {
  const { type } = itemSchema;

  if (PRIMITIVE_TYPES.indexOf(type) < 0) {
    return null;
  }

  return {
    id,
    name,
    type: type !== PRIMITIVE_TYPE_NUMBER ? type : PRIMITIVE_TYPE_INTEGER,
  };
};

/**
 * Parse the schema for an enum. If the definition is not for an enum, parseEnum
 * return null.
 */
const parseEnum = (name: string, id: string, itemSchema: Object): ?SwaggerEnum => {
  const enumValues = itemSchema.enum;
  if (!enumValues) {
    return null;
  }

  // Unclear if enums must be strings, but this implementation assumes they are.
  if (itemSchema.type !== PRIMITIVE_TYPE_STRING) {
    throw new Error(`Schema item: ${name}, ${id} is a non-string enum.`);
  }

  if (!Array.isArray(enumValues) || enumValues.filter(e => typeof e !== 'string').length > 0) {
    throw new Error(`Schema item: ${name}, ${id} has a non-string element`);
  }

  return {
    id,
    name,
    type: 'enum',
    values: enumValues,
  };
};

const parseReference = (name: string, id: string, itemSchema: Object): ?SwaggerReference => {
  const ref = itemSchema['$ref'];

  if (typeof ref !== 'string') {
    return null;
  }

  return {
    id,
    name,
    ref,
    type: 'ref',
  };
};

/**
 * Parse the schema for an individual object. This will validate and then return a field.
 * if there is an error, parseItemSchema throws an exception. This handles all of the types
 * defined in types.js.
 */
export const parseItemSchema = (name: string, id: string, itemSchema: Object): Field => {
  const { type } = itemSchema;

  // References are the most basic type and don't require any other fields.
  const ref = parseReference(name, id, itemSchema);
  if (ref) return ref;

  // Complex types defined by allOf do not need type qualifiers.
  const complexType = parseComplexType(name, id, itemSchema);
  if (complexType) return complexType;

  // Swagger Objects typically don't have types, if they specify a properties object
  // they should be ok.
  const swaggerObject = parseObject(name, id, itemSchema);
  if (swaggerObject) return swaggerObject;


  // Type field is required and must be a string.
  // https://tools.ietf.org/html/draft-wright-json-schema-validation-00#section-5.21
  // https://swagger.io/specification/#schemaObject
  if (typeof type !== 'string') {
    debugger;
    throw new Error(`Schema item: ${name}, ${id} is missing a type`);
  }

  const swaggerEnum = parseEnum(name, id, itemSchema);
  if (swaggerEnum) return swaggerEnum;

  const primitive = parsePrimitive(name, id, itemSchema);
  if (primitive) return primitive;

  const swaggerArray = parseArray(name, id, itemSchema);
  if (swaggerArray) return swaggerArray;

  throw new Error('Not implemented');
};

/**
 * Parse the definition section of a schema, return an empty array
 * if it is empty.
 */
const parseSection = (idPrefix: string, sectionOpt: ?Object): Array<Field> => {
  if (!sectionOpt) {
    return [];
  }

  // Flow doesn't work properly for Object.entries, using keys instead,
  // which requires a refined variable to get name.
  const section = sectionOpt;

  return Object.keys(section).map((name: string) => {
    const id = `${idPrefix}/${name}`;
    const itemSchema = section[name];

    if (typeof itemSchema !== 'object') {
      throw new Error(`Invalid entry in definitions: ${name}, ${itemSchema}`);
    }

    return parseItemSchema(name, id, itemSchema);
  });
};

/**
 * Parse the components section of a schema, return an empty array
 * if it is empty. Components can have a number of different sections
 * and this should parse all of them, for now it is just starting with
 * schemas and will ignore the other ones (e.g. responses, parameters,
 * etc).
 */
const parseComponents = (schema: Object): Array<Field> => {
  const { components } = schema;

  if (typeof components !== 'object') {
    return [];
  }

  const schemas = parseSection('#/components/schemas', components.schema);

  return schemas;
};

/**
 * Parser: Convert a Schema Definition from YAML or JSON into a Schema object
 * This should look for objects in the following locations. Brackets indicate
 * whether it has been implemented.
 *   * [x] Definitions
 *   * [ ] Components
 *   * [ ] paths/${url}/${method}/parameters
 *   * [ ] paths/${url}/${method}/responses
 */
const parse = (schema: Object): Schema => {
  const items = [
    ...parseSection('#/definitions', schema.definitions).concat(),
    ...parseComponents(schema),
    ...parseMethods(schema),
  ];

  return {
    items,
  }
};

export default parse;
