import { socketDispatch } from './webSocket.js'

export const RECEIVE_MESSAGE = 'RECEIVE_MESSAGE'

export const receiveMessage = (message) => ({
    type: RECEIVE_MESSAGE,
    payload: message
})

export const worldMessageAdded = (message) => (receiveMessage({
    protocol: 'worldMessage',
    message
}))

export const sendMessage = socketDispatch('sendmessage')
