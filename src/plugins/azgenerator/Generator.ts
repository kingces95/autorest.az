﻿/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { CodeModelAz } from "./CodeModelAz"
import { GenerateAzureCliActions } from "./TemplateAzureCliActions"
import { GenerateAzureCliAzextMetadata } from "./TemplateAzureCliAzextMetadata"
import { GenerateAzureCliClientFactory } from "./TemplateAzureCliClientFactory"
import { GenerateAzureCliCommands } from "./TemplateAzureCliCommands"
import { GenerateAzureCliCustom } from "./TemplateAzureCliCustom"
import { GenerateAzureCliHelp } from "./TemplateAzureCliHelp"
import { GenerateAzureCliHistory } from "./TemplateAzureCliHistory"
import { GenerateAzureCliInit } from "./TemplateAzureCliInit"
import { GenerateNamespaceInit } from "./TemplateAzureCliNamespaceInit"
import { GenerateAzureCliParams } from "./TemplateAzureCliParams"
import { GenerateAzureCliReadme } from "./TemplateAzureCliReadme"
import { GenerateAzureCliReport } from "./TemplateAzureCliReport"
import { GenerateAzureCliSetupCfg } from "./TemplateAzureCliSetupCfg"
import { GenerateAzureCliSetupPy } from "./TemplateAzureCliSetupPy"
import { GenerateAzureCliTestInit } from "./TemplateAzureCliTestInit"
import { GenerateAzureCliTestPrepare } from "./TemplateAzureCliTestPrepare"
import { GenerateAzureCliTestScenario, NeedPreparer } from "./TemplateAzureCliTestScenario"
import { GenerateTopLevelImport } from "./TemplateAzureCliTopLevelImport"
import { GenerateAzureCliValidators } from "./TemplateAzureCliValidators"
import { GenerateDocSourceJsonMap } from "./TemplateAzureCliDocSourceJsonMap"
import { GenerateRequirementTxt } from './TemplateAzureCliRequirement';
import { GenerateAzureCliMainSetUp } from "./TemplateAzureCliMainSetUp"

// [Deprecating] Try to depreacate this method. Move logic to AzGeneratorBase and AzExtensionFullGenerator class
export async function GenerateAll(model: CodeModelAz,
    generateReport: any, debug: boolean) {
    let files: any = {};

    await model.init();

    if (model.SelectFirstExtension()) {
        do {
            let pathTop = "";
            let path = "azext_" + model.Extension_NameUnderscored + "/";
            if (model.IsCliCore) {
                path = "";
            }
            
            files[path + "generated/_params.py"] = GenerateAzureCliParams(model, debug);
            files[path + "generated/commands.py"] = GenerateAzureCliCommands(model);
            files[path + "generated/custom.py"] = GenerateAzureCliCustom(model);
            files[path + "generated/_client_factory.py"] = GenerateAzureCliClientFactory(model);
            files[path + "generated/_validators.py"] = GenerateAzureCliValidators(model);
            files[path + "generated/action.py"] = GenerateAzureCliActions(model);
            files[path + "generated/__init__.py"] = GenerateNamespaceInit(model);
            files[path + "tests/__init__.py"] = GenerateAzureCliTestInit(model);
            model.GenerateTestInit();
            files[path + "tests/latest/test_" + model.Extension_NameUnderscored + "_scenario.py"] = GenerateAzureCliTestScenario(model);
            if (NeedPreparer()) files[path + "tests/latest/preparers.py"] = GenerateAzureCliTestPrepare(model);
            files[path + "generated/_help.py"] = GenerateAzureCliHelp(model, debug);
            files[path + "tests/latest/__init__.py"] = GenerateNamespaceInit(model);
            if (!model.IsCliCore) {
                files[path + "azext_metadata.json"] = GenerateAzureCliAzextMetadata(model);
                files[pathTop + "HISTORY.rst"] = GenerateAzureCliHistory(model);
                files[pathTop + "README.md"] = GenerateAzureCliReadme(model);
                files[pathTop + "setup.cfg"] = GenerateAzureCliSetupCfg(model);
                files[pathTop + "setup.py"] = GenerateAzureCliSetupPy(model);  
            } 
            
            if(!model.IsCliCore || model.SDK_NeedSDK) {
                files[path + "vendored_sdks/__init__.py"] = GenerateNamespaceInit(model);  
            }
            files[path + "manual/__init__.py"] = GenerateNamespaceInit(model);  
            files[path + "action.py"] = GenerateTopLevelImport(model, "action");  
            files[path + "custom.py"] = GenerateTopLevelImport(model, "custom");  
            files[path + "__init__.py"] = GenerateAzureCliInit(model);


            if (generateReport) {
                files[pathTop + "report.md"] = GenerateAzureCliReport(model);
            }
            
            if (model.IsCliCore) {
                let docSourceJsonMapPath = model.AzureCliFolder + "/doc/sphinx/azhelpgen/doc_source_map.json";
                files[docSourceJsonMapPath] = GenerateDocSourceJsonMap(model, docSourceJsonMapPath);

                for(let sys of ['Darwin', 'Linux', 'windows']) {
                    let requireFilePath= model.AzureCliFolder + "/src/azure-cli/requirements.py3." + sys + ".txt";
                    files[requireFilePath] = await GenerateRequirementTxt(model, requireFilePath);
                }
                let setUpPath = model.AzureCliFolder + "src/azure-cli/setup.py"
                files[setUpPath] = await GenerateAzureCliMainSetUp(model, setUpPath);
            }
        }
        while (model.SelectNextExtension())
    }
    return files;
}