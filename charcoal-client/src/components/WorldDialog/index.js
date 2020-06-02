// Foundational imports (React, Redux, etc.)
import React, { createContext, useContext } from 'react'
import { useDispatch, useSelector } from 'react-redux'

// MaterialUI imports
import {
    Card,
    CardHeader,
    CardContent,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Tooltip,
    IconButton
} from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import {
    TreeView,
    TreeItem
} from '@material-ui/lab'
import CreateIcon from '@material-ui/icons/Create'
import NeighborhoodAddIcon from '@material-ui/icons/PlaylistAdd'
import RoomAddIcon from '@material-ui/icons/AddBox'
import HouseIcon from '@material-ui/icons/House'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import ChevronRightIcon from '@material-ui/icons/ChevronRight'

// Local code imports
import RoomDialog from '../RoomDialog/'
import NeighborhoodDialog from '../NeighborhoodDialog/'
import { closeWorldDialog } from '../../actions/UI/worldDialog'
import { activateRoomDialog } from '../../actions/UI/roomDialog'
import { activateNeighborhoodDialog } from '../../actions/UI/neighborhoodDialog'
import { fetchAndOpenRoomDialog, fetchAndOpenNeighborhoodDialog } from '../../actions/permanentAdmin'
import { getWorldDialogUI } from '../../selectors/UI/worldDialog.js'
import { getNeighborhoodTree } from '../../selectors/permanentHeaders'
import { getMyCurrentCharacter } from '../../selectors/myCharacters'
import useStyles from '../styles'

const GrantContext = createContext({})

const useTreeItemStyles = makeStyles(theme => ({
    root: {
        color: theme.palette.text.secondary,
        '&:hover > $content': {
          backgroundColor: theme.palette.action.hover,
        },
      },
      content: {
        color: theme.palette.text.secondary,
        fontWeight: theme.typography.fontWeightMedium,
        '$expanded > &': {
          fontWeight: theme.typography.fontWeightRegular,
        },
      },
      expanded: {},
      label: {
        fontWeight: 'inherit',
        color: 'inherit',
      },
      labelRoot: {
        display: 'flex',
        alignItems: 'center',
        padding: theme.spacing(0.5, 0),
        fontSize: "24px"
      },
      labelIcon: {
        marginRight: theme.spacing(1),
      },
      labelText: {
        fontWeight: 'inherit',
        flexGrow: 1,
      },
      labelActions: {
          marginLeft: theme.spacing(2)
      }
}))

const OverviewTreeItem = ({ nodeId, labelText, ActionIcons, ...rest }) => {
    const classes = useTreeItemStyles()

    return <TreeItem
        label={
        <div className={classes.labelRoot}>
            <Typography variant="body1" className={classes.labelText}>
                {labelText}
            </Typography>
            <Typography variant="h6" className={classes.labelActions} color="inherit">
                {ActionIcons}
            </Typography>
        </div>
        }
        classes={{
            root: classes.root,
            content: classes.content,
            label: classes.label,
        }}
        nodeId={nodeId}
        {...rest}
    />
}

const NeighborhoodTreeItem = ({ nodeId, name, Ancestry = '', children }) => {
    const dispatch = useDispatch()
    const grantMap = useContext(GrantContext)
    const grants = grantMap[nodeId]
    return <OverviewTreeItem
        nodeId={nodeId}
        labelText={name}
        endIcon={<ChevronRightIcon />}
        children={children}
        ActionIcons={<React.Fragment>
            { grants.ExtendPrivate &&
                <Tooltip title={"Add Neighborhood"}>
                    <IconButton
                        aria-label="add neighborhood"
                        onClick={(event) => {
                            event.stopPropagation()
                            dispatch(activateNeighborhoodDialog({
                                parentId: nodeId,
                                parentName: name,
                                ancestry: `${Ancestry}:`,
                                parentAncestry: Ancestry,
                                nested: true
                            }))
                        }}
                    >
                        <NeighborhoodAddIcon fontSize="inherit" />
                    </IconButton>
                </Tooltip>
            }
            {
                grants.Edit &&
                <Tooltip title={"Add Room"}>
                    <IconButton
                        aria-label="add room"
                        onClick={(event) => {
                            event.stopPropagation()
                            dispatch(activateRoomDialog({
                                ParentId: nodeId,
                                nested: true
                            }))
                        }}
                    >
                        <RoomAddIcon fontSize="inherit" />
                    </IconButton>
                </Tooltip>
            }
            {
                grants.Edit &&
                <Tooltip title={"Edit Neighborhood"}>
                    <IconButton
                        aria-label="edit neighborhood"
                        onClick={(event) => {
                            event.stopPropagation()
                            dispatch(fetchAndOpenNeighborhoodDialog(nodeId, true))
                        }}
                    >
                        <CreateIcon fontSize="inherit" />
                    </IconButton>
                </Tooltip>
            }
        </React.Fragment>}
    />
}

const RoomTreeItem = ({ nodeId, name, parentId }) => {
    const dispatch = useDispatch()
    const grantMap = useContext(GrantContext)
    const grants = grantMap[parentId || 'ROOT']
    return <OverviewTreeItem
        nodeId={nodeId}
        labelText={name}
        endIcon={<HouseIcon />}
        ActionIcons={grants.Edit && <Tooltip title={"Edit Room"}>
            <IconButton
                aria-label="edit room"
                onClick={(event) => {
                    event.stopPropagation()
                    dispatch(fetchAndOpenRoomDialog(nodeId, true))
                }}
            >
                <CreateIcon fontSize="inherit" />
            </IconButton>
        </Tooltip>}
    />
}

const NeighborhoodItem = ({ item }) => {
    const { Type, PermanentId, Name, ParentId, children } = item
    switch(Type) {
        case 'ROOM':
            return <RoomTreeItem
                key={PermanentId}
                nodeId={PermanentId}
                name={Name}
                parentId={ParentId}
            />
        default:
            return <NeighborhoodTreeItem
                key={PermanentId}
                nodeId={PermanentId}
                name={Name}
            >
                {
                    Object.values(children || {})
                        .map((item) => (<NeighborhoodItem key={item.PermanentId} item={item} />))
                }
            </NeighborhoodTreeItem>
    }
}

export const WorldDialog = () => {
    const { open } = useSelector(getWorldDialogUI)
    const neighborhoodTree = useSelector(getNeighborhoodTree)
    const { Grants = new Proxy({}, { get: () => ({}) }) } = useSelector(getMyCurrentCharacter)
    const dispatch = useDispatch()

    const classes = useStyles()
    return(
        <Dialog
            maxWidth="lg"
            open={open}
        >
            <DialogTitle id="room-dialog-title">World Overview</DialogTitle>
            <DialogContent>
                <RoomDialog nested />
                <NeighborhoodDialog nested />
                <Card className={classes.card}>
                    <CardHeader
                        title="Neighborhoods and Rooms"
                        className={classes.lightblue}
                        titleTypographyProps={{ variant: "overline" }}
                        action={<React.Fragment>
                                { Grants.ROOT.ExtendPrivate &&
                                    <Tooltip title={"Add Neighborhood"}>
                                        <IconButton
                                            aria-label="add neighborhood"
                                            onClick={(event) => {
                                                event.stopPropagation()
                                                dispatch(activateNeighborhoodDialog({
                                                    parentId: '',
                                                    parentName: '',
                                                    nested: true
                                                }))
                                            }}
                                        >
                                            <NeighborhoodAddIcon fontSize="inherit" />
                                        </IconButton>
                                    </Tooltip>
                                }
                                { Grants.ROOT.Edit &&
                                    <Tooltip title={"Add Room"}>
                                        <IconButton
                                            aria-label="add room"
                                            onClick={(event) => {
                                                event.stopPropagation()
                                                dispatch(activateRoomDialog({
                                                    parentId: '',
                                                    parentName: '',
                                                    nested: true
                                                }))
                                            }}
                                        >
                                            <RoomAddIcon fontSize="inherit" />
                                        </IconButton>
                                    </Tooltip>
                                }
                            </React.Fragment>}
                    />
                    <CardContent className={classes.scrollingCardContent} >
                        <GrantContext.Provider value={Grants}>
                            <TreeView
                                className={classes.treeView}
                                defaultCollapseIcon={<ExpandMoreIcon />}
                                defaultExpandIcon={<ChevronRightIcon />}
                            >
                                {
                                    Object.values(neighborhoodTree)
                                        .map((item) => (<NeighborhoodItem key={item.PermanentId} item={item} />))
                                }
                            </TreeView>
                        </GrantContext.Provider>
                    </CardContent>
                </Card>
            </DialogContent>
            <DialogActions>
                <Button onClick={ () => { dispatch(closeWorldDialog()) } }>
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    )
}

export default WorldDialog