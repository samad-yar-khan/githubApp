import {
    IAppAccessors,
    ILogger,
    IConfigurationExtend,
} from '@rocket.chat/apps-engine/definition/accessors';
import { App } from '@rocket.chat/apps-engine/definition/App';
import { IAppInfo } from '@rocket.chat/apps-engine/definition/metadata';
import { GithubCommand } from './commands/GithubCommand'

export class GithubAppApp extends App {
    private readonly appLogger: ILogger
    constructor(info: IAppInfo, logger: ILogger, accessors: IAppAccessors) {
        super(info, logger, accessors);
        this.appLogger = this.getLogger()
        this.appLogger.debug('Github APP')
        
    }
    public async extendConfiguration(
        configuration: IConfigurationExtend
      ): Promise<void> {
        const gitHubCommand: GithubCommand = new GithubCommand()
        await configuration.slashCommands.provideSlashCommand(gitHubCommand)
      }
}
