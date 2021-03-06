// @flow
import {
  TOKEN_OPERATOR_EXPONENT,
  TOKEN_OPERATOR_MULTIPLY,
  TOKEN_OPERATOR_DIVIDE,
  TOKEN_OPERATOR_ADD,
  TOKEN_OPERATOR_SUBTRACT,
  TOKEN_OPERATOR_NEGATE,
  TOKEN_OPERATOR_FACTORIAL,
} from './tokenTypes';
import createTransformer from './modules/transformer';
import assignmentTransform from './transformers/assignmentTransform';
import bracketTransform from './transformers/bracketTransform';
import commaTransform from './transformers/commaTransform';
import {
  createForwardOperatorTransform, createBackwardOperatorTransform,
} from './transformers/createOperatorTransform';
import functionShorthandTransform from './transformers/functionShorthandTransform';
import conversionTransform from './transformers/conversionTransform';
import percentTransform from './transformers/percentTransform';
import entityTransform from './transformers/entityTransform';
import remainingTokensTransform from './transformers/remainingTokensTransform';
import miscGroupTransform from './transformers/miscGroupTransform';

export default createTransformer([
  assignmentTransform,
  conversionTransform,
  bracketTransform,
  commaTransform,
  createForwardOperatorTransform([TOKEN_OPERATOR_ADD, TOKEN_OPERATOR_SUBTRACT]),
  createForwardOperatorTransform([TOKEN_OPERATOR_MULTIPLY, TOKEN_OPERATOR_DIVIDE]),
  functionShorthandTransform,
  createBackwardOperatorTransform([TOKEN_OPERATOR_EXPONENT, TOKEN_OPERATOR_NEGATE]),
  createForwardOperatorTransform([TOKEN_OPERATOR_FACTORIAL]),
  remainingTokensTransform,
  percentTransform,
  entityTransform,
  miscGroupTransform,
]);
