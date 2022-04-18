import { IModify, IRead } from '@rocket.chat/apps-engine/definition/accessors';
import { TextObjectType } from '@rocket.chat/apps-engine/definition/uikit/blocks';
import { IUIKitModalViewParam } from '@rocket.chat/apps-engine/definition/uikit/UIKitInteractionResponder';
import { ModalsEnum } from '../enum/Modals';
import { AppEnum } from '../enum/App';

export async function addTokenModal({ modify }: { modify: IModify }): Promise<IUIKitModalViewParam> {
	const viewId = ModalsEnum.ADD_TOKEN_VIEW;
    const block = modify.getCreator().getBlockBuilder();

    block.addSectionBlock({
        text: { text: "Gihub Access Token is needed for certain features like subscriptions", type: TextObjectType.PLAINTEXT },
    });

    block.addInputBlock({
        blockId: ModalsEnum.TOKEN_BLOCK,
        label: { text: "Enter Github Access Token", type: TextObjectType.PLAINTEXT },
        element: block.newPlainTextInputElement({
            actionId: ModalsEnum.TOKEN_INPUT,
            placeholder: { text: '', type: TextObjectType.PLAINTEXT },
        })
    });

	return {
		id: viewId,
		title: {
			type: TextObjectType.PLAINTEXT,
			text: AppEnum.DEFAULT_TITLE + ' - ' + ModalsEnum.ADD_TOKEN_TITLE,
		},
        submit: block.newButtonElement({
            text: {
                type: TextObjectType.PLAINTEXT,
                text: 'Save'
            }
        }),
		close: block.newButtonElement({
			text: {
				type: TextObjectType.PLAINTEXT,
				text: 'Dismiss',
			},
		}),
		blocks: block.getBlocks(),
	};
}
