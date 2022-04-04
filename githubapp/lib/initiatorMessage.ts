
import {
    IHttp,
    IMessageBuilder,
    IModify,
    IModifyCreator,
    IPersistence,
    IRead
} from "@rocket.chat/apps-engine/definition/accessors";
import { ButtonStyle } from "@rocket.chat/apps-engine/definition/uikit";

export async function initiatorMessage({
    data,
    read,
    persistence,
    modify,
    http,
}: {
    data;
    read: IRead;
    persistence: IPersistence;
    modify: IModify;
    http: IHttp;
}) {
    const greetBuilder = await modify
    .getCreator()
    .startMessage()
    .setRoom(data.room)
    .setText(`Hey _${data.sender.username}_ !`);

    if (data.room.type !== "l") {
        await modify
            .getNotifier()
            .notifyUser(data.sender, greetBuilder.getMessage());
    } else {
        await modify.getCreator().finish(greetBuilder);
    }

    const builder = await modify.getCreator().startMessage().setRoom(data.room);

    const block = modify.getCreator().getBlockBuilder();

    block.addSectionBlock({
        text: block.newPlainTextObject("What do you want to me fetch 👇 "),
    });

    block.addActionsBlock({
        blockId: "githubdata",
        elements: [
            block.newButtonElement({
                actionId: "githubDataSelect",
                text: block.newPlainTextObject("Repo"),
                value: "",
                style: ButtonStyle.PRIMARY,
            }),
            block.newButtonElement({
                actionId: "githubDataSelect",
                text: block.newPlainTextObject("Issues"),
                value: "/issues",
                style: ButtonStyle.DANGER,
            }),
            block.newButtonElement({
                actionId: "githubDataSelect",
                text: block.newPlainTextObject("Contributors"),
                value: "/contributors",
                style: ButtonStyle.PRIMARY,
            }),
            block.newButtonElement({
                actionId: "githubDataSelect",
                text: block.newPlainTextObject("Pull Requests"),
                value: "/pulls",
                style: ButtonStyle.PRIMARY,
            }),
        ],
    });

    builder.setBlocks(block);

    await modify
    .getNotifier()
    .notifyUser(data.sender, builder.getMessage());

    

}
