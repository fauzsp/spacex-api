const axios = require("axios");
const launchesDatabase = require("./launches.schema");
const Planets = require("./planets.schema");

let latestFlightNumber = 100;

const SPACEX_API_URL = "https://api.spacexdata.com/v4/launches/query";

async function populateLaunches() {
  const response = await axios.post(SPACEX_API_URL, {
    query: {},
    options: {
      populate: [
        {
          path: "rocket",
          select: {
            name: 1,
          },
        },
        {
         path: 'payloads',
         select: {
            customers: 1
         }
      }
      ],
    },
  });
  if(response.status !== 200) {
    console.log('probelm downloading data');
    throw new Error("launch data failed")
  }
  const launchDocs = response.data.docs;
  for(const launchDoc of launchDocs) {
    const payloads = launchDoc["payloads"];
    const customers = payloads.flatMap((payload) => {
      return payload["customers"]
    })
   const launch = {
 flightNumber: launchDoc.flight_number, //flight_number
  mission: launchDoc.name, //name
  rocket: launchDoc.rocket.name, //rockect.name
  launchDate: launchDoc.date_local, //date_local
  target: "Kepler-442 b",
  customers: customers,
  upcoming: launchDoc['upcoming'],
  success: launchDocs.success, //success
   }
   console.log(`${launch.customers} == ${launch.flightNumber}`)
    saveLaunch(launch);
  }
}

async function loadLaunchesData() {
 const firstLaunch = await findLaunch({
  flightNumber: 1,
  rocket: 'Falcon 1',
  mission: 'FalconSat',
  })
  if(firstLaunch) {
    console.log('launch data already exists');
    return 
  }
  else {
    await populateLaunches();
  }
}

async function launchExists(id) {
  return await launchesDatabase.findOne({ flightNumber: id });
}
async function findLaunch(filter) {
  return await launchesDatabase.findOne(filter);
}

async function getLatestFlightNumber() {
  const latestLaunch = await launchesDatabase.findOne().sort("-flightNumber");
  if (!latestLaunch) {
    return latestFlightNumber;
  }
  return latestLaunch.flightNumber;
}
async function getAllLaunches(skip, limit) {
  return await launchesDatabase.find({}, { _id: 0, __v: 0 })
  .sort({flightNumber: 1}).skip(skip).limit(limit);
}

async function addNewLaunch(launch) {
  const planet = await Planets.findOne({
    keplerName: launch.target,
  });
  if (!planet) {
    throw new Error("No matching planets");
  }
  const latestFlightNumber = (await getLatestFlightNumber()) + 1;

  const newLaunch = Object.assign(launch, {
    success: true,
    upcoming: true,
    customer: ["NASA", "Spacee"],
    flightNumber: latestFlightNumber,
  });
  await saveLaunch(newLaunch);
}

async function saveLaunch(launch) {
  await launchesDatabase.findOneAndUpdate(
    { flightNumber: launch.flightNumber },
    launch,
    { upsert: true }
  );
}

async function abortLaunchById(id) {
  const aborted = await launchesDatabase.updateOne(
    {
      flightNumber: id,
    },
    {
      upcoming: false,
      success: false,
    }
  );
  return aborted.acknowledged === true && aborted.modifiedCount === 1;
}

module.exports = {
  loadLaunchesData,
  addNewLaunch,
  abortLaunchById,
  launchExists,
  getAllLaunches,
};
