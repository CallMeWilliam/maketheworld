import maps from './maps.js'

describe('Maps reducer', () => {
    it('should return the test map by default', () => {
        expect(maps()).toEqual({
            Test: {
                Rooms: {
                    VORTEX: {
                        PermanentId: "VORTEX",
                        X: 100,
                        Y: 100
                    },
                    "be39870d-f011-48b4-a890-f178a3797d16": {
                        PermanentId: "be39870d-f011-48b4-a890-f178a3797d16",
                        X: 200,
                        Y: 100
                    },
                    "6ff26c6e-d67d-49dd-9110-f76e77336453": {
                        PermanentId: "6ff26c6e-d67d-49dd-9110-f76e77336453",
                        X: 200,
                        Y: 200
                    }
                }
            }
        })
    })

})