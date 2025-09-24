# tree-sitter-cspaced

A [Tree-sitter](https://tree-sitter.github.io/tree-sitter/) grammar for cspaced, an indentation-based variant of the C programming language.

## Installation

### As a Node.js Module

```bash
npm install tree-sitter-cspaced
```

### Manual Installation

```bash
git clone https://github.com/yourusername/tree-sitter-cspaced.git
cd tree-sitter-cspaced
npm install
npm run build
```

## Usage

```javascript
const Parser = require('tree-sitter');
const Cspaced = require('tree-sitter-cspaced');

const parser = new Parser();
parser.setLanguage(Cspaced);

const sourceCode = `
if (condition):
    printf("Hello cspaced!")
    x = 42

for (int i = 0; i < 10; i++):
    total += i
`;

const tree = parser.parse(sourceCode);
console.log(tree.rootNode.toString());
```

## Language Features

cspaced is an indentation-based dialect of C that supports:

- **Significant Indentation**: 2-space indentation replaces braces
- **Optional Semicolons**: Inferred from newlines
- **Full C Compatibility**: All C constructs supported
- **Clean Syntax**: More readable than traditional C

### Examples

```cspaced
// cspaced syntax
#include <stdio.h>

int fibonacci(int n):
    if (n <= 1):
        return n
    else:
        return fibonacci(n - 1) + fibonacci(n - 2)

int main(void):
    printf("Hello World!\n")
    return 0
```

Generates equivalent C code with braces and semicolons.

## Grammar Structure

The grammar supports all C constructs with modified block syntax:

- Functions: `type function_name(parameters):`
- Control Flow: `if (condition):`, `while (condition):`, `for (init; cond; update):`
- Declarations: Standard C declarations with optional semicolons
- Expressions: Full C expression syntax
- Preprocessor: All standard directives

## Integration with Editors

### Vim/Neovim

Using vim-plug:
```vim
Plug 'tree-sitter/tree-sitter'
Plug 'yourusername/tree-sitter-cspaced'
```

### VS Code

Using the tree-sitter-syntax-highlighting extension or custom language server.

## Development

### Building the Grammar

```bash
npm install
npm run build
```

### Testing

```bash
npm test
```

### Debugging

```bash
# Generate parse trees for test files
npm run parse examples/test.csp
```

## Architecture

```
├── grammar.js          # Main grammar definition
├── src/               # Generated parser source
├── binding.gyp        # Native compilation
├── package.json       # NPM package config
└── test/             # Test files
```

## Contributor Guide

1. **Grammar Rules**: Defined in `grammar.js` using Tree-sitter DSL
2. **External Scanners**: Handle significant indentation via `externals`
3. **Precedences**: Define operator precedence conflicts
4. **Conflicts**: Resolve ambiguities with optional semicolons

## Related Projects

- [cspaced](https://github.com/yourusername/cspaced) - The main cspaced compiler
- [language-cspaced](https://github.com/yourusername/language-cspaced) - VS Code extension
- [vim-cspaced](https://github.com/yourusername/vim-cspaced) - Vim plugin

## License

MIT License
