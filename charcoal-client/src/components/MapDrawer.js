import React from 'react'
import { useSelector } from 'react-redux'

import {
    Paper,
    IconButton
} from '@material-ui/core'
import OpenArrowIcon from '@material-ui/icons/ChevronRight'
import CloseArrowIcon from '@material-ui/icons/ChevronLeft'
import MapIcon from '@material-ui/icons/Explore'

import { getCurrentMap } from '../selectors/maps'
import NavigationMap from './Map/NavigationMap'
import { useStyles } from './styles'

export const MapDrawer = ({
    open = false,
    toggleOpen = () => {}
}) => {

    const classes = useStyles()
    const currentMap = useSelector(getCurrentMap)

    return (
        <div className={open ? classes.mapDrawerHorizontalOpen : classes.mapDrawerHorizontalClose }>
            <div style={{ display: "flex", flexDirection: "column", height: "100%", pointerEvents: "none" }}>
                <Paper
                    className={ open ? classes.mapDrawerVerticalOpen : classes.mapDrawerVerticalClose }
                >
                    <div style={{ position: 'absolute', bottom: 0, right: 0, paddingRight: "7px", paddingBottom: '7px', verticalAlign: 'center' }}>
                        { !open && <IconButton disabled><MapIcon /></IconButton> }
                        <IconButton
                            color="inherit"
                            aria-label="open drawer"
                            onClick={toggleOpen}
                        >
                            { open ? <CloseArrowIcon /> : <OpenArrowIcon /> }
                        </IconButton>
                    </div>
                    <NavigationMap map={currentMap} open={open} />
                </Paper>
                <div style={{ flexBasis: "100%", flexShrink: 100 }} />
            </div>
        </div>
    )
}

export default MapDrawer