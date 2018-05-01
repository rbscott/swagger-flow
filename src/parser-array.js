// @flow

import type {
  Field,
  SwaggerArray,
} from './types';

// recursive import.
import { parseItemSchema } from './parser';

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
    items,
  } = itemSchema;

  const swaggerArray = {
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
  } else {
    // Could do additional validation, technically the only valid
    // value for items is an object, and array or undefined.
    // https://swagger.io/specification/#schemaObject -> items must be an object.
  }

  return swaggerArray;
};

export default parseArray;
