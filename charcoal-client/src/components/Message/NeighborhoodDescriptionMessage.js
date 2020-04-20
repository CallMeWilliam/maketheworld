import React from 'react'

import {
    Typography,
    ListItem,
    ListItemText,
    ListItemIcon
} from '@material-ui/core'
import CityIcon from '@material-ui/icons/LocationCity'

import useStyles from '../styles'

export const NeighborhoodDescriptionMessage = ({ message, ...rest }) => {

    const classes = useStyles()
    const { Name='', Description='' } = message || {}

    return <ListItem className={ classes.neighborhoodMessage } alignItems="flex-start" {...rest} >
            <ListItemIcon>
                <CityIcon />
            </ListItemIcon>
            <ListItemText>
                <Typography variant='h5' align='left'>
                    { Name }
                </Typography>
                <Typography variant='body1' align='left'>
                    { Description }
                </Typography>
            </ListItemText>
        </ListItem>
}

export default NeighborhoodDescriptionMessage