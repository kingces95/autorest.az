/* ---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *-------------------------------------------------------------------------------------------- */

import { CodeModelAz } from '../CodeModelAz';
import * as path from 'path';
import { SchemaType } from '@azure-tools/codemodel';
import { ToMultiLine, isNullOrUndefined } from '../../../utils/helper';
import { PathConstants } from '../../../utils/models';
import { TemplateBase } from './TemplateBase';

export class CliReport extends TemplateBase {
    constructor(model: CodeModelAz, isDebugMode: boolean) {
        super(model, isDebugMode);
        this.relativePath = path.join(PathConstants.reportFile);
    }

    public async fullGeneration(): Promise<string[]> {
        return this.GenerateAzureCliReport(this.model);
    }

    public async incrementalGeneration(base: string): Promise<string[]> {
        return this.fullGeneration();
    }

    GenerateAzureCliReport(model: CodeModelAz): string[] {
        let output: string[] = [];
        
        let data = {
            model: {
                Extensions: [],
                hasExtension: false,
            },
        };

        const extensions = [];
        if (model.SelectFirstExtension) {
            data.model.hasExtension = true;
            do {
                const extension = {
                    name: model.Extension_Name,
                    CommandGroups: [],
                    hasCommandGroup: false,
                };
                if (model.SelectFirstCommandGroup) {
                    extension.hasCommandGroup = true;
                    const commandGroups = [];
                    do {
                        const commandGroup = {
                            name: model.CommandGroup_Name,
                            cliKey: model.CommandGroup_CliKey,
                            hasCommand: false,
                            Commands: [],
                        };
                        if (model.SelectFirstCommand) {
                            commandGroup.hasCommand = true;
                            const commands = [];
                            do {
                                const command = {
                                    Methods: [],
                                    hasMethod: false,
                                };
                                commands.push(command);
                            } while (model.SelectNextCommand);
                            commandGroup.Commands = commands;
                        }
                        commandGroups.push(commandGroup);
                    } while (model.SelectNextCommandGroup);
                    extension.CommandGroups = commandGroups;
                }
                extensions.push(extension);
            } while (model.SelectNextExtension);
            data.model.Extensions = extensions;
        }

        output.push('# Azure CLI Module Creation Report');
        output.push('');
        output.push('## EXTENSION');
        output.push('|CLI Extension|Command Groups|');
        output.push('|---------|------------|');
        output.push('|az ' + model.Extension_Name + '|[groups](#CommandGroups)');
        output.push('');
        output.push('## GROUPS');
        output.push(
            '### <a name="CommandGroups">Command groups in `az ' +
                model.Extension_Name +
                '` extension </a>',
        );
        output.push('|CLI Command Group|Group Swagger name|Commands|');
        output.push('|---------|------------|--------|');

        let cmds = {};
        if (model.SelectFirstCommandGroup()) {
            do {
                output.push(
                    '|az ' +
                        model.CommandGroup_Name +
                        '|' +
                        model.CommandGroup_CliKey +
                        '|' +
                        '[commands](#CommandsIn' +
                        model.CommandGroup_CliKey +
                        ')|',
                );
            } while (model.SelectNextCommandGroup());
        }

        output.push('');
        output.push('## COMMANDS');

        if (model.SelectFirstCommandGroup()) {
            let mo: string[] = [];
            do {
                if (model.SelectFirstCommand()) {
                    mo = this.getCommandBody(model);
                    if (!isNullOrUndefined(cmds[model.CommandGroup_Name])) {
                        cmds[model.CommandGroup_Name] = cmds[model.CommandGroup_Name].concat(mo);
                    } else {
                        cmds[model.CommandGroup_Name] = mo;
                    }
                }
            } while (model.SelectNextCommandGroup());
        }

        // build sorted output
        let keys = Object.keys(cmds);
        keys.sort();

        for (let i = 0; i < keys.length; i++) {
            output = output.concat(cmds[keys[i]]);
        }

        output.push('');
        cmds = {};
        output.push('## COMMAND DETAILS');
        output.push('');

        if (model.SelectFirstCommandGroup()) {
            let mo: string[] = [];
            do {
                if (model.SelectFirstCommand()) {
                    mo = this.getCommandDetails(model);
                    if (!isNullOrUndefined(cmds[model.CommandGroup_Name])) {
                        cmds[model.CommandGroup_Name] = cmds[model.CommandGroup_Name].concat(mo);
                    } else {
                        cmds[model.CommandGroup_Name] = mo;
                    }
                }
            } while (model.SelectNextCommandGroup());
        }
        keys = Object.keys(cmds);
        keys.sort();

        for (let i = 0; i < keys.length; i++) {
            output = output.concat(cmds[keys[i]]);
        }
        return output;
    }

    getCommandBody(model: CodeModelAz) {
        const mo: string[] = [];
        mo.push(
            '### <a name="CommandsIn' +
                model.CommandGroup_CliKey +
                '">Commands in `az ' +
                model.CommandGroup_Name +
                '` group</a>',
        );
        mo.push('|CLI Command|Operation Swagger name|Parameters|Examples|');
        mo.push('|---------|------------|--------|-----------|');
        if (model.SelectFirstCommand()) {
            do {
                if (model.SelectFirstMethod()) {
                    do {
                        if (model.GetExamples().length > 0) {
                            mo.push(
                                '|[az ' +
                                    model.CommandGroup_Name +
                                    ' ' +
                                    model.Method_NameAz +
                                    '](#' +
                                    model.CommandGroup_CliKey +
                                    model.Method_CliKey +
                                    ')|' +
                                    model.Method_CliKey +
                                    '|' +
                                    '[Parameters](#Parameters' +
                                    model.CommandGroup_CliKey +
                                    model.Method_CliKey +
                                    ')' +
                                    '|' +
                                    '[Example](#Examples' +
                                    model.CommandGroup_CliKey +
                                    model.Method_CliKey +
                                    ')|',
                            );
                        } else {
                            mo.push(
                                '|[az ' +
                                    model.CommandGroup_Name +
                                    ' ' +
                                    model.Method_NameAz +
                                    '](#' +
                                    model.CommandGroup_CliKey +
                                    model.Method_CliKey +
                                    ')|' +
                                    model.Method_CliKey +
                                    '|' +
                                    '[Parameters](#Parameters' +
                                    model.CommandGroup_CliKey +
                                    model.Method_CliKey +
                                    ')' +
                                    '|Not Found|',
                            );
                        }
                    } while (model.SelectNextMethod());
                }
            } while (model.SelectNextCommand());
        }
        mo.push('');
        return mo;
    }

    getCommandDetails(model: CodeModelAz) {
        let mo: string[] = [];
        mo.push('### group `az ' + model.CommandGroup_Name + '`');
        if (model.SelectFirstCommand()) {
            do {
                const allRequiredParam: Map<string, boolean> = new Map<string, boolean>();
                const allNonRequiredParam: Map<string, boolean> = new Map<string, boolean>();
                let requiredmo: Array<string> = [];
                let nonrequiredmo: Array<string> = [];
                if (model.SelectFirstMethod()) {
                    do {
                        mo.push(
                            '#### <a name="' +
                                model.CommandGroup_CliKey +
                                model.Method_CliKey +
                                '">Command `az ' +
                                model.CommandGroup_Name +
                                ' ' +
                                model.Method_NameAz +
                                '`</a>',
                        );
                        mo.push('');
                        for (const example of model.GetExamples()) {
                            mo.push(
                                '##### <a name="' +
                                    'Examples' +
                                    model.CommandGroup_CliKey +
                                    model.Method_CliKey +
                                    '">Example</a>',
                            );
                            mo.push('```');
                            let parameters: string[] = [];
                            parameters = model.GetExampleItems(example, false, undefined);
                            const line = parameters.join(' ');
                            ToMultiLine(line, mo, 119, true);
                            mo.push('```');
                        }
                        mo.push(
                            '##### <a name="' +
                                'Parameters' +
                                model.CommandGroup_CliKey +
                                model.Method_CliKey +
                                '">Parameters</a> ',
                        );
                        mo.push('|Option|Type|Description|Path (SDK)|Swagger name|');
                        mo.push('|------|----|-----------|----------|------------|');
                        if (!model.SelectFirstMethodParameter()) {
                            continue;
                        }
                        const originalOperation = model.Method_GetOriginalOperation;
                        do {
                            if (
                                model.MethodParameter_IsFlattened ||
                                model.MethodParameter_Type === SchemaType.Constant
                            ) {
                                continue;
                            }
                            if (model.Parameter_IsPolyOfSimple(model.MethodParameter)) {
                                continue;
                            }
                            if (
                                !isNullOrUndefined(originalOperation) &&
                                model.MethodParameter['targetProperty']?.isDiscriminator
                            ) {
                                continue;
                            }
                            let optionName = model.MethodParameter_MapsTo;
                            if (optionName.endsWith('_')) {
                                optionName = optionName.substr(0, optionName.length - 1);
                            }
                            optionName = optionName.replace(/_/g, '-');
                            if (model.MethodParameter_IsRequired) {
                                if (allRequiredParam.has(optionName)) {
                                    continue;
                                }
                                allRequiredParam.set(optionName, true);
                                requiredmo.push(
                                    '|**--' +
                                        optionName +
                                        '**|' +
                                        model.MethodParameter_Type +
                                        '|' +
                                        model.MethodParameter_Description +
                                        '|' +
                                        model.MethodParameter_Name +
                                        '|' +
                                        model.MethodParameter_CliKey +
                                        '|',
                                );
                            } else {
                                if (allNonRequiredParam.has(optionName)) {
                                    continue;
                                }
                                allNonRequiredParam.set(optionName, true);
                                nonrequiredmo.push(
                                    '|**--' +
                                        optionName +
                                        '**|' +
                                        model.MethodParameter_Type +
                                        '|' +
                                        model.MethodParameter_Description +
                                        '|' +
                                        model.MethodParameter_Name +
                                        '|' +
                                        model.MethodParameter_CliKey +
                                        '|',
                                );
                            }
                        } while (model.SelectNextMethodParameter());
                        let flag = false;
                        if (requiredmo.length > 0 || nonrequiredmo.length > 0) {
                            flag = true;
                        }
                        if (requiredmo.length > 0) {
                            mo = mo.concat(requiredmo);
                            requiredmo = [];
                        }
                        if (nonrequiredmo.length > 0) {
                            mo = mo.concat(nonrequiredmo);
                            nonrequiredmo = [];
                        }
                        if (flag) mo.push('');
                    } while (model.SelectNextMethod());
                }
                if (requiredmo.length <= 0 && nonrequiredmo.length < 0) {
                    return mo;
                }
            } while (model.SelectNextCommand());
        }
        return mo;
    }
}
