/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

/**
 * Tree-Sitter Grammar for cspaced
 *
 * cspaced is an indentation-based variant of C that replaces braces with
 * Python-style significant indentation and optional semicolons.
 */

module.exports = grammar({
  name: 'cspaced',

  extras: $ => [
    /\s/
  ],

  // Reserved words that function as word boundaries
  word: $ => $.identifier,

  // External scanner for handling significant indentation
  externals: $ => [
    $._indent,
    $._dedent,
    $._newline
  ],

  // Operator precedence (same as C)
  precedences: $ => [
    [
      'multiplication',
      'addition',
      'shift',
      'relational',
      'equality',
      'bitwise_and',
      'bitwise_xor',
      'bitwise_or',
      'logical_and',
      'logical_or',
    ],
    ['assignment'],
    ['unary'],
    ['call', $.unary_expression],
    ['member', $.unary_expression],
    ['sizeof', $.unary_expression],
  ],

  // Conflict resolution for optional semicolons
  conflicts: $ => [
    [$.expression_statement, $.declaration],
    [$.compound_statement, $.block_item_list],
  ],

  rules: {
    // === TOP LEVEL ===
    translation_unit: $ => repeat(
      choice(
        $.external_declaration,
        $.empty_statement
      )
    ),

    external_declaration: $ => choice(
      $.function_definition,
      $.declaration,
      $.preproc_directive,
      $.empty_statement
    ),

    // === PREPROCESSOR ===
    preproc_directive: $ => choice(
      $.preproc_include,
      $.preproc_define,
      $.preproc_if,
      $.preproc_ifdef,
      $.preproc_else,
      $.preproc_endif,
      $.preproc_undef,
      $.preproc_pragma,
      $.preproc_line,
      $.preproc_error
    ),

    preproc_include: $ => seq(
      '#include',
      choice(
        seq('<', /.+/, '>'),
        seq('"', /.+/, '"')
      )
    ),

    preproc_define: $ => seq(
      '#define',
      $.identifier,
      optional($._preproc_define_value)
    ),

    _preproc_define_value: $ => choice(
      /.+/,
      $._parenthesized_parameter_list
    ),

    preproc_if: $ => seq('#if', $._preproc_expression),
    preproc_ifdef: $ => seq('#ifdef', $.identifier),
    preproc_else: $ => seq('#else'),
    preproc_endif: $ => seq('#endif'),
    preproc_undef: $ => seq('#undef', $.identifier),
    preproc_pragma: $ => seq('#pragma', /.+/),
    preproc_line: $ => seq('#line', /.+/),
    preproc_error: $ => seq('#error', /.+/),

    _preproc_expression: $ => /.+/,

    // === DECLARATIONS ===
    declaration: $ => seq(
      $.declaration_specifiers,
      optional($._init_declarator_list),
      optional(';')
    ),

    declaration_specifiers: $ => repeat1(
      choice(
        $.storage_class_specifier,
        $.type_qualifier,
        $.function_specifier,
        $.type_specifier,
        $.alignment_specifier
      )
    ),

    storage_class_specifier: $ => choice(
      'auto', 'register', 'static', 'extern', 'typedef', '_Thread_local'
    ),

    type_qualifier: $ => choice(
      'const', 'restrict', 'volatile', '_Atomic'
    ),

    function_specifier: $ => choice(
      'inline', '_Noreturn'
    ),

    type_specifier: $ => choice(
      // Basic types
      'void', 'char', 'short', 'int', 'long', 'float', 'double',
      'signed', 'unsigned', '_Bool', '_Complex', '_Imaginary',
      // Complex types
      $.struct_specifier,
      $.union_specifier,
      $.enum_specifier,
      $.typedef_name
    ),

    struct_specifier: $ => choice(
      seq('struct', $.identifier, '{', $.struct_declaration_list, '}'),
      seq('struct', $.identifier)
    ),

    struct_declaration_list: $ => repeat1($.struct_declaration),

    struct_declaration: $ => seq(
      $.specifier_qualifier_list,
      $.struct_declarator_list,
      ';'
    ),

    specifier_qualifier_list: $ => repeat1(
      choice(
        $.type_qualifier,
        $.type_specifier
      )
    ),

    struct_declarator_list: $ => seq(
      $.struct_declarator,
      repeat(seq(',', $.struct_declarator))
    ),

    struct_declarator: $ => choice(
      $.declarator,
      seq(optional($.declarator), ':', $.constant_expression)
    ),

    enum_specifier: $ => choice(
      seq('enum', $.identifier, '{', $.enumerator_list, '}'),
      seq('enum', optional($.identifier))
    ),

    enumerator_list: $ => seq(
      $.enumerator,
      repeat(seq(',', $.enumerator)),
      optional(',')
    ),

    enumerator: $ => seq(
      $.enumeration_constant,
      optional(seq('=', $.constant_expression))
    ),

    enumeration_constant: $ => $.identifier,

    typedef_name: $ => $.identifier,

    alignment_specifier: $ => seq(
      '_Alignas',
      choice(
        seq('(', $.type_name, ')'),
        seq('(', $.constant_expression, ')')
      )
    ),

    // Declarators
    declarator: $ => choice(
      $.identifier,
      seq('(', $.declarator, ')'),
      seq($.pointer, optional($.declarator)),
      seq($.declarator, '[', optional($.constant_expression), ']'),
      seq($.declarator, '(', $.parameter_list, ')'),
      seq($.declarator, '(', optional($.identifier_list), ')')
    ),

    pointer: $ => seq('*', optional($.type_qualifier_list)),

    type_qualifier_list: $ => repeat1($.type_qualifier),

    parameter_list: $ => seq(
      $.parameter_declaration,
      repeat(seq(',', $.parameter_declaration))
    ),

    parameter_declaration: $ => seq(
      $.declaration_specifiers,
      choice(
        $.declarator,
        optional($.abstract_declarator)
      )
    ),

    identifier_list: $ => seq(
      $.identifier,
      repeat(seq(',', $.identifier))
    ),

    type_name: $ => seq(
      $.specifier_qualifier_list,
      optional($.abstract_declarator)
    ),

    abstract_declarator: $ => choice(
      $.pointer,
      seq($.pointer, $.direct_abstract_declarator),
      $.direct_abstract_declarator
    ),

    direct_abstract_declarator: $ => choice(
      seq('(', $.abstract_declarator, ')'),
      seq(optional($.direct_abstract_declarator), '[', optional($.constant_expression), ']'),
      seq(optional($.direct_abstract_declarator), '(', optional($.parameter_list), ')')
    ),

    _init_declarator_list: $ => seq(
      $._init_declarator,
      repeat(seq(',', $._init_declarator))
    ),

    _init_declarator: $ => seq(
      $.declarator,
      optional(seq('=', $.initializer))
    ),

    initializer: $ => choice(
      $.assignment_expression,
      $.initializer_list,
      $.compound_initializer
    ),

    initializer_list: $ => seq(
      $.initializer,
      repeat(seq(',', $.initializer)),
      optional(',')
    ),

    compound_initializer: $ => seq(
      '{',
      optional($.initializer_list),
      '}'
    ),

    // === STATEMENTS ===
    statement: $ => choice(
      $.labeled_statement,
      $.compound_statement,
      $.expression_statement,
      $.selection_statement,
      $.iteration_statement,
      $.jump_statement,
      $.empty_statement
    ),

    labeled_statement: $ => choice(
      seq($.identifier, ':', $.statement),
      seq('case', $.constant_expression, ':', $.statement),
      seq('default', ':', $.statement)
    ),

    // SIGNIFICANT INDENTATION BLOCKS
    compound_statement: $ => seq(
      ':',
      $._indent,
      repeat(choice(
        $.statement,
        $.declaration
      )),
      $._dedent
    ),

    expression_statement: $ => seq(
      $.expression,
      optional(';')
    ),

    selection_statement: $ => choice(
      // if statement with indented block
      seq(
        'if',
        $.parenthesized_expression,
        $.compound_statement,
        optional(seq('else', $.compound_statement))
      ),
      // switch with braced body (keeps C compatibility)
      seq(
        'switch',
        $.parenthesized_expression,
        '{',
        repeat($.labeled_statement),
        '}'
      )
    ),

    // Iteration statements with indentation
    iteration_statement: $ => choice(
      seq('while', $.parenthesized_expression, $.compound_statement),
      seq('do', $.compound_statement, 'while', $.parenthesized_expression, ';'),
      seq(
        'for',
        '(',
        optional(choice($.declaration, $.expression)),
        ';',
        optional($.expression),
        ';',
        optional($.expression),
        ')',
        $.compound_statement
      )
    ),

    jump_statement: $ => seq(
      choice(
        seq('goto', $.identifier),
        seq('continue'),
        seq('break'),
        seq('return', optional($.expression))
      ),
      optional(';')
    ),

    empty_statement: $ => seq(';'),

    // === EXPRESSIONS ===
    expression: $ => seq(
      $.assignment_expression,
      repeat(seq(',', $.assignment_expression))
    ),

    assignment_expression: $ => choice(
      $.conditional_expression,
      seq($.unary_expression, $.assignment_operator, $.assignment_expression)
    ),

    assignment_operator: $ => choice(
      '=', '*=', '/=', '%=', '+=', '-=', '<<=', '>>=', '&=', '^=', '|='
    ),

    conditional_expression: $ => seq(
      $.logical_or_expression,
      optional(seq('?', $.expression, ':', $.conditional_expression))
    ),

    logical_or_expression: $ => binary_expression('||', $.logical_and_expression),

    logical_and_expression: $ => binary_expression('&&', $.inclusive_or_expression),

    inclusive_or_expression: $ => binary_expression('|', $.exclusive_or_expression),

    exclusive_or_expression: $ => binary_expression('^', $.and_expression),

    and_expression: $ => binary_expression('&', $.equality_expression),

    equality_expression: $ => binary_expression(
      choice('==', '!='),
      $.relational_expression
    ),

    relational_expression: $ => binary_expression(
      choice('<', '<=', '>', '>='),
      $.shift_expression
    ),

    shift_expression: $ => binary_expression(choice('<<', '>>'), $.additive_expression),

    additive_expression: $ => binary_expression(choice('+', '-'), $.multiplicative_expression),

    multiplicative_expression: $ => binary_expression(
      choice('*', '/', '%'),
      $.cast_expression
    ),

    cast_expression: $ => choice(
      seq('(', $.type_name, ')', $.cast_expression),
      $.unary_expression
    ),

    unary_expression: $ => choice(
      $.postfix_expression,
      seq(choice('++', '--'), $.unary_expression),
      seq($.unary_operator, $.cast_expression),
      seq('sizeof', choice($.unary_expression, seq('(', $.type_name, ')'))),
      seq('_Alignof', seq('(', $.type_name, ')'))
    ),

    unary_operator: $ => choice('&', '*', '+', '-', '~', '!'),

    postfix_expression: $ => seq(
      $.primary_expression,
      repeat(choice(
        seq('[', $.expression, ']'),
        seq('(', optional($.argument_expression_list), ')'),
        seq('.', $.identifier),
        seq('->', $.identifier),
        seq('++'),
        seq('--')
      ))
    ),

    primary_expression: $ => choice(
      $.identifier,
      $.number_literal,
      $.string_literal,
      $.character_literal,
      $.parenthesized_expression,
      $.compound_literal
    ),

    parenthesized_expression: $ => seq('(', $.expression, ')'),

    argument_expression_list: $ => seq(
      $.assignment_expression,
      repeat(seq(',', $.assignment_expression))
    ),

    constant_expression: $ => $.conditional_expression,

    // Compound literals
    compound_literal: $ => seq('(', $.type_name, ')', $.compound_initializer),

    compound_initializer: $ => seq('{', optional($.initializer_list), '}'),

    // === LEXICAL TOKENS ===
    identifier: $ => /[a-zA-Z_][a-zA-Z0-9_]*/,

    number_literal: $ => choice(
      /\d+\.\d+/,      // floating point
      /\d+/,           // integer
      /0[xX][0-9a-fA-F]+/, // hexadecimal
      /0[bB][01]+/,    // binary
      /0[0-7]+/        // octal
    ),

    string_literal: $ => /"([^"\\]|\\.)*"/,

    character_literal: $ => /'([^'\\]|\\.)*'/,

    // Handling line continuations and comments
    _line_continuation: $ => /\\[\r\n]/,
  }
});

function binary_expression(operator, operand) {
  return seq(
    operand,
    repeat(seq(operator, operand))
  );
}
