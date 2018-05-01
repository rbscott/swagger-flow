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
  // This will treat anything that has properties set as an object.
  if (itemSchema.type !== 'object' && typeof itemSchema.properties !== 'object') {
    return null;
  }

  const { properties } = itemSchema;

  const fields = Object.keys(properties).map((key) => {
    const fieldSchema = properties[key];

    const fieldName = `${name}_Field_${key}`
    const fieldId = `${name}/Field_${key}`

    return parseItemSchema(fieldName, fieldId, fieldSchema);
  });

  return {
    fields,
    id,
    name,
    type: 'object',
  };
};

export default parseObject;