/* ---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *-------------------------------------------------------------------------------------------- */

import { Parameter, SchemaType } from '@azure-tools/codemodel';
import { ToPythonString, ToMultiLine, isNullOrUndefined } from '../../../utils/helper';
import { CodeModelAz } from '../../CodeModelAz';
import { HeaderGenerator } from '../Header';

let allActions: Map<string, boolean>;

export function GenerateAzureCliActions(model: CodeModelAz): string[] {
    allActions = new Map<string, boolean>();
    const header: HeaderGenerator = new HeaderGenerator();

    header.disableProtectedAccess = true;
    let output: string[] = [];
    let outputCode: string[] = [];

    if (model.SelectFirstCommandGroup()) {
        do {
            if (model.SelectFirstCommand()) {
                do {
                    if (model.SelectFirstMethod()) {
                        do {
                            let baseParam = null;
                            if (model.SelectFirstMethodParameter()) {
                                do {
                                    if (
                                        baseParam &&
                                        model.MethodParameter['polyBaseParam'] === baseParam
                                    ) {
                                        const keyToMatch =
                                            baseParam.schema?.discriminator?.property?.language
                                                .python?.name;
                                        const valueToMatch =
                                            model.MethodParameter.schema?.['discriminatorValue'];
                                        const subActionName = model.Schema_ActionName(
                                            model.MethodParameter.schema,
                                        );
                                        if (
                                            isNullOrUndefined(subActionName) ||
                                            allActions.has(subActionName)
                                        ) {
                                            continue;
                                        }
                                        if (model.MethodParameter_IsPositional) {
                                            outputCode = outputCode.concat(
                                                GetPositionalAction(
                                                    model,
                                                    subActionName,
                                                    model.MethodParameter,
                                                ),
                                            );
                                        } else if (model.MethodParameter_IsShorthandSyntax) {
                                            outputCode = outputCode.concat(
                                                GetShorthandSyntaxAction(
                                                    model,
                                                    subActionName,
                                                    model.MethodParameter,
                                                ),
                                            );
                                        } else {
                                            outputCode = outputCode.concat(
                                                GetAction(
                                                    model,
                                                    subActionName,
                                                    model.MethodParameter,
                                                    keyToMatch,
                                                    valueToMatch,
                                                ),
                                            );
                                        }
                                    }
                                    const actionName = model.Schema_ActionName(
                                        model.MethodParameter.schema,
                                    );
                                    if (isNullOrUndefined(actionName)) {
                                        if (model.Parameter_IsPolyOfSimple(model.MethodParameter)) {
                                            baseParam = model.MethodParameter;
                                        }
                                    } else {
                                        if (allActions.has(actionName)) {
                                            continue;
                                        }
                                        if (model.MethodParameter_IsPositional) {
                                            outputCode = outputCode.concat(
                                                GetPositionalAction(
                                                    model,
                                                    actionName,
                                                    model.MethodParameter,
                                                ),
                                            );
                                        } else if (model.MethodParameter_IsShorthandSyntax) {
                                            outputCode = outputCode.concat(
                                                GetShorthandSyntaxAction(
                                                    model,
                                                    actionName,
                                                    model.MethodParameter,
                                                ),
                                            );
                                        } else {
                                            outputCode = outputCode.concat(
                                                GetAction(model, actionName, model.MethodParameter),
                                            );
                                        }
                                    }
                                } while (model.SelectNextMethodParameter());
                            }
                        } while (model.SelectNextMethod());
                    }
                } while (model.SelectNextCommand());
            }
        } while (model.SelectNextCommandGroup());
    }

    if (outputCode.length !== 0) {
        header.addImport('argparse');
        header.addFromImport('collections', ['defaultdict']);
        header.addFromImport('knack.util', ['CLIError']);
        output = header.getLines().concat(outputCode);
    } else {
        output = header.getLines();
    }
    output.push('');

    return output;
}

function GetAction(
    model: CodeModelAz,
    actionName: string,
    param: Parameter,
    keyToMatch: string = null,
    valueToMatch: string = null,
) {
    const output: string[] = [];
    allActions.set(actionName, true);

    output.push('');
    output.push('');
    let baseAction = 'Action';
    const paramType = param?.schema?.type;
    if (paramType === SchemaType.Array) baseAction = '_Append' + baseAction;
    output.push('class ' + actionName + '(argparse.' + baseAction + '):');
    output.push('    def __call__(self, parser, namespace, values, option_string=None):');
    output.push('        action = self.get_action(values, option_string)');
    if (paramType === SchemaType.Array) {
        output.push(
            '        super(' +
                actionName +
                ', self).__call__(parser, namespace, action, option_string)',
        );
    } else {
        output.push('        namespace.' + model.Parameter_MapsTo(param) + ' = action');
    }
    output.push('');
    output.push('    def get_action(self, values, option_string):  # pylint: disable=no-self-use');
    output.push('        try:');
    output.push('            properties = defaultdict(list)');
    output.push("            for (k, v) in (x.split('=', 1) for x in values):");
    output.push('                properties[k].append(v)');
    output.push('            properties = dict(properties)');
    output.push('        except ValueError:');
    output.push(
        "            raise CLIError('usage error: {} [KEY=VALUE ...]'.format(option_string))",
    );
    output.push('        d = {}');

    if (model.EnterSubMethodParameters()) {
        if (model.SelectFirstMethodParameter(true)) {
            do {
                if (model.Parameter_DefaultValue(model.SubMethodParameter) !== undefined) {
                    output.push(
                        "        d['" +
                            model.Parameter_NamePython(model.SubMethodParameter) +
                            "'] = " +
                            ToPythonString(
                                model.Parameter_DefaultValue(model.SubMethodParameter),
                                model.Parameter_Type(model.SubMethodParameter),
                            ),
                    );
                }
            } while (model.SelectNextMethodParameter(true));
        }
        model.ExitSubMethodParameters();
    }

    output.push('        for k in properties:');
    output.push('            kl = k.lower()');
    output.push('            v = properties[k]');
    let foundProperties = false;
    const preParamType = paramType;
    const allPossibleKeys = [];
    if (model.EnterSubMethodParameters()) {
        if (model.SelectFirstMethodParameter()) {
            foundProperties = true;
            let ifkv = 'if';
            do {
                if (model.SubMethodParameter['readOnly']) {
                    continue;
                }
                if (model.SubMethodParameter.schema?.type === SchemaType.Constant) {
                    continue;
                }
                if (
                    !isNullOrUndefined(keyToMatch) &&
                    !isNullOrUndefined(valueToMatch) &&
                    model.Parameter_NamePython(model.SubMethodParameter) === keyToMatch
                ) {
                    continue;
                }
                output.push(
                    '            ' +
                        ifkv +
                        " kl == '" +
                        model.Parameter_NameAz(model.SubMethodParameter) +
                        "':",
                );
                allPossibleKeys.push(model.Parameter_NameAz(model.SubMethodParameter));
                if (model.MethodParameter_IsArray) {
                    output.push(
                        "                d['" +
                            model.Parameter_NamePython(model.SubMethodParameter) +
                            "'] = v",
                    );
                } else {
                    output.push(
                        "                d['" +
                            model.Parameter_NamePython(model.SubMethodParameter) +
                            "'] = v[0]",
                    );
                }
                ifkv = 'elif';
            } while (model.SelectNextMethodParameter());
        }
        model.ExitSubMethodParameters();
    }

    if (allPossibleKeys.length > 0) {
        output.push('            else:');
        ToMultiLine(
            "                raise CLIError('Unsupported Key {} is provided for parameter " +
                model.Parameter_MapsTo(param) +
                '. All possible keys are: ' +
                allPossibleKeys.join(', ') +
                "'.format(k))",
            output,
        );
    }
    if (!foundProperties && preParamType === SchemaType.Dictionary) {
        output.pop();
        output.pop();
        output.push('            v = properties[k]');
        output.push('            d[k] = v[0]');
    } else if (!foundProperties && model.MethodParameter_IsArray) {
        output.pop();
        output.pop();
        output.push('            v = properties[k]');
        output.push('            d[k] = v');
    } else if (!isNullOrUndefined(keyToMatch) && !isNullOrUndefined(valueToMatch)) {
        output.push("        d['" + keyToMatch + "'] = '" + valueToMatch + "'");
    }
    output.push('        return d');
    return output;
}

function GetPositionalAction(
    model: CodeModelAz,
    actionName: string,
    param: Parameter,
    keyToMatch: string = null,
    valueToMatch: string = null,
) {
    let output: string[] = [];
    allActions.set(actionName, true);
    output.push('');
    output.push('');
    const keys = model.MethodParameter_PositionalKeys;
    let baseAction = 'Action';
    const paramType = param?.schema?.type;
    if (paramType === SchemaType.Array) baseAction = '_Append' + baseAction;
    output.push('class ' + actionName + '(argparse.' + baseAction + '):');
    output.push('    def __call__(self, parser, namespace, values, option_string=None):');
    output.push('        action = self.get_action(values, option_string)');
    if (paramType === SchemaType.Array) {
        output.push('        for item in action:');
        output.push(
            '            super(' +
                actionName +
                ', self).__call__(parser, namespace, item, option_string)',
        );
    } else {
        output.push('        namespace.' + model.Parameter_MapsTo(param) + ' = action[0]');
    }
    output.push('');
    output.push('    def get_action(self, values, option_string=None):');
    if (isNullOrUndefined(keys) || keys.length <= 0) {
        output.push('        pass');
        return output;
    }
    output.push('        try:');
    output.push(
        '            value_chunk_list = [values[x:x+' +
            keys.length +
            '] for x in range(0, len(values), ' +
            keys.length +
            ')]',
    );
    output.push('            value_list = []');
    output.push('            for chunk in value_chunk_list:');
    output.push('                ' + keys.join(', ') + (keys.length === 1 ? ',' : '') + ' = chunk');
    output.push('                value_list.append(');
    output = output.concat(
        generateConstructObject(
            model,
            '                    ',
            keyToMatch,
            valueToMatch,
            false,
            keys,
        ),
    );
    output.push('                )');
    output.push('            return value_list');
    output.push('        except ValueError:');
    output.push(
        "            raise CLIError('usage error: {} NAME METRIC OPERATION VALUE'.format(option_string))",
    );
    return output;
}

function GetShorthandSyntaxAction(
    model: CodeModelAz,
    actionName: string,
    param: Parameter,
    keyToMatch: string = null,
    valueToMatch: string = null,
) {
    const output: string[] = [];
    allActions.set(actionName, true);

    output.push('');
    output.push('');
    let baseAction = 'Action';
    const paramType = param?.schema?.type;
    if (paramType === SchemaType.Array) baseAction = '_Append' + baseAction;
    output.push('class ' + actionName + '(argparse.' + baseAction + '):');
    output.push('    def __call__(self, parser, namespace, values, option_string=None):');
    output.push('        action = self.get_action(values, option_string)');
    if (paramType === SchemaType.Array) {
        output.push('        for item in action:');
        output.push(
            '            super(' +
                actionName +
                ', self).__call__(parser, namespace, item, option_string)',
        );
    } else {
        output.push('        namespace.' + model.Parameter_MapsTo(param) + ' = action');
    }
    output.push('');
    output.push('    def get_action(self, values, option_string):  # pylint: disable=no-self-use');
    output.push('        ret = []');
    output.push('        for item in values:');
    output.push('            properties = defaultdict(list)');
    output.push('            try:');
    output.push("                for (k, v) in (x.split('=', 1) for x in item.split(',')):");
    output.push('                    properties[k].append(v)');
    output.push('                properties = dict(properties)');
    output.push('            except ValueError:');
    output.push(
        "                raise CLIError('usage error: {} [KEY=VALUE ...]'.format(option_string))",
    );
    output.push('            d = {}');

    if (model.EnterSubMethodParameters()) {
        if (model.SelectFirstMethodParameter(true)) {
            do {
                if (model.Parameter_DefaultValue(model.SubMethodParameter) !== undefined) {
                    output.push(
                        "            d['" +
                            model.Parameter_NamePython(model.SubMethodParameter) +
                            "'] = " +
                            ToPythonString(
                                model.Parameter_DefaultValue(model.SubMethodParameter),
                                model.Parameter_Type(model.SubMethodParameter),
                            ),
                    );
                }
            } while (model.SelectNextMethodParameter(true));
        }
        model.ExitSubMethodParameters();
    }

    output.push('            for k in properties:');
    output.push('                kl = k.lower()');
    output.push('                v = properties[k]');
    let foundProperties = false;
    const preParamType = paramType;
    const allPossibleKeys = [];
    if (model.EnterSubMethodParameters()) {
        if (model.SelectFirstMethodParameter()) {
            foundProperties = true;
            let ifkv = 'if';
            do {
                if (model.SubMethodParameter['readOnly']) {
                    continue;
                }
                if (model.SubMethodParameter.schema?.type === SchemaType.Constant) {
                    continue;
                }
                if (
                    !isNullOrUndefined(keyToMatch) &&
                    !isNullOrUndefined(valueToMatch) &&
                    model.Parameter_NamePython(model.SubMethodParameter) === keyToMatch
                ) {
                    continue;
                }
                output.push(
                    '                ' +
                        ifkv +
                        " kl == '" +
                        model.Parameter_NameAz(model.SubMethodParameter) +
                        "':",
                );
                allPossibleKeys.push(model.Parameter_NameAz(model.SubMethodParameter));
                if (model.MethodParameter_IsArray) {
                    output.push(
                        "                    d['" +
                            model.Parameter_NamePython(model.SubMethodParameter) +
                            "'] = v",
                    );
                } else {
                    output.push(
                        "                    d['" +
                            model.Parameter_NamePython(model.SubMethodParameter) +
                            "'] = v[0]",
                    );
                }
                ifkv = 'elif';
            } while (model.SelectNextMethodParameter());
        }
        model.ExitSubMethodParameters();
    }

    if (allPossibleKeys.length > 0) {
        output.push('                else:');
        ToMultiLine(
            "                    raise CLIError('Unsupported Key {} is provided for parameter " +
                model.Parameter_MapsTo(param) +
                '. All possible keys are: ' +
                allPossibleKeys.join(', ') +
                "'.format(k))",
            output,
        );
    }
    if (!foundProperties && preParamType === SchemaType.Dictionary) {
        output.pop();
        output.pop();
        output.push('                v = properties[k]');
        output.push('                d[k] = v[0]');
    } else if (!foundProperties && model.MethodParameter_IsArray) {
        output.pop();
        output.pop();
        output.push('                v = properties[k]');
        output.push('                d[k] = v');
    } else if (!isNullOrUndefined(keyToMatch) && !isNullOrUndefined(valueToMatch)) {
        output.push("            d['" + keyToMatch + "'] = '" + valueToMatch + "'");
    }
    output.push('            ret.append(d)');
    if (model.MethodParameter_Type === SchemaType.Array) {
        output.push('        return ret');
    } else {
        output.push('        return ret[0]');
    }
    return output;
}

function generateConstructObject(
    model: CodeModelAz,
    indent: string,
    keyToMatch: string,
    valueToMatch: string,
    needReturn: boolean,
    keys: string[],
) {
    const output: string[] = [];
    output.push(indent + (needReturn ? 'return ' : '') + '{');
    let hasPair = false;
    if (keys.length > 0) {
        for (const key of keys) {
            hasPair = true;
            output.push(indent + "    '" + key + "': " + key + ',');
        }
    } else {
        if (model.EnterSubMethodParameters()) {
            if (model.SelectFirstMethodParameter(true)) {
                do {
                    if (model.SubMethodParameter['readOnly']) {
                        continue;
                    }
                    if (model.SubMethodParameter.schema?.type === SchemaType.Constant) {
                        continue;
                    }
                    if (
                        !isNullOrUndefined(keyToMatch) &&
                        !isNullOrUndefined(valueToMatch) &&
                        model.Parameter_NamePython(model.SubMethodParameter) === keyToMatch
                    ) {
                        continue;
                    }
                    hasPair = true;
                    output.push(
                        indent +
                            '    ' +
                            model.Parameter_NamePython(model.SubMethodParameter) +
                            ' = ' +
                            model.Parameter_NamePython(model.SubMethodParameter) +
                            ',',
                    );
                } while (model.SelectNextMethodParameter(true));
            }
            model.ExitSubMethodParameters();
        }
    }
    if (hasPair) {
        output[output.length - 1] = output.last.substring(0, output.last.length - 1);
        output.push(indent + '}');
    } else {
        output.pop();
    }
    return output;
}
