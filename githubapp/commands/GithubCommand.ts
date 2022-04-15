import { ISlashCommand, SlashCommandContext } from "@rocket.chat/apps-engine/definition/slashcommands";
import {
    IHttp,
    IMessageBuilder,
    IModify,
    IModifyCreator,
    IPersistence,
    IRead
} from "@rocket.chat/apps-engine/definition/accessors";

  import {IMessage} from '@rocket.chat/apps-engine/definition/messages'
  import {IRoom} from '@rocket.chat/apps-engine/definition/rooms'
  import {IUser} from '@rocket.chat/apps-engine/definition/users'
  import { initiatorMessage } from "../lib/initiatorMessage";

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
            arguments: command
        };

        if(Array.isArray(command) && command.length === 1 ){
            await initiatorMessage({ data, read, persistence, modify, http });
        }else if(Array.isArray(command) && command.length === 2){   
            const repository = command[0];
            const resource = command[1];
            switch(resource){
                case 'issues':{
                    const gitResponse = await http.get(
                        `https://api.github.com/repos/${repository}/issues`
                    );
                    const resData = gitResponse.data;
                    const room: IRoom = context.getRoom()
                    const textSender = await modify
                            .getCreator()
                            .startMessage()
                            .setText(`*ISSUES LIST*`);

                        if (room) {
                            textSender.setRoom(room);
                        }
                        let ind =0;
                        await modify.getCreator().finish(textSender);
                        resData.forEach(async (issue) => {
                            if (typeof issue.pull_request === "undefined" && ind < 10) {
                                const title = issue.title;
                                const url = issue.html_url;

                                const textSender = await modify
                                    .getCreator()
                                    .startMessage()
                                    .setText(`[ #${issue.number} ](${url})  *${issue.title}*`);

                                if (room) {
                                    textSender.setRoom(room);
                                }

                                await modify.getCreator().finish(textSender);
                                ind++;
                            }
                        });
                    break;
                }
                case 'pulls': 
                    console.log('Calling!');
                    break;
                
                case 'contributors': 
                    console.log('Calling!');
                    break;

                default : // [7]
                    throw new Error('Error!');
                }
        }
       
    }
}
