// @flow

import { parseItemSchema } from './parser';
import type { ParserConfig } from './parser';

import type {
  Field,
  FieldMap,
  SwaggerObject,
} from './types';

const upperCaseFirstLetter = (value: string): string => {
  return value.replace(/^([a-z]?)/, (match, firstChar) => firstChar.toUpperCase());
}

const nameOperation = (
  prefix: string,
  path: string,
  method: string,
  operationId: ?string,
  controller: ?string,
): string => {
  if (operationId) {
    return `${prefix}${upperCaseFirstLetter(controller ? controller : '')}${upperCaseFirstLetter(operationId)}`;
  }

  return `/${path}/${method}`
    // Remove all double slashes
    .replace(/\/\/+/g, '/')
    // Change any parameters to the string For${ParameterName}
    .replace(/\{(.*?)\}/g, (match, name) => 'For' + upperCaseFirstLetter(name))
    // Remove all slashes, and then capitalize the next character.
    .replace(/\/(.)/g, (match, firstChar) => firstChar.toUpperCase())
    .replace(/^/, prefix);
}

const getParameterSchema = (parameter: Object): Object => {
  if (typeof parameter.schema === 'object' && parameter.in === 'body') {
    return parameter.schema;
  }

  return parameter;
};

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
      const parameterSchema = getParameterSchema(parameter);

      return {
        ...accum,
        [parameter.name]: parseItemSchema(parameterName, parameterId, parameterSchema),
      }
    }, {});
}

const parseMethodParameters = (
  path: string,
  method: string,
  methodSchema: Object,
  inheritedParameters: FieldMap,
  controller: ?string,
  splitBody: boolean,
): {| main: ?SwaggerObject, body: ?Field |} => {
  const result = {
    main: undefined,
    body: undefined,
  };

  if (typeof methodSchema !== 'object') {
    return result;
  }

  if (!Array.isArray(methodSchema.parameters)) {
    return result;
  }

  const { parameters } = methodSchema;

  const [main, body] = parameters.reduce((accum, parameter) => {
    // Don't need file parameters for now.
    if (parameter.type === 'file') {
      return accum;
    }

    const [main, body] = accum;

    if (!splitBody) {
      return [main.concat(parameter), body];
    }

    if (parameter.in === 'body' && parameter.name === 'body') {
      if (body) {
        console.log('Multiple body parameters, using first one');
        return [main, body];
      }

      return [main, parameter];
    }

    return [main.concat(parameter), body];
  }, [[], undefined]);

  const name = nameOperation('Rqst', path, method, methodSchema.operationId, controller);

  const fieldsArray = main
    .map((parameter) => {
      const parameterName = `${name}_Field_${parameter.name}`;
      const parameterId = `#${path}/${method}/${parameter.name}`;
      const parameterSchema = getParameterSchema(parameter);

      return [
        parameter.name,
        parseItemSchema(parameterName, parameterId, parameterSchema)
      ];
    });

  const fields = new Map([
    ...Object.entries(inheritedParameters),
    ...fieldsArray
  ]);

  result.main = {
    // TODO: Figure out how to set this properly.
    additionalProperties: false,
    fields,
    id: `#${path}/${method}`,
    name,
    // TODO: Update this with the required fields.
    required: [],
    type: 'object',
  };

  if (body) {
    const bodySchema = getParameterSchema(body);
    const bodyName = `${name}Body`;
    const bodyId = `#${path}/${method}/body`;
    result.body = parseItemSchema(bodyName, bodyId, bodySchema);
  }

  return result;
}

const parseMethodResponses = (
  path: string,
  method: string,
  methodSchema: Object,
  controller: ?string,
): Array<Field> => {
  if (typeof methodSchema.responses !== 'object') {
    return [];
  }

  const { responses } = methodSchema;

  const choices = Object.keys(responses).reduce((accum, code) => {
    if (typeof responses[code] !== 'object' || typeof responses[code].schema !== 'object') {
      return accum;
    }

    const responseSchema  = responses[code].schema;

    if (responseSchema.type === 'file') {
      return accum;
    }

    // Append the method with the code so each response has a unique name.
    const operationId = (typeof methodSchema.operationId === 'string') ?
      `${methodSchema.operationId}${upperCaseFirstLetter(code)}` : null;

    const responseCode = nameOperation(
      'Resp',
      path,
      // Append the method with the code so each response has a unique name.
      `${method}/${code}`,
      operationId,
      controller,
    );
    const responseCodeId = `#${path}/${method}/${code}`;

    return accum.concat(parseItemSchema(responseCode, responseCodeId, responseSchema));
  }, []);

  if (choices.length === 0) {
    return [];
  }

  const responseName = nameOperation(
    'Resp',
    path,
    `${method}`,
    methodSchema.operationId,
    controller,
  );
  const responseId = `#${path}/${method}`;

  const choiceReferences = choices.map((choice) => {
    return {
      id: `${path}/choices/${choice.name}`,
      name: `${responseName}_Ref_${choice.name}`,
      type: 'ref',
      ref: choice.id,
    };
  })

  return choices.concat({
    choices: choiceReferences,
    id: responseId,
    name: responseName,
    // TODO: Figure out what should be specified here.
    required: [],
    type: 'anyOf',
  });
};

/**
 * Parse all of the parameters and responses for each request and create a schema for them.
 */
const parseMethods = (schema: Object, config: ParserConfig): Array<Field> => {
  if (typeof schema.paths !== 'object') {
    return [];
  }

  const { paths } = schema;
  const {
    controllerKey,
    splitBody,
  } = config;

  const globalParameters = parseParametersArray('/parameters', 'parameters', schema.parameters);

  return Object.keys(paths).reduce((accum1, path) => {
    if (typeof paths[path] !== 'object') {
      return accum1;
    }

    const definition = paths[path];
    const pathController = (typeof definition[controllerKey] === 'string') ?
      definition[controllerKey] : undefined;

    const pathName = nameOperation('', path, '', undefined);

    const inheritedParameters = {
      ...globalParameters,
      ...parseParametersArray(path, pathName, definition.parameters),
    };

    return Object.keys(definition).reduce((accum2, method) => {
      const methodSchema = definition[method];

      if (typeof methodSchema !== 'object' || typeof method !== 'string') {
        return accum1;
      }

      const methodController = (typeof methodSchema[controllerKey] === 'string') ?
        methodSchema[controllerKey] : pathController;

      const {
        main,
        body,
      } = parseMethodParameters(
        path, method, methodSchema, inheritedParameters, methodController, splitBody,
      );
      const methodResponses = parseMethodResponses(path, method, methodSchema, methodController);
      return accum2.concat(main || [], body || [], methodResponses);
    }, accum1);

  }, []);
};

export default parseMethods;
