import { RECEIVE_MESSAGE } from '../actions/messages.js'
import {
    playerMessage,
    worldMessage,
    roomDescription,
    announcementMessage,
    neighborhoodDescription,
    directMessage
} from '../store/messages'

export const reducer = (state = [], action) => {
    const { type: actionType = 'NOOP', payload = '' } = action || {}
    switch (actionType) {
        case RECEIVE_MESSAGE:
            const { protocol = '', ...rest } = payload
            const { Message } = rest
            switch (protocol) {
                case 'playerMessage':
                    if (Message) {
                        return [ ...state, new playerMessage(rest) ]
                    }
                    else {
                        return state
                    }
                case 'announcementMessage':
                    if (Message) {
                        return [ ...state, new announcementMessage(rest) ]
                    }
                    else {
                        return state
                    }
                case 'directMessage':
                    return Message ? [ ...state, new directMessage(rest) ] : state
                case 'roomDescription':
                    return [ ...state, new roomDescription(rest) ]
                case 'neighborhoodDescription':
                    return [ ...state, new neighborhoodDescription(rest) ]
                default:
                    return [ ...state, new worldMessage(rest) ]
            }
        default: return state
    }
}

export default reducer