import { IHttp, IModify, IPersistence, IRead } from '@rocket.chat/apps-engine/definition/accessors';
import { ApiEndpoint, IApiEndpointInfo, IApiRequest, IApiResponse } from '@rocket.chat/apps-engine/definition/api';
import { IUser } from '@rocket.chat/apps-engine/definition/users';
import { AppPersistence } from '../lib/persistence';

export class WebhookEndpoint extends ApiEndpoint {
    public path = 'webhook';

    public async post(
        request: IApiRequest,
        endpoint: IApiEndpointInfo,
        read: IRead,
        modify: IModify,
        http: IHttp,
        persis: IPersistence,
    ): Promise<IApiResponse> {
        const sender : IUser = (await read.getUserReader().getAppUser()) as IUser;

        if (request.headers['x-github-event'] !== 'push') {
            return this.success();
        }
        console.log()
        let payload: any;

        if (request.headers['content-type'] === 'application/x-www-form-urlencoded') {
            payload = JSON.parse(request.content.payload);
        } else {
            payload = request.content;
        }

        const persistence = new AppPersistence(persis, read.getPersistenceReader());

        const roomId = await persistence.getConnectedRoomId(payload.repository.full_name);

        if (!roomId) {
            return this.success();
        }

        const room = await read.getRoomReader().getById(roomId);

        if (!room) {
            return this.success();
        }

        const message = modify.getCreator().startMessage({
            room,
            sender,
            avatarUrl: payload.sender.avatar_url,
            alias: payload.sender.login,
            text: `[${payload.sender.login}](${payload.sender.html_url}) just pushed ${
                payload.commits.length
            } commits to [${payload.repository.full_name}](${payload.repository.html_url})`,
        });

        modify.getCreator().finish(message);

        return this.success();
    }
}