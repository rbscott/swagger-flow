// @flow

import type {
  Field,
  SwaggerComplexType,
} from './types';

// recursive import.
import { parseItemSchema } from './parser';

/**
 * Parse the schema for a Complex Type. If the definition is not for a ComplexType, parseComplexType
 * returns null.
 *
 */
const parseComplexType = (name: string, id: string, itemSchema: Object): ?SwaggerComplexType => {
  const {
    allOf,
    anyOf,
    oneOf,
  } = itemSchema;

  // If none of those properties are set, then ignore it.
  let subTypes = undefined;
  let type = undefined;

  if (allOf) {
    subTypes = allOf;
    type = 'allOf';
  } else if (anyOf) {
    subTypes = anyOf;
    type = 'anyOf';
  } else if (oneOf) {
    subTypes = oneOf;
    type = 'oneOf';
  } else {
    return null;
  }

  if (!Array.isArray(subTypes)) {
    throw new Error(`${name}, ${id} Complex type is not an array ${subTypes}`);
  }

  let required = [];

  const choices = subTypes.map((subType, index) => {
    const subTypeName = `${name}_SubType_${index}`;
    const subTypeId = `${id}/SubType_${index}`;

    return parseItemSchema(subTypeName, subTypeId, subType);
  });

  if (Array.isArray(itemSchema.required)) {
    if (itemSchema.required.filter(i => typeof i !== 'string').length > 0) {
      throw new Error(`All entries in "required" must be strings ${name}, ${itemSchema.required}`);
    }

    required = itemSchema.required;
  }


  return {
    choices,
    id,
    name,
    required,
    type,
  };
};

export default parseComplexType;
