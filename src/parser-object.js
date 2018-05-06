// @flow

import type {
  Field,
  SwaggerObject,
} from './types';

// recursive import.
import { parseItemSchema } from './parser';

/**
 * Parse the schema for a primitive type. If the definition is not for a primitive type,
 * return null.
 */
const parseObject = (name: string, id: string, itemSchema: Object): ?SwaggerObject => {
  // Treat anything that has properties set (or a type object) as an object.
  if (itemSchema.type !== 'object' && typeof itemSchema.properties !== 'object') {
    return null;
  }

  const {
    additionalProperties,
    properties,
    required,
  } = itemSchema;

  const fields = new Map();

  Object.keys(properties || {}).forEach((key) => {
    const fieldSchema = properties[key];

    const fieldName = `${name}_Field_${key}`;
    const fieldId = `${id}/Field_${key}`;

    fields.set(key, parseItemSchema(fieldName, fieldId, fieldSchema));
  });

  const swaggerObject = {
    additionalProperties: undefined,
    fields,
    id,
    name,
    required: [],
    type: 'object',
  };

  if (typeof additionalProperties === 'boolean') {
    swaggerObject.additionalProperties = additionalProperties;
  } else if (typeof additionalProperties === 'object') {
    const addName = `${name}_AdditionalPropType`;
    const addId = `${id}/AdditionalPropType`;

    swaggerObject.additionalProperties = parseItemSchema(addName, addId, additionalProperties);
  }

  if (Array.isArray(required)) {
    if (required.filter(i => typeof i !== 'string').length > 0) {
      throw new Error(`All entries in "required" must be strings ${name}, ${required}`);
    }

    swaggerObject.required = required;
  }

  return swaggerObject;
};

export default parseObject;
