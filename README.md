# Recora

![Recora Logo](https://github.com/jacobp100/recora-web/raw/gh-pages/design/icon-calculator-gradient.png?raw=true)

Language processor for [Recora project](https://github.com/jacobp100/recora): a natural language calculator and spreadsheet replacement.

A rewrite of the previous version. Not quite production ready, there will be rough edges. To try the interactive version, clone, `npm install` and `npm run cli`.

# Todo

* Temperatures: they work for absolute temperatures, but temerature differences need to be tested
* Formatting: at least dates need formatting
* Tests: we only have an end-to-end test, which does test a lot of things, but individual components should be tested in isolation
* Locales: allow comma decimal points, UK/US date formats
* Data: there's a lot of units not accounted for
* Abstract units: get `#fff to hsl` working
* Formatting hints: get `800 to base 7` working
* Benchmarking: zero attempt has been made for performance so far

# Examples

See note on it being a rewrite. Some of these might not actually work yet.

Basic

Input | Output
--- | ---
$60 per day for 3 days | $180.00
$15 for the taxi | $15.00
£100 spending money | £100.00

Conversions

Input | Output
--- | ---
100 hong kong dollar to euros | 11.50€
1 meter to yards | 1.09 yards

Complicated conversions

Input | Output
--- | ---
12 stone 8 pounds to kg | 79.8 kilograms
190cm to feet and inches | 6 feet 3 inches
5 ounces at £4.50/kg | £0.64
70 kilometers doing 55 miles per gallon at 2 euros per liter to gbp | £5.16

Date and timezones

Input | Output
--- | ---
21st Sept 2015 until 18th Dec 2016 to hours | 10,896 hours
5pm 22nd June 2016 London in New York | Wed Jun 22 2016 12:00:00 GMT-0400 (Not available in demo)

Maths

Input | Output
--- | ---
sin(3) | 0.141
sinh(4) | 27.3
asinh(27.3) | 4
sinc^2(0.4) | 0.948
log(8) | 2.08
tanc(7) | 0.124

Colour functions

Input | Output
--- | ---
red + green | #ff8000
darken(#f00, 30%) | #660000
mix(#333, #555) | #444444
#500 * #333 | #110000
dodge(#400, #800) | #b90000
#444 to rgb | rgb(68, 68, 68)
#444 to hsl | hsl(0°, 0%, 27%)

# Code Overview

The process is simple: we take input, put it through a tokeniser, generate an abstract syntax tree, and process the result.

The tokeniser is somewhat unconventional, as it generates multiple interpretations of tokens. For example, `1/12/2000` could be interpreted as a date, or as 1 divided by 12 divided by 2000. The tokeniser will prioritise the different interpretations of tokens: in the previous example, the date would be prioritised.

For every interpretation, we generate an abstract syntax tree (AST), which represents the operations that must be performed. Generating an AST can also fail: for example, if you only had two tokens, a number, and a addition operator (+), there isn’t a suitable AST.

Lastly, for every AST generated, we perform all the operations. Again, this can fail: if you try to add 1 meter to 1 joule, the result is not defined.

The result returned from the process is the first defined result.

## Tokeniser

The tokeniser works very similar to [Pygments](http://pygments.org/docs/lexerdevelopment/). Similar to Pygments, each rule has,

* `match`: a regular expression or string to match the current text
* `token`: a token object or a function to create a token object
* `push` and `pop` to edit the parsing stack

We also have a `userState` object, which is provided as an argument to `token` functions, and can be updated with `updateState`. Currently, the `userState` is only used for calculating the bracket levels for syntax highlighting. I wouldn’t recommend doing anything complicated with it.

The biggest difference is that every rule also has a `penalty`. This is because as noted before, the tokeniser generates multiple interpretations of tokens. Positive penalties indicate if you don’t want the token to be interpreted by the rule, or negative if you do. To get the date to take priority over three numbers and two divide symbols, the date penalty must be less than the sum of the alternatives.

## AST Transformation

We now have an array of tokens, we built the AST. We create a list of rules that match and transform token patterns.

To match cases of tokens using something similar to regular expressions. To match an addition case, we’d look for any amount of non-addition tokens, a single addition token, and any amount of tokens. Like regular expressions, this gives us capture groups: for this example, we’d have three.

If we match a case, we perform a transform. The transform takes capture groups, and can either return an array of new tokens, which will then continue AST transformation; a single token, which will not continue AST transformation; or null, which will not continue AST transformation, and will mark the AST invalid. Invalid ASTs will not be resolved. In the addition example: `1 + 2`, the capture groups would be `1`, `+` and `2` in order. We’d return a single `add` token with an arguments property being the first and last capture groups.

Each transformer can recursively transform capture groups. If we had `1 + 2 + 3`, we’d match the first addition operator to give the left-hand-side as `1` and the right as `2 + 3`. The right-hand-side would be recursively transformed using the same rule, and give an addition token. The first addition operator would then have the left-hand-side be a number, and the right be an addition token.

We use multiple transformers to create operator precedence: for example, you would do addition before multiplication (BODMAS in reverse).

## Resolving

The AST represents the exact operations that must be performed, so this step is mostly nothing more than performing the operations. However, for expressions with no clear AST representation, such as `1 foot 3 inches`, this gets put in a miscellaneous group: in this case, `1 meter` and `3 inches`. When resolving these groups, heuristics are used to determine the best thing to do. In this case, because they are both lengths, they are added. However, they can also be multiplied or divided.

# Adding New Types

For this example, we’ll be adding an emotion type. The first thing we’ll need to do is extend the tokeniser to recognise some new tokens. The tokeniser is currently split into two parts: purely generic tokens, such as operators like + and -, and english tokens, which can handle units. It’s not too important at the moment, as only English is supported, but in either one, we can add our own types.

In this example, we’ll be adding emoticons. To get emoticons to show up as tokens, we’ll need to make the following edits to `tokenTypes.js` and `tokenizer.js`.

```js
// tokenTypes.js
export type TOKEN_EMOTICON = 'TOKEN_EMOTICON';
```

```js
// tokenizer.js
import { TOKEN_HAPPY, TOKEN_SAD } from './tokenTypes';

export default {
  emoticons: [
    { match: ':)', token: { type: TOKEN_EMOTICON, value: 1 }, penalty: -10000 },
    { match: ':(', token: { type: TOKEN_EMOTICON, value: -1 }, penalty: -10000 },
  ],
  default: [
    'emoticons',
    ...
  ],
}
```

The penalty is somewhat arbitrary; however, it must be less than the sum of the penalties for both brackets and colons in this case.

Now we’ll need to transform the tokens into nodes. We’ll need to define the node type, but we’ll do that in the next step. For now, we’ll use the PatternMatcher module to find the emoticon tokens, and transform it.

```js
// transformers/emoticon.js
import { Pattern, CaptureOptions, CaptureWildcard } from '../modules/patternMatcher';
import { NODE_EMOTION } from '../modules/math/types';
import { TOKEN_HAPPY, TOKEN_SAD } from '../tokenTypes';

export default {
  pattern: new Pattern([
    new CaptureOptions([TOKEN_HAPPY, TOKEN_SAD]).negate().lazy().any(),
    new CaptureOptions([TOKEN_HAPPY, TOKEN_SAD]),
    new CaptureWildcard().lazy().any(),
  ]),
  transform: (captureGroups, transform) => transform([
    captureGroups[0],
    captureGroups[2],
  ], segments => (
    [].concat(
      segments[0],
      { type: NODE_EMOTION, happiness: captureGroups[1].value, },
      segments[1]
    );
  )),
};
```

Lastly, we’ll need to implement this in the math module. Firstly, we’ll need to define the node type,

```js
// modules/math/types/index.js
export const NODE_EMOTION = 'NODE_EMOTION';
export type EmotionNode = Node &
  { type: 'NODE_EMOTION', happiness: number };
```

And then define some operations around it. We can define any functions, including add, subtract etc. in the functions folder. We’ll also need to expose them in the function definitions.

```js
// modules/math/functions/emotion.js
import { NODE_EMOTION } from '../types';
import { FUNCTION_ADD } from '.';

export const add = (
  context: ResolverContext,
  left: EmotionNode,
  right: EmotionNode
): EmotionNode => {
  return { type: NODE_EMOTION, happiness: left.happiness + right.happiness };
};

// Array of [functionName, [...functionSignature], function]
export default [
  [FUNCTION_ADD, [NODE_EMOTION, NODE_EMOTION], add],
];
```

```js
// modules/math/functions/definitions.js
import emotion from './emotion';

export default [
  ...,
  emotion,
];
```

And lastly, we need to implement the type in the resolver. If your type has special logic, like functions, you can do that here. For this one, we don’t need to do anything other than return the value.

```js
// modules/math/resolve.js
import { NODE_EMOTION } from './types';

const resolver = {
  resolve(value: Node): ?Node {
    switch (value.type) {
      ...
      case NODE_EMOTION:
        return value;
      default:
        return null;
    }
  },
}
```

And that should be all!
