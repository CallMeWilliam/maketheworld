// Foundational imports (React, Redux, etc.)
import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'

// MaterialUI imports
import {
    Container,
    Paper,
    Backdrop,
    CircularProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    Typography,
    List,
    ListItem,
    ListItemText,
    Divider,
    AppBar,
    Toolbar,
    IconButton,
    Menu,
    MenuItem
} from '@material-ui/core'
import MenuIcon from '@material-ui/icons/Menu'

// Local code imports
import { WSS_ADDRESS } from '../config'
import { parseCommand } from '../actions/behaviors'
import { receiveMessage } from '../actions/messages.js'
import { connectionRegister } from '../actions/connection.js'
import { registerCharacter } from '../actions/registeredCharacter.js'
import { registerWebSocket } from '../actions/webSocket.js'
import { fetchAndOpenWorldDialog } from '../actions/permanentAdmin'
import { activateMyCharacterDialog } from '../actions/UI/myCharacterDialog'
import { getMessages, getMostRecentRoomMessage } from '../selectors/messages.js'
import { getWebSocket } from '../selectors/webSocket.js'
import { getCharacterId } from '../selectors/connection'
import { getMyCharacters } from '../selectors/myCharacters'
import LineEntry from '../components/LineEntry.js'
import Message from './Message'
import RoomDescriptionMessage from './Message/RoomDescriptionMessage'
import useStyles from './styles'
import RoomDialog from './RoomDialog/'
import AllCharactersDialog from './AllCharactersDialog'
import WorldDialog from './WorldDialog/'
import MyCharacterDialog from './MyCharacterDialog'
import WhoDrawer from './WhoDrawer'
import { activateAllCharactersDialog } from '../actions/UI/allCharactersDialog'
import useAppSyncSubscriptions from './useAppSyncSubscriptions'

const CharacterPicker = ({ open, onClose = () => {} }) => {
    const myCharacters = useSelector(getMyCharacters)
    const handleClose = ({ name, characterId }) => (onClose({ name, characterId }))
    const classes = useStyles()
    const dispatch = useDispatch()

    return(
        <Dialog
            maxWidth="lg"
            open={open}
        >
            <DialogTitle
                id="room-dialog-title"
                className={classes.lightblue}
            >
                <Typography variant="overline">
                    Choose Your Character
                </Typography>
            </DialogTitle>
            <DialogContent>
                <List component="nav" aria-label="choose a character">
                    { (myCharacters || []).map(({ Name: name, CharacterId: characterId }) => (
                        <ListItem key={name} button onClick={handleClose({ name, characterId })}>
                            <ListItemText>
                                {name}
                            </ListItemText>
                        </ListItem>
                    ))}
                    <Divider />
                    <ListItem button onClick={ () => { dispatch(activateMyCharacterDialog({})) } }>
                        <ListItemText>
                            <em>Create a new character</em>
                        </ListItemText>
                    </ListItem>
                </List>
            </DialogContent>
        </Dialog>
    )
}

export const Chat = () => {
    useAppSyncSubscriptions()
    const webSocket = useSelector(getWebSocket)
    const messages = useSelector(getMessages)
    const mostRecentRoomMessage = useSelector(getMostRecentRoomMessage)
    const characterId = useSelector(getCharacterId)

    const dispatch = useDispatch()

    const classes = useStyles()

    const [ anchorEl, setAnchorEl ] = useState(null)
    const menuOpen = Boolean(anchorEl)
    const handleMenuClose = () => { setAnchorEl(null) }
    const handleMenuOpen = (event) => { setAnchorEl(event.currentTarget) }
    const handleCharacterOverview = () => {
        dispatch(activateAllCharactersDialog())
        handleMenuClose()
    }
    const handleWorldOverview = () => {
        dispatch(fetchAndOpenWorldDialog())
        handleMenuClose()
    }

    useEffect(() => {
        if (!webSocket) {
          let setupSocket = new WebSocket(WSS_ADDRESS)
          setupSocket.onopen = () => {
            console.log('WebSocket Client Connected')
          }
          setupSocket.onmessage = (message) => {
            const { type, ...rest } = JSON.parse(message.data)
            switch(type) {
                case 'sendmessage':
                    dispatch(receiveMessage(rest))
                    break
                case 'connectionregister':
                    dispatch(connectionRegister(rest))
                    break
                default:
            }
          }
          setupSocket.onerror = (error) => {
              console.error('WebSocket error: ', error)
          }
          dispatch(registerWebSocket(setupSocket))
        }
    }, [webSocket, dispatch])

    const [whoDrawerOpen, setWhoDrawerOpen] = useState(false)

    return (
        <React.Fragment>
        <div style={{ width: "100%", height: "100%", position: "relative", display: "flex", flexDirection: "column" }}>
            <AppBar position="relative" color="primary" className={classes.topAppBar}>
                <Toolbar>
                    {
                        mostRecentRoomMessage && <Container maxWidth="lg">
                            <List>
                                <RoomDescriptionMessage key={`RoomMessage`} mostRecent message={mostRecentRoomMessage} />
                            </List>
                        </Container>
                    }
                </Toolbar>
            </AppBar>
            <div style={{ position: "relative", height: "100%", width: "100%", overflowY: "hidden" }}>
                <div style={{ height: "100%", pointerEvents: "none" }}/>
                <div style={{ display: "flex", flexDirection: "row", position: "absolute", width: "100%", top: "0", left: "0", height: "100%" }}>
                    <Container className={classes.messageContainer}  maxWidth="lg">
                        <Paper className={classes.messagePaper}>
                            <List className={classes.messageList}>
                                {
                                    messages.map((message, index) => (
                                        <Message
                                            key={`Message-${index}`}
                                            { ...( message === mostRecentRoomMessage ? { mostRecent: true } : {})}
                                            message={message}
                                        />
                                    ))
                                }
                            </List>
                        </Paper>
                    </Container>
                </div>
                <div style={{ display: "flex", flexDirection: "row", position: "absolute", width: "100%", top: "0", left: "0", height: "100%", pointerEvents: "none" }}>
                    <div style={{ width: "100%" }}/>
                    <WhoDrawer open={whoDrawerOpen} toggleOpen={() => { setWhoDrawerOpen(!whoDrawerOpen) }} />
                </div>
            </div>

            <AppBar position="relative" color="primary" className={classes.bottomAppBar}>
                <Container className={classes.container} maxWidth="lg">
                    <Toolbar>
                        <IconButton
                            edge="start"
                            color="inherit"
                            aria-label="open drawer"
                            onClick={handleMenuOpen}
                        >
                            <MenuIcon />
                        </IconButton>
                        <LineEntry
                            className={classes.lineEntry}
                            callback={ (entry) => { dispatch(parseCommand(entry)) }}
                        />
                        <Menu
                            open={menuOpen}
                            anchorEl={anchorEl}
                            anchorOrigin={{
                                vertical: 'top',
                                horizontal: 'left',
                            }}
                            keepMounted
                            transformOrigin={{
                                vertical: 'bottom',
                                horizontal: 'left',
                            }}
                            onClose={handleMenuClose}
                        >
                            <MenuItem onClick={handleCharacterOverview}>
                                My Characters
                            </MenuItem>
                            <MenuItem onClick={handleWorldOverview}>
                                World Overview
                            </MenuItem>
                        </Menu>
                    </Toolbar>
                </Container>
            </AppBar>

            <AllCharactersDialog />
            <WorldDialog />
            <RoomDialog />
            <MyCharacterDialog />
            <CharacterPicker
                open={!characterId}
                onClose={({ name, characterId }) => () => {
                    dispatch(registerCharacter({ name, characterId }))
                }}
            />
            <Backdrop open={(characterId && !webSocket) ? true : false}>
                <CircularProgress color="inherit" />
            </Backdrop>
        </div>

        </React.Fragment>
    );
  }

export default Chat
