import { API, graphqlOperation } from 'aws-amplify'
import { putRoomMessage, putDirectMessage } from '../graphql/mutations'
import { v4 as uuidv4 } from 'uuid'

import {
    extractMutation,
    populateMutationVariables,
    batchMutations
} from './batchQL'
import { getCharacterId } from '../selectors/connection'

export const RECEIVE_MESSAGE = 'RECEIVE_MESSAGE'
export const SET_MESSAGE_OPEN = 'SET_MESSAGE_OPEN'

export const receiveMessage = ({ MessageId, ...message }) => ({
    type: RECEIVE_MESSAGE,
    payload: {
        MessageId: MessageId || uuidv4(),
        ...message
    }
})

export const setMessageOpen = ({ MessageId, open }) => ({
    type: SET_MESSAGE_OPEN,
    payload: {
        MessageId,
        open
    }
})

export const worldMessageAdded = ({ MessageId, Message }) => (receiveMessage({
    protocol: 'worldMessage',
    MessageId: MessageId || uuidv4(),
    Message
}))

export const playerMessageAdded = ({ MessageId, CharacterId, Message }) => (receiveMessage({
    protocol: 'playerMessage',
    CharacterId,
    MessageId,
    Message
}))

export const directMessageAdded = ({ MessageId, ToCharacterId, FromCharacterId, Message }) => (receiveMessage({
    protocol: 'directMessage',
    MessageId,
    ToCharacterId,
    FromCharacterId,
    Message
}))

export const announcementAdded = ({ MessageId, Message, Title }) => (receiveMessage({
    protocol: 'announcementMessage',
    MessageId,
    Message,
    Title
}))

export const sendMessage = ({RoomId, Message, FromCharacterId}) => {
    if (RoomId && Message) {
        return API.graphql(graphqlOperation(putRoomMessage, {
            RoomId,
            Message,
            FromCharacterId
        }))
        .catch((err) => { console.log(err)})
    }
    return Promise.resolve({})
}

export const sendDirectMessage = ({ ToCharacterId, Message }) => (_, getState) => {
    if (ToCharacterId && Message) {
        const state = getState()
        const FromCharacterId = getCharacterId(state)
        const messageTemplate = extractMutation(putDirectMessage)
        const recipients = (ToCharacterId === FromCharacterId) ? [ToCharacterId] : [ToCharacterId, FromCharacterId]
        const messages = recipients.map((CharacterId) => (populateMutationVariables({
            template: messageTemplate,
            CharacterId,
            Message,
            FromCharacterId,
            ToCharacterId,
            MessageId: '',
            CreatedTime: ''
        })))
        return API.graphql(graphqlOperation(batchMutations(messages))).catch((err) => { console.log(err)})
    }
    return Promise.resolve({})

}