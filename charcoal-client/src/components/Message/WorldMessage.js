import React from 'react'

import {
    Typography,
    ListItem,
    ListItemText
} from '@material-ui/core'

const intersperseBrs = (entryList) => (
    (entryList.length > 1)
        ? <React.Fragment>
            { entryList.reduce((previous, entry, index) => ([
                ...previous,
                <React.Fragment key={index}>
                    { entry }
                    { (index < entryList.length - 1) && <br /> }
                </React.Fragment>
            ]), []) }
        </React.Fragment>
        : entryList[0]
)

export const WorldMessage = React.forwardRef(({ message, ...rest }, ref) => {
    return <ListItem ref={ref} alignItems="flex-start" {...rest} >
        <ListItemText inset>
            <Typography variant='body1' align='left'>
                { intersperseBrs((message.Message).split('\n')) }
            </Typography>
        </ListItemText>
    </ListItem>
})

export default WorldMessage