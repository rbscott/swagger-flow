// @flow

import {
  PRIMITIVE_TYPES,
  PRIMITIVE_TYPE_INTEGER,
  PRIMITIVE_TYPE_NUMBER,
  PRIMITIVE_TYPE_STRING,
} from './types';

import type {
  Definition,
  Field,
  Schema,
  SwaggerArray,
  SwaggerEnum,
  SwaggerObject,
  SwaggerPrimitive,
} from './types';

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
    debugger;
    throw new Error(`Schema item: ${name}, ${id} has a non-string element`);
  }

  return {
    id,
    name,
    type: 'enum',
    values: enumValues,
  };
};

/**
 * Parse the schema for an Array. If the definition is not for an Array, parseArray
 * returns null.
 *
 */
const parseArray = (name: string, id: string, itemSchema: Object): ?SwaggerArray => {
  if (itemSchema.type !== 'array') {
    return null;
  }

  const {
    additionalItems,
    items,
  } = itemSchema;

  const swaggerArray = {
    additionalItems: undefined,
    id,
    items: undefined,
    name,
    type: 'array',
  };

  // For all of these cases, the name and ID will not be displayed since it isn't a root level
  // definition, but it will be useful for debugging.
  if (typeof items === 'object') {
    const itemName = `${name}_ArrayType`;
    const itemId = `${id}/ArrayType`;

    swaggerArray.items = parseItemSchema(itemName, itemId, items);
  } else if (Array.isArray(items)) {
    swaggerArray.items = items.map((item, index) => {
      const itemName = `${name}_${index}_ArrayType`;
      const itemId = `${id}/${index}_ArrayType`;

      return parseItemSchema(itemName, itemId, items);
    });
  } else {
    // Could do additional validation, technically the only valid
    // value for items is an object, and array or undefined.
  }

  if (typeof additionalItems === 'boolean') {
    swaggerArray.additionalItems = additionalItems;
  } else if (typeof additionalItems === 'object') {
    const itemName = `${name}_AdditionalArrayType`;
    const itemId = `${id}/AdditionalArrayType`;

    swaggerArray.additionalItems = parseItemSchema(itemName, itemId, additionalItems);
  } else {
    // Could do additional validation, technically the only valid
    // value for additionalItems is a boolean or an object.
  }

  return swaggerArray;
};

/**
 * Parse the schema for an individual object. This will validate and then return a field.
 * if there is an error, parseItemSchema throws an exception. This handles all of the types
 * defined in types.js.
 */
const parseItemSchema = (name: string, id: string, itemSchema: Object): Field => {
  const { type } = itemSchema;

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
const parseDefinitions = (definitionsOpt: ?Object): Array<Field> => {
  if (!definitionsOpt) {
    return [];
  }

  // Flow doesn't work properly for Object.entries (), and complains
  const definitions = definitionsOpt;

  return Object.keys(definitions).map((name: string) => {
    const id = `definitions/${name}`;
    const itemSchema = definitions[name];

    if (typeof itemSchema !== 'object') {
      throw new Error(`Invalid entry in definitions: ${name}, ${itemSchema}`);
    }
    return parseItemSchema(name, id, itemSchema);
  });
};

/**
 * Given a list of items, generate a map from the ID of an Item to the field.
 */
const buildLookupTable = (items: Array<Field>): Map<string, Field> => {
  const lookupTable = new Map();

  items.forEach((item) => {
    lookupTable.set(item.id, item);
  });

  return lookupTable;
};

/**
 * Parser: Convert a Schema Definition from YAML or JSON into a Schema object
 * This should look for objects in the following locations. Brackets indicate
 * whether it has been implemented.
 *   * [ ] Definitions
 *   * [ ] Components
 *   * [ ] paths/${url}/${method}/parameters
 *   * [ ] paths/${url}/${method}/responses
 */

const parse = (schema: Object): Schema => {
  const items = parseDefinitions(schema.definitions);
  const lookupTable = buildLookupTable(items);

  return {
    items,
    lookupTable,
  }
};

export default parse;
