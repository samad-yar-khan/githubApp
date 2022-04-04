import {
    IAppAccessors,
    IConfigurationExtend,
    IHttp,
    ILogger,
    IModify,
    IPersistence,
    IRead,
} from "@rocket.chat/apps-engine/definition/accessors";
import { App } from "@rocket.chat/apps-engine/definition/App";
import { IAppInfo } from "@rocket.chat/apps-engine/definition/metadata";
import { GithubCommand } from "./commands/GithubCommand";

import {
    IMessage,
    IPostMessageSent,
} from "@rocket.chat/apps-engine/definition/messages";
import { initiatorMessage } from "./lib/initiatorMessage";

import {
    IUIKitResponse,
    UIKitLivechatBlockInteractionContext,
    UIKitBlockInteractionContext,
} from "@rocket.chat/apps-engine/definition/uikit";

import { ContributorImage } from "./lib/ContributorImage";

export class GithubAppApp extends App {
    private readonly appLogger: ILogger;
    constructor(info: IAppInfo, logger: ILogger, accessors: IAppAccessors) {
        super(info, logger, accessors);
        this.appLogger = this.getLogger();
        this.appLogger.debug("Github APP");
    }

    public async executeBlockActionHandler(
        context: UIKitBlockInteractionContext,
        read: IRead,
        http: IHttp,
        persistence: IPersistence,
        modify: IModify
    ) {
        const data = context.getInteractionData();

        const { actionId } = data;

        switch (actionId) {
            case "githubDataSelect": {
                try {
                    const gitResponse = await http.get(
                        `https://api.github.com/repos/RocketChat/Rocket.Chat${data.value}`
                    );

                    const resData = gitResponse.data;

                    const { room } = context.getInteractionData();

                    if (data.value === "") {
                        const fullName =
                            "[" +
                            resData.full_name +
                            "](" +
                            resData.html_url +
                            ")" +
                            " | ";
                        const stars =
                            "stars: " + resData.stargazers_count + " | ";
                        const issues =
                            "open issues: " + resData.open_issues + " | ";
                        const forks = "forks: " + resData.forks_count + " | ";

                        const textSender = await modify
                            .getCreator()
                            .startMessage()
                            .setText(fullName + stars + issues + forks);

                        if (room) {
                            textSender.setRoom(room);
                        }

                        await modify.getCreator().finish(textSender);
                    } else if (data.value === "/issues") {
                        const textSender = await modify
                            .getCreator()
                            .startMessage()
                            .setText(`*ISSUES LIST*`);

                        if (room) {
                            textSender.setRoom(room);
                        }

                        await modify.getCreator().finish(textSender);
                        resData.forEach(async (issue, ind) => {
                            if (ind < 10) {
                                const title = issue.title;
                                const url = issue.html_url;

                                const textSender = await modify
                                    .getCreator()
                                    .startMessage()
                                    .setText(`[ #${issue.number} ](${url})  ${issue.title}`);

                                if (room) {
                                    textSender.setRoom(room);
                                }

                                await modify.getCreator().finish(textSender);
                            }
                        });
                    } else if(data.value==='/contributors'){
                        const textSender = await modify
                            .getCreator()
                            .startMessage()
                            .setText(`*CONTRIBUTOR LIST*`);

                        if (room) {
                            textSender.setRoom(room);
                        }

                        await modify.getCreator().finish(textSender);
                        resData.forEach(async (contributor, ind) => {
                            if (ind < 20) {
                                const login = contributor.login;
                                const html_url = contributor.html_url;

                                const textSender = await modify
                                    .getCreator()
                                    .startMessage()
                                    .setText(`[ ${login} ](${html_url})`);

                                if (room) {
                                    textSender.setRoom(room);
                                }

                                await modify.getCreator().finish(textSender);
                            }
                        });
                    }else{

                      const textSender = await modify
                            .getCreator()
                            .startMessage()
                            .setText(`*PULL REQUESTS*`);

                        if (room) {
                            textSender.setRoom(room);
                        }

                        await modify.getCreator().finish(textSender);
                        resData.forEach(async (pull, ind) => {
                            if (ind < 10) {
                                const title = pull.title;
                                const url = pull.html_url;

                                const textSender = await modify
                                    .getCreator()
                                    .startMessage()
                                    .setText(`[ #${pull.number} ](${url})  ${pull.title}`);

                                if (room) {
                                    textSender.setRoom(room);
                                }

                                await modify.getCreator().finish(textSender);
                            }
                        });

                    }

                    return {
                        success: true,
                    };
                } catch (err) {
                    console.error(err);
                    return {
                        success: false,
                    };
                }
            }
        }

        return {
            success: false,
        };
    }

    public async extendConfiguration(
        configuration: IConfigurationExtend
    ): Promise<void> {
        const gitHubCommand: GithubCommand = new GithubCommand();
        await configuration.slashCommands.provideSlashCommand(gitHubCommand);
    }
}
