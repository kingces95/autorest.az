import { CodeModel, codeModelSchema } from '@azure-tools/codemodel';
import { Session, startSession, Host } from '@azure-tools/autorest-extension-base';
import { serialize } from '@azure-tools/codegen';
import { CodeGenConstants, AzConfiguration } from './utils/models';

export class Renamer {
    codeModel: CodeModel;

    constructor(protected session: Session<CodeModel>) {
        this.codeModel = session.model;
    }

    async process() {
        return this.codeModel;
    }
}

export async function processRequest(host: Host) {
    const debug = AzConfiguration.getValue(CodeGenConstants.debug);

    try {
        const session = await startSession<CodeModel>(host, {}, codeModelSchema);
        const plugin = new Renamer(session);
        const result = await plugin.process();
        host.WriteFile(CodeGenConstants.cliCodeModelName, serialize(result));
    } catch (E) {
        if (debug) {
            console.error(`${__filename} - FAILURE  ${JSON.stringify(E)} ${E.stack}`);
        }
        throw E;
    }
}
