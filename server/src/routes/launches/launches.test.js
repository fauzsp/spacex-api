const request = require('supertest');
const app = require('../../app');
const {mongoConnect, mongoDisconnect} = require('../../services/mongo');

describe('Lanchess API', () => {
    beforeAll(async () => {
        await mongoConnect();
    })
    afterAll(async () => {
        await mongoDisconnect();
    })
    describe("Test GET /launches", () => {
    test("It should respond with 200 success", async () => {
        const response = await request(app).get('/v1/launches')
        expect(response.statusCode).toBe(200);
    });
});

describe("Test POST /launch", () => {
    const responseModel = {
        mission: "Kepler Exploration X",
        rocket: "Explorer IS1",
        target: "Kepler-62 f",
        launchDate: 'January 6, 2015',
    }
    const responseCopiedModel = {
        mission: "Kepler Exploration X",
        rocket: "Explorer IS1",
        target: "Kepler-62 f",
    }

    const responseDataWithInvalidDate = {
        mission: "Kepler Exploration X",
        rocket: "Explorer IS1",
        target: "Kepler-62 f",
        launchDate: 'tolerance',
    }

    test("It should respond with 201 created", async () => {
        const response = await request(app).post('/v1/launches').send(responseModel).expect('Content-Type', /json/).expect(201)
         const requestDate = new Date(responseModel.launchDate).valueOf();
         const responseDate = new Date(response.body.launchDate).valueOf();
        expect(responseDate).toBe(requestDate);
        expect(response.body).toMatchObject(responseCopiedModel);
    });
    test("It should catch missing required properties", async () => {
        const response = await request(app).post('/v1/launches').send(responseCopiedModel).expect('Content-Type', /json/).expect(400)
        expect(response.body).toStrictEqual({
            error: "Missing required launch property",
        })
    })
    test("It should catch invalid dates", async () => {
        const response = await request(app).post('/v1/launches').send(responseDataWithInvalidDate).expect('Content-Type', /json/).expect(400)
        expect(response.body).toStrictEqual({
            error: "Missing required launch date"
        })
    })
});
})

