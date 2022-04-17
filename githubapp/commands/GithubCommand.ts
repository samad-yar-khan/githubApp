import {
    ISlashCommand,
    SlashCommandContext,
} from "@rocket.chat/apps-engine/definition/slashcommands";
import {
    IHttp,
    IMessageBuilder,
    IModify,
    IModifyCreator,
    IPersistence,
    IRead,
} from "@rocket.chat/apps-engine/definition/accessors";

import { GithubAppApp } from "../GithubAppApp";
import { IMessage } from "@rocket.chat/apps-engine/definition/messages";
import { IRoom } from "@rocket.chat/apps-engine/definition/rooms";
import { IUser } from "@rocket.chat/apps-engine/definition/users";
import { initiatorMessage } from "../lib/initiatorMessage";
import { AppPersistence } from "../lib/persistence";
import { GithubSDK } from "../lib/githubsdk";
import { sendNotification } from "../lib/helpers/sendNotification";
import { getWebhookUrl } from "../lib/helpers/getWebhookUrl";

export class GithubCommand implements ISlashCommand {
    public command = "github";
    public i18nDescription = "fetching githup data";
    public providesPreview = false;
    public i18nParamsExample = "";

    public async executor(
        context: SlashCommandContext,
        read: IRead,
        modify: IModify,
        http: IHttp,
        persistence: IPersistence
    ): Promise<void> {
        // const creator: IModifyCreator = modify.getCreator()
        // const sender: IUser = (await read.getUserReader().getAppUser()) as IUser
        // const room: IRoom = context.getRoom()
        // const messageTemplate: IMessage = {
        // text: 'Github App working !',
        // sender,
        // room
        // }
        // const messageBuilder: IMessageBuilder = creator.startMessage(messageTemplate)
        // await creator.finish(messageBuilder)
        const command = context.getArguments();
        console.log(command);

        const sender = context.getSender(); // the user calling the slashcommand
        const room = context.getRoom(); // the current room

        const data = {
            room: room,
            sender: sender,
            arguments: command,
        };

        if (Array.isArray(command) && command.length === 1) {
            await initiatorMessage({ data, read, persistence, modify, http });
        } else if (Array.isArray(command) && command.length === 2) {
            const subcommand = command[0];
            const subcommand2 = command[1];

            switch (subcommand) {

                case "set-token" :{
                    await this.setAccessToken(context, read, modify, http, persistence);
                    break;
                }
                case "subscribe":{
                    await this.subscribeRepo(context, read, modify, http, persistence);
                    break;
                }
                default:break
            }

            switch (subcommand2) {
                case "issues": {
                    const repository = command[0];
                    const gitResponse = await http.get(
                        `https://api.github.com/repos/${repository}/issues`
                    );
                    const resData = gitResponse.data;
                    const room: IRoom = context.getRoom();
                    const textSender = await modify
                        .getCreator()
                        .startMessage()
                        .setText(`*ISSUES LIST*`);

                    if (room) {
                        textSender.setRoom(room);
                    }
                    let ind = 0;
                    await modify.getCreator().finish(textSender);
                    resData.forEach(async (issue) => {
                        if (
                            typeof issue.pull_request === "undefined" &&
                            ind < 10
                        ) {
                            const textSender = await modify
                                .getCreator()
                                .startMessage()
                                .setText(
                                    `[ #${issue.number} ](${issue.html_url})  *${issue.title}*`
                                );
                            if (room) {
                                textSender.setRoom(room);
                            }
                            await modify.getCreator().finish(textSender);
                            ind++;
                        }
                    });
                    break;
                }
                case "contributors": {
                    const repository = command[0];
                    const gitResponse = await http.get(
                        `https://api.github.com/repos/${repository}/contributors`
                    );
                    const resData = gitResponse.data;
                    const room: IRoom = context.getRoom();
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
                    break;
                }
                case "pulls": {
                    const repository = command[0];
                    const gitResponse = await http.get(
                        `https://api.github.com/repos/${repository}/contributors`
                    );
                    const resData = gitResponse.data;
                    const room: IRoom = context.getRoom();
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
                                .setText(
                                    `[ #${pull.number} ](${url})  *${pull.title}*`
                                );

                            if (room) {
                                textSender.setRoom(room);
                            }

                            await modify.getCreator().finish(textSender);
                        }
                    });
                    break;
                }
                case "repo": {
                    const repository = command[0];
                    const gitResponse = await http.get(
                        `https://api.github.com/repos/${repository}`
                    );
                    const resData = gitResponse.data;
                    const room: IRoom = context.getRoom();
                    const fullName =
                        "[" +
                        resData.full_name +
                        "](" +
                        resData.html_url +
                        ")" +
                        " ▫️ ";
                    const stars =
                        "` ⭐ Stars " + resData.stargazers_count + " ` ";
                    const issues = "` ❗ Issues " + resData.open_issues + " ` ";
                    const forks = "` 🍴 Forks " + resData.forks_count + " ` ";
                    let tags = "";
                    if (
                        resData &&
                        resData.topics &&
                        Array.isArray(resData.topics)
                    ) {
                        resData.topics.forEach((topic: string) => {
                            let tempTopic = " ` ";
                            tempTopic += topic;
                            tempTopic += " ` ";
                            tags += tempTopic;
                        });
                    }

                    const textSender = await modify
                        .getCreator()
                        .startMessage()
                        .setText(
                            fullName +
                                stars +
                                issues +
                                forks +
                                "```" +
                                resData.description +
                                "```" +
                                tags
                        );
                    if (room) {
                        textSender.setRoom(room);
                    }
                    await modify.getCreator().finish(textSender);
                    break;
                }
                default: 
                    throw new Error("Error!");
            }
        }

        
    }
    private async setAccessToken(context: SlashCommandContext, read: IRead, modify: IModify, http: IHttp, persis: IPersistence): Promise<void> {
        const accessToken = context.getArguments()[1];

        if (!accessToken) {
            const room: IRoom = context.getRoom();
            const textSender = await modify
                .getCreator()
                .startMessage()
                .setText("*Usage: `/github set-token ACCESS_TOKEN`*");

            if (room) {
                textSender.setRoom(room);
            }
            await modify.getCreator().finish(textSender);
            return;
        }

        const persistence = new AppPersistence(persis, read.getPersistenceReader());

        await persistence.setUserAccessToken(accessToken, context.getSender());

        const room: IRoom = context.getRoom();
            const textSender = await modify
                .getCreator()
                .startMessage()
                .setText("*Access Token Set Successfully*");

            if (room) {
                textSender.setRoom(room);
            }
            await modify.getCreator().finish(textSender);
    }
    public constructor(private readonly app: GithubAppApp) {}
    private async subscribeRepo(context: SlashCommandContext, read: IRead, modify: IModify, http: IHttp, persis: IPersistence): Promise<void> {
        const [, repoName] = context.getArguments();

        if (!repoName) {
            await sendNotification('Usage: `/github connect REPO_URL`', read, modify, context.getSender(), context.getRoom());
            return;
        }

        if (!repoName) {
            await sendNotification('Invalid GitHub repo address', read, modify, context.getSender(), context.getRoom());
            return;
        }

        const persistence = new AppPersistence(persis, read.getPersistenceReader());
        const accessToken = await persistence.getUserAccessToken(context.getSender());

        if (!accessToken) {
            await sendNotification(
                'You haven\'t configured your access key yet. Please run `/github set-token YOUR_ACCESS_TOKEN`',
                read,
                modify,
                context.getSender(),
                context.getRoom(),
            );
            return;
        }

        const sdk = new GithubSDK(http, accessToken);

        try {
            await sdk.createWebhook(repoName, await getWebhookUrl(this.app));
        } catch (err) {
            console.error(err);
            await sendNotification('Error connecting to the repo', read, modify, context.getSender(), context.getRoom());
            return;
        }

        await persistence.connectRepoToRoom(repoName, context.getRoom());

        await sendNotification('Successfully connected repo', read, modify, context.getSender(), context.getRoom());
    }
}
