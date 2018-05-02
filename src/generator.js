// @flow

import {
  PRIMITIVE_TYPE_INTEGER,
  PRIMITIVE_TYPES,
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

type LookupTable = Map<string, Field>;

type Config = {|
  // Set to true to never use exact class definitions.
  openClasses: boolean,
|};

/**
 * Generate a type declaration for the given field. this is the body that would go on the
 * left side of the colon or equals sign. The caller is responsible for formatting
 * what this is assigned to.
 */
export const generateDeclaration = (
  field: Field,
  lookupTable: LookupTable,
  config: Config,
): string => {
  const { type, } = field;

  if (type === PRIMITIVE_TYPE_INTEGER) {
    return 'number';
  }

  if (PRIMITIVE_TYPES.indexOf(type) >= 0) {
    return type;
  }

  // The if statements could be a switch statement, but refinement doesn't work inside of a case
  // statement. Also, you have to use field.type, otherwise flow doesn't handle refinement
  // properly.
  if (field.type === 'allOf') {
    const { choices } = field;

    if (choices.length === 0) {
      return '/* allOf without types, using mixed. */ mixed';
    }

    // Assuming that complex types are for objects, this will not work for other types.
    const declarations = choices.map((choice) => {
      return `...${generateDeclaration(choice, lookupTable, config)}`;
    })
    .sort()
    .join(', ');

    // Not sure if exact should be used here?
    return `{ ${declarations} }`;

  // anyOf and oneOf are slightlty different, but there doesn't appear to be a way to model
  // oneOf in flow. Using the same logic for both.
  } else if (field.type === 'anyOf' || field.type === 'oneOf') {
    const { choices } = field;

    if (choices.length === 0) {
      return `/* ${field.type} without types, using mixed. */ mixed`;
    }

    // Assuming that complex types are for objects, this will not work for other types.
    const declarations = choices.map((choice) => {
      return generateDeclaration(choice, lookupTable, config);
    })
    .sort()
    .join(' | ');

    return `( ${declarations} )`;

  } else if (field.type === 'enum') {
    const values = field.values
      .sort()
      .map(value => JSON.stringify(value))
      .join(' | ');

    return `(${values})`;
  } else if (field.type === 'array') {
    const declaration = (field.items) ?
      generateDeclaration(field.items, lookupTable, config) : 'mixed';

      return `Array<${declaration}>`;

  } else if (field.type === 'ref') {
    const { ref } = field;
    const refField = lookupTable.get(ref);

    return refField ? refField.name : `/* the ref: '${ref}' is missing, defaulting to mixed */ mixed`;

  } else if (field.type === 'object') {
    // If additional properties are allowed, do not use the exact class
    // definition.
    const exact = (config.openClasses || field.additionalProperties) ? '' : '|';
    const { required } = field;

    const fields = Array.from(field.fields.entries()).map(([name, objectField]) => {
      const option = (required.indexOf(name) >= 0) ? '' : '?';
      return `${name}: ${option}${generateDeclaration(objectField, lookupTable, config)}`;
    })
    .sort()
    .join(', ');

    return `{${exact} ${fields} ${exact}}`;

  }

  return '';
};

/**
 * Given a list of items, generate a map from the ID of an Item to the field.
 */
const buildLookupTable = (items: Array<Field>): LookupTable => {
  const lookupTable = new Map();

  items.forEach((item) => {
    lookupTable.set(item.id, item);
  });

  return lookupTable;
};

const generateFlowTypes = (schema: Schema, config: Config): string => {
  const lookupTable = buildLookupTable(schema.items);

  return schema.items.reduce((accum, item) => {
    const declaration = generateDeclaration(item, lookupTable, config);

    return accum.concat(`export type ${item.name} = ${declaration};`);
  }, [])
  .join('\n\n');
};

export default generateFlowTypes;
