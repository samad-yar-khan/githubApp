import { IPersistence, IPersistenceRead } from '@rocket.chat/apps-engine/definition/accessors';
import { RocketChatAssociationModel, RocketChatAssociationRecord } from '@rocket.chat/apps-engine/definition/metadata';
import { IRoom } from '@rocket.chat/apps-engine/definition/rooms';
import { IUser } from '@rocket.chat/apps-engine/definition/users';

export class AppPersistence {
    constructor(private readonly persistence: IPersistence, private readonly persistenceRead: IPersistenceRead) {}

    public async connectRepoToRoom(repoName: string, room: IRoom): Promise<void> {
        const roomAssociation = new RocketChatAssociationRecord(RocketChatAssociationModel.ROOM, room.id);
        const repoAssociation = new RocketChatAssociationRecord(RocketChatAssociationModel.MISC, `repo:${repoName}`);

        await this.persistence.updateByAssociations([roomAssociation, repoAssociation], {
            repoName,
            room: room.id,
        }, true);
    }

    public async setUserAccessToken(accessToken: string, user: IUser): Promise<void> {
        const userAssociation = new RocketChatAssociationRecord(RocketChatAssociationModel.USER, user.id);
        const typeAssociation = new RocketChatAssociationRecord(RocketChatAssociationModel.MISC, 'github-key');

        await this.persistence.updateByAssociations([userAssociation, typeAssociation], { accessToken }, true);
    }

    public async getConnectedRoomId(repoName: string): Promise<string | undefined> {
        const repoAssociation = new RocketChatAssociationRecord(RocketChatAssociationModel.MISC, `repo:${repoName}`);

        const [result] = await this.persistenceRead.readByAssociations([repoAssociation]);

        return result ? (result as any).room : undefined;
    }

    public async getUserAccessToken(user: IUser): Promise<string | undefined> {
        const userAssociation = new RocketChatAssociationRecord(RocketChatAssociationModel.USER, user.id);
        const typeAssociation = new RocketChatAssociationRecord(RocketChatAssociationModel.MISC, 'github-key');

        const [result] = await this.persistenceRead.readByAssociations([userAssociation, typeAssociation]);

        return result ? (result as any).accessToken : undefined;
    }
}

export const persistUIData = async (persistence: IPersistence, id: string, data: any): Promise<void> => {
    const association = new RocketChatAssociationRecord(RocketChatAssociationModel.USER, `${ id }#UI`);
    await persistence.updateByAssociation(association, data, true);
};

export const getUIData = async (persistenceRead: IPersistenceRead, id: string): Promise<any> => {
    const association = new RocketChatAssociationRecord(RocketChatAssociationModel.USER, `${ id }#UI`);
    const result = await persistenceRead.readByAssociation(association) as Array<any>;
    return result && result.length ? result[0] : null;
};

export const persistRoomTasks = async (persistence: IPersistence, id: string, data: any): Promise<void> => {
    const association = new RocketChatAssociationRecord(RocketChatAssociationModel.ROOM, `${ id }#TASKS`);
    await persistence.updateByAssociation(association, data, true);
};

export const getRoomTasks = async (persistenceRead: IPersistenceRead, id: string): Promise<any> => {
    const association = new RocketChatAssociationRecord(RocketChatAssociationModel.ROOM, `${ id }#TASKS`);
    const result = await persistenceRead.readByAssociation(association) as Array<any>;
    return result && result.length ? result[0] : [];
};
