// @flow
import {
  TOKEN_OPERATOR_EXPONENT,
  TOKEN_OPERATOR_MULTIPLY,
  TOKEN_OPERATOR_DIVIDE,
  TOKEN_OPERATOR_ADD,
  TOKEN_OPERATOR_SUBTRACT,
  TOKEN_OPERATOR_NEGATE,
} from './tokenNodeTypes';
import createTransformer from './modules/createTransformer';
import bracketTransform from './transformers/bracketTransform';
import {
  createForwardOperatorTransform, createBackwardOperatorTransform,
} from './transformers/createOperatorTransform';
import conversionTransform from './transformers/conversionTransform';
import entityTransform from './transformers/entityTransform';

export default createTransformer([
  conversionTransform,
  bracketTransform,
  createForwardOperatorTransform([TOKEN_OPERATOR_ADD, TOKEN_OPERATOR_SUBTRACT]),
  createForwardOperatorTransform([TOKEN_OPERATOR_MULTIPLY, TOKEN_OPERATOR_DIVIDE]),
  createBackwardOperatorTransform([TOKEN_OPERATOR_EXPONENT, TOKEN_OPERATOR_NEGATE]),
  entityTransform,
]);
