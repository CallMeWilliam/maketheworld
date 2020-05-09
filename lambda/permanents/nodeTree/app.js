// Copyright 2020 Tony Lower-Basch. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

const AWS = require('aws-sdk')

const breakOutType = (permanentId) => ([permanentId.split('#')[0], permanentId.split('#').slice(1).join('#')])

const itemReducer = (previous, {
    PermanentId: FetchedPermanentId,
    DataCategory,
    ParentId,
    Ancestry,
    Name,
    Description,
    Visibility = 'Private',
    Topology = 'Dead-End'
}) => {
    const [typeLabel, PermanentId] = breakOutType(FetchedPermanentId)
    if (DataCategory === 'Details') {
        return {
            ...previous,
            [PermanentId]: {
                ...(previous[PermanentId] || {}),
                ["__typename"]: typeLabel === 'NEIGHBORHOOD' ? 'Neighborhood' : 'Room',
                Type: typeLabel,
                PermanentId,
                ParentId,
                Ancestry,
                Name,
                Description,
                Visibility,
                Topology
            }
        }
    }
    //
    // TODO:  Handle exits and update existing map.
    //

    // const [dataTypeLabel, RoomId] = breakOutType(DataCategory)
    // if (typeLabel === 'ROOM' && dataTypeLabel === 'EXIT') {
    //     return {
    //         ...previous,
    //         [PermanentId]: {
    //             ...(previous[PermanentId] || {}),
    //             Exits: [
    //                 ???
    //             ]
    //         },
    //         [RoomId]: {
    //             ...(previous[RoomId] || {}),
    //             Entries: [
    //                 ???
    //             ]
    //         }
    //     }
    // }
    return previous
}

exports.getNodeTree = () => {

    const { TABLE_PREFIX, AWS_REGION } = process.env;
    const permanentTable = `${TABLE_PREFIX}_permanents`

    const documentClient = new AWS.DynamoDB.DocumentClient({ apiVersion: '2012-08-10', region: AWS_REGION })

    return documentClient.scan({
            TableName: permanentTable,
            IndexName: 'AncestryIndex'
        }).promise()
        .then(({ Items = [] }) => (Items.reduce(itemReducer, {})))
        .then((itemMap) => (Object.values(itemMap)))

}
