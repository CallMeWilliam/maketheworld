// Foundational imports (React, Redux, etc.)
import React, { useReducer, useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useGesture } from 'react-use-gesture'
import { forceSimulation, forceCollide } from 'd3-force'

// MaterialUI imports
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    IconButton
} from '@material-ui/core'
import RoomAddIcon from '@material-ui/icons/AddBox'
import RoomDeleteIcon from '@material-ui/icons/Delete'

import { getEditMapDialogUI } from '../../selectors/UI/mapDialog'
import { closeEditMapDialog } from '../../actions/UI/mapDialog'
import { putAndCloseEditMapDialog } from '../../actions/maps'
import MapDisplay from './MapDisplay'
import MapRoom from './MapRoom'
import useStyles from '../styles'
import { getPermanentHeaders } from '../../selectors/permanentHeaders'
import forceFlexLink from './forceFlexLink'
import { objectMap, objectFilter } from '../../lib/objects'

const END_DRAG = 'END_DRAG'
const CLEAR_DRAG_FLAG = 'CLEAR_DRAG_FLAG'
const DRAG = 'DRAG'
const DRAG_TIMER_SET = 'DRAG_TIMER_SET'
const DRAG_TIMER_FIRE = 'DRAG_TIMER_FIRE'
const REGISTER_D_THREE = 'REGISTER_D_THREE'
const UNREGISTER_D_THREE = 'UNREGISTER_D_THREE'
const CLEAR_SELECT = 'CLEAR_SELECT'
const SELECT_ROOM = 'SELECT_ROOM'
const REMOVE_SELECTED_ROOMS = 'REMOVE_SELECTED_ROOMS'
const TICK = 'TICK'

const EditableRoom = (props) => {
    const classes = useStyles()
    const {
        localDispatch,
        PermanentId,
        selected,
        className=classes.svgLightBlue,
        contrastClassName=classes.svgLightBlueContrast,
        selectedClassName=classes.svgBlue,
        selectedContrastClassName=classes.svgBlueContrast,
        ...rest
    } = props
    const bind = useGesture({
        onDragStart: () => {
            localDispatch({ type: DRAG_TIMER_SET, localDispatch })
        },
        onDrag: ({ movement }) => {
            localDispatch({ type: DRAG, PermanentId, movement })
        },
        onDragEnd: () => {
            localDispatch({ type: END_DRAG, PermanentId })
            setTimeout(() => { localDispatch({ type: CLEAR_DRAG_FLAG })}, 10)
        },
        onClick: () => {
            localDispatch({ type: CLEAR_SELECT })
            if (!selected) {
                localDispatch({ type: SELECT_ROOM, PermanentId })
            }
        }
    })
    return <MapRoom
        PermanentId={PermanentId}
        className={selected ? selectedClassName : className}
        contrastClassName={selected ? selectedContrastClassName : contrastClassName}
        {...rest}
        {...bind()}
    />
}

const linksFromNodesAndRooms = (nodes, rooms) => {
    const idToNodeIndex = nodes
        .reduce((previous, { PermanentId, index }) => ({ ...previous, [PermanentId]: index }), {})
    return Object.values(rooms)
        .reduce((previous, { PermanentId, Exits }) => ([ ...previous, ...(Exits || []).map(({ RoomId }) => ({ from: PermanentId, to: RoomId })) ]), [])
        .filter(({ to }) => (idToNodeIndex[to]))
        .map(({ from, to }, index) => ({
            source: idToNodeIndex[from],
            target: idToNodeIndex[to],
            index
        }))
}

const mapDisplayReducer = (state, action) => {
    const { type, PermanentId } = action
    const updateState = (props) => ({
        ...state,
        Rooms: {
            ...(state.Rooms || {}),
            [PermanentId]: {
                ...((state.Rooms && state.Rooms[PermanentId]) || {}),
                ...props
            }
        }
    })
    const { DThree, nodes, ...restOfState } = state
    const currentNode = ((nodes || []).find((node) => (node.PermanentId === PermanentId))) || {}
    switch(type) {
        case CLEAR_SELECT:
            if (!state.dragging) {
                return {
                    ...state,
                    Rooms: objectMap(state.Rooms || {}, ({ selected, ...rest }) => (rest))
                }
            }
            return state
        case SELECT_ROOM:
            if (!state.dragging) {
                return {
                    ...state,
                    Rooms: {
                        ...(state.Rooms || {}),
                        [PermanentId]: {
                            ...((state.Rooms || {})[PermanentId] || {}),
                            selected: true
                        }
                    }
                }
            }
            return state
        case REMOVE_SELECTED_ROOMS:
            if (!DThree) {
                return state
            }
            const trimmedNodes = nodes.filter(({ PermanentId }) => (!(state.Rooms && state.Rooms[PermanentId] && state.Rooms[PermanentId].selected)))
            const trimmedRooms = state.Rooms && objectFilter(state.Rooms, ({ selected }) => (!selected))
            const trimmedLinks = linksFromNodesAndRooms(trimmedNodes, trimmedRooms)
            DThree
                .nodes(trimmedNodes)
                .force("link", forceFlexLink(trimmedLinks).minDistance(70).maxDistance(180))
            return {
                ...state,
                Rooms: trimmedRooms,
                nodes: trimmedNodes,
                links: trimmedLinks
            }
        //
        // We set a timer and fire event that sets state.dragging to TRUE only after a second of
        // drag (so that shorter mouse-down/mouse-up sequences can be interpreted as onClick events)
        //
        case DRAG_TIMER_SET:
            if (!state.dragTimer) {
                return {
                    ...state,
                    dragTimer: setTimeout(() => { action.localDispatch({ type: DRAG_TIMER_FIRE }) }, 100)
                }
            }
            return state
        case DRAG_TIMER_FIRE:
            return {
                ...state,
                dragging: true,
                dragTimer: null
            }
        case CLEAR_DRAG_FLAG:
            if (state.dragTimer) {
                clearTimeout(state.dragTimer)
            }
            return {
                ...state,
                dragging: false,
                dragTimer: null
            }
        case END_DRAG:
            currentNode.fx = null
            currentNode.fy = null
            if (DThree) {
                DThree.alphaTarget(0)
            }
            return updateState({ dragOriginX: undefined, dragOriginY: undefined })
        case DRAG:
            const { movement: [X, Y] } = action
            const dragRoom = state.Rooms[PermanentId]
            const dragOriginX = dragRoom.dragOriginX || dragRoom.X
            const dragOriginY = dragRoom.dragOriginY || dragRoom.Y
            const fixedX = dragOriginX + X
            const fixedY = dragOriginY + Y
            currentNode.fx = fixedX - 300
            currentNode.fy = fixedY - 200
            if (DThree && DThree.alpha() < 0.1) {
                DThree.alpha(1)
                DThree.alphaTarget(0.5)
                DThree.restart()
            }
            return updateState({
                X: fixedX,
                Y: fixedY,
                dragOriginX,
                dragOriginY
            })
        case REGISTER_D_THREE:
            let newNodes = Object.values(state.Rooms)
                .map(({ PermanentId, X, Y }, index) => ({
                    index,
                    PermanentId,
                    x: X - 300,
                    y: Y - 200
                }))
            let links = linksFromNodesAndRooms(newNodes, state.Room || {})
            const force = forceSimulation(newNodes)
                .alphaDecay(0.15)
                .force("boundingBox", boundingForceFactory(newNodes))
                .force("gridDrift", gridInfluenceForceFactory(newNodes, 50.0))
                .force("link", forceFlexLink(links).minDistance(70).maxDistance(180))
                .force("collision", forceCollide(40).iterations(3))
            force.on('tick', () => {
                action.localDispatch({ type: TICK })
            })
            return {
                ...state,
                DThree: force,
                nodes: newNodes,
                links
            }
        case UNREGISTER_D_THREE:
            DThree.stop()
            return restOfState
        case TICK:
            return {
                ...state,
                Rooms: nodes.reduce((previous, { PermanentId, x, y }) => ({
                    ...previous,
                    [PermanentId]: {
                        ...(previous[PermanentId] || { PermanentId }),
                        X: x + 300,
                        Y: y + 200
                    }
                }), state.Rooms)
            }
        default:
            return state
    }
}

const boundingForceFactory = (nodes) => () => {
    nodes.forEach((node) => {
        node.x = Math.max(-260, Math.min(260, node.x))
        node.y = Math.max(-160, Math.min(160, node.y))
    })
}

const gridInfluenceForceFactory = (nodes, granularity) => (alpha) => {
    const sqrtAlpha = Math.sqrt(alpha)
    nodes.forEach((node) => {
        const targetX = Math.round(node.x / granularity) * granularity
        const targetY = Math.round(node.y / granularity) * granularity
        node.vx += (targetX - node.x) * 0.4 * sqrtAlpha
        node.vy += (targetY - node.y) * 0.4 * sqrtAlpha
    })
}

export const EditMapDisplay = ({ map, onStable = () => {}, onUnstable = () => {} }) => {
    const permanentHeaders = useSelector(getPermanentHeaders)
    const [state, localDispatch] = useReducer(mapDisplayReducer, {
        ...map,
        Rooms: objectMap(map.Rooms || {}, ({ PermanentId, ...rest }) => ({
            PermanentId,
            Exits: (permanentHeaders[PermanentId] || { Exits: [] }).Exits || [],
            ...rest
        }))
    })
    const [ stable, setStable ] = useState(false)
    const { DThree } = state
    const shouldBeStable = DThree && DThree.alpha() < 0.1
    useEffect(() => {
        if (!stable && shouldBeStable) {
            setStable(true)
            onStable({
                MapId: state.MapId,
                Name: state.Name,
                Rooms: Object.values(state.Rooms).map(({ PermanentId, X, Y }) => ({ PermanentId, X: Math.round(X), Y: Math.round(Y) }))
            })
        }
        if (stable && !shouldBeStable) {
            setStable(false)
            onUnstable()
        }
    }, [stable, shouldBeStable, setStable, onStable, onUnstable, state])
    useEffect(() => {
        localDispatch({
            type: REGISTER_D_THREE,
            localDispatch
        })
        return () => {
            localDispatch({ type: UNREGISTER_D_THREE })
        }
    }, [localDispatch])
    return <div style={{ display: "flex", flexDirection: "row" }}>
        <div style={{ display: "flex", flexDirection: "column" }}>
            <div>
                <IconButton>
                    <RoomAddIcon />
                </IconButton>
            </div>
            <div>
                <IconButton onClick={() => { localDispatch({ type: REMOVE_SELECTED_ROOMS }) }}>
                    <RoomDeleteIcon />
                </IconButton>
            </div>
        </div>
        <div>
            <MapDisplay
                map={{
                    ...state,
                    Rooms: objectMap(state.Rooms || {}, ({ PermanentId, X, Y, selected }) => ({ PermanentId, X, Y, selected }))
                }}
                roomComponent={(props) => (<EditableRoom localDispatch={localDispatch} {...props} />)}
            />
        </div>
    </div>

}

export const EditMapDialog = () => {
    const { open, map } = useSelector(getEditMapDialogUI)
    const [ stableState, setStable ] = useState(null)
    const dispatch = useDispatch()
    const classes = useStyles()

    const closeHandler = () => { dispatch(closeEditMapDialog()) }
    const saveHandler = () => { dispatch(putAndCloseEditMapDialog(stableState)) }
    return(
        <Dialog
            maxWidth="lg"
            open={open}
            onClose={closeHandler}
        >
            <DialogTitle id="help-dialog-title" className={classes.lightblue}>Edit Map</DialogTitle>
            <DialogContent>
                <EditMapDisplay
                    map={map}
                    onStable={(state) => { setStable(state) }}
                    onUnstable={() => { setStable(null) }}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={closeHandler}>
                    Close
                </Button>
                <Button onClick={saveHandler} disabled={stableState === null} >
                    Save
                </Button>
            </DialogActions>
        </Dialog>
    )
}

export default EditMapDialog