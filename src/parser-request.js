// @flow

import titleCase from 'title-case';

import { parseItemSchema } from './parser';
import type {
  Field,
  FieldMap,
  SwaggerObject,
} from './types';

const nameOperation = (path: string, method: string, operationId: ?string): string => {
  if (operationId) {
    // Prefixing with T so that is clear it is a type.
    return `T${titleCase(operationId)}`;
  }

  return `/${path}/${method}`
    // Remove all double slashes
    .replace(/\/\/+/g, '/')
    // Change any parameters to the string For${ParameterName}
    .replace(/\{(.*?)\}/g, (match, name) => 'For' + titleCase(name))
    // Remove all slashes, and then capitalize the next character.
    .replace(/\/(.)/g, (match, firstChar) => firstChar.toUpperCase())
    // Prefix with a T so that it is clear it is a type.
    .replace(/^/, 'T');
}

const parseParametersArray = (path: string, name: string, parameters: Object): FieldMap => {
  if (!Array.isArray(parameters)) {
    return {};
  }

  return parameters
    .filter((parameter) => {
      return (typeof parameter === 'object' && parameter && parameter.type !== 'file');
    })
    .reduce((accum, parameter) => {
      if (typeof parameter.name !== 'string') {
        return accum;
      }

      const parameterName = `${name}_Field_${parameter.name}`;
      const parameterId = `#${path}/${parameter.name}`;

      return {
        ...accum,
        [parameter.name]: parseItemSchema(parameterName, parameterId, parameter),
      }
    }, {});
}

const parseMethod = (
  path: string,
  method: string,
  methodSchema: Object,
  inheritedParameters: FieldMap,
  ): ?SwaggerObject => {
  if (typeof methodSchema !== 'object') {
    return null;
  }

  const { parameters } = methodSchema;

  if (!Array.isArray(parameters)) {
    return null;
  }

  const name = nameOperation(path, method,  methodSchema.operationId);

  const fieldsArray = parameters
    .filter((parameter) => {
      return (parameter.type !== 'file');
    })
    .map((parameter) => {
      const parameterName = `${name}_Field_${parameter.name}`;
      const parameterId = `#${path}/${parameter.name}`;

      return [
        parameter.name,
        parseItemSchema(parameterName, parameterId, parameter)
      ];
    });

  const fields = new Map([
    ...Object.entries(inheritedParameters),
    ...fieldsArray
  ]);

  return {
    // TODO: Figure out how to set this properly.
    additionalProperties: false,
    fields,
    id: `#${path}/${method}`,
    name,
    // TODO: Update this with the required fields.
    required: [],
    type: 'object',
  };
}

/**
 * Parse all of the parameters for each request and create a schema for them.
 */
const parseParameters = (schema: Object): Array<Field> => {
  if (typeof schema.paths !== 'object') {
    return [];
  }

  const { paths } = schema;

  const globalParameters = parseParametersArray('/parameters', 'parameters', schema.parameters);

  // TODO Need to add global parameters
  // TODO Need to add path level parameters

  return Object.keys(paths).reduce((accum1, path) => {
    if (typeof paths[path] !== 'object') {
      return accum1;
    }

    const definition = paths[path];

    const pathName = nameOperation(path, '', null);

    const inheritedParameters = {
      ...globalParameters,
      ...parseParametersArray(path, pathName, definition.parameters),
    };

    return Object.keys(definition).reduce((accum2, method) => {
      const methodSchema = definition[method];

      if (typeof methodSchema !== 'object' || typeof method !== 'string') {
        return accum1;
      }

      const methodField = parseMethod(path, method, methodSchema, inheritedParameters);

      return accum2.concat(methodField || []);
    }, accum1);

  }, []);
};

export default parseParameters;