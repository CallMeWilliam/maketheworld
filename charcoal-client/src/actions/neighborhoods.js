import { HTTPS_ADDRESS } from '../config'

export const NEIGHBORHOOD_UPDATE = 'NEIGHBORHOOD_UPDATE'

export const neighborhoodUpdate = (neighborhoods) => ({
    type: NEIGHBORHOOD_UPDATE,
    data: neighborhoods
})

export const fetchAllNeighborhoods = () => (dispatch) => {
    return fetch(`${HTTPS_ADDRESS}/neighborhood`,{
        method: 'GET',
        headers: {
            'accept': 'application/json'
        }
    })
    .then(response => {
        if (!response.ok) {
            throw response.error
        }
        return response
    })
    .then(response => response.json())
    .then(response => dispatch(neighborhoodUpdate(response)))
    .catch((err) => { console.log(err)})
}
