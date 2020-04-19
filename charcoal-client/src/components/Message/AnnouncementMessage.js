import React from 'react'

import {
    Typography,
    Card,
    CardHeader,
    CardContent,
    ListItem,
    ListItemText
} from '@material-ui/core'
import NewReleasesIcon from '@material-ui/icons/NewReleases'

import useStyles from '../styles'

export const AnnouncementMessage = ({ Message, Title, Recap, ...rest }) => {
    const classes = useStyles()
    return <ListItem alignItems="flex-start" {...rest} className={Recap ? classes.lightgrey : null}>
        <ListItemText inset>
            <Card>
                <CardHeader className={Recap ? classes.darkgrey : classes.lightgrey} avatar={<NewReleasesIcon />} title={Title} />
                <CardContent className={Recap ? classes.lightgrey : null }>
                    <Typography variant='body1' align='left'>
                        { Message }
                    </Typography>
                </CardContent>
            </Card>
        </ListItemText>
    </ListItem>
}

export default AnnouncementMessage