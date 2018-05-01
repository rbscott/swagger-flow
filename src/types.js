// @flow

type FieldBase = {|
  name: string,

  // Unique identifier used to resolve references.
  id: string,
|};

export type SwaggerArray = {|
  items: Field,
  type: 'array',
  ...FieldBase,
|};

export type SwaggerEnum = {|
  values: Array<string>,
  type: 'enum',
  ...FieldBase,
|};

export type SwaggerObject = {|
  fields: Array<Field>,
  type: 'object',
  ...FieldBase,
|};

export type SwaggerPrimitive = {|
  // There are some refinements that could happen here such as regular expressions,
  // etc, but for now just keep it simple.
  type: (
    'boolean' |
    'integer' |
    'null' |
    'string'
  ),
  ...FieldBase,
|};

export type Field = (
  SwaggerEnum |
  SwaggerObject |
  SwaggerPrimitive |
  SwaggerArray
);

export type Schema = {|
  items: Array<Field>,
  lookupTable: Map<string, Field>,
|};

export type Definition = ({|
  type: 'schema',
  schema: Schema
|} | {|
  type: 'field',
  field: Field
|});