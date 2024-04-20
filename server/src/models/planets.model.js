const fs = require("fs");
const path = require("path");
const { parse } = require("csv-parse");
const planets = require("./planets.schema");
const { getAllPlanets } = require("../routes/planets/planets.controller");
// const isHabitalPlanetArray = [];

function isHabitalPlanet(planet) {
  return (
    planet["koi_disposition"] === "CONFIRMED" &&
    planet["koi_insol"] > 0.36 &&
    planet["koi_insol"] < 1.11 &&
    planet["koi_prad"] < 1.6
  );
}

function loadPlanetsData() {
  return new Promise((resolve, reject) => {
    fs.createReadStream(
      path.join(__dirname, "..", "..", "data", "kepler_data.csv")
    )
      .pipe(
        parse({
          comment: "#",
          columns: true,
        })
      )
      .on("data", async (data) => {
        if (isHabitalPlanet(data)) {
          // isHabitalPlanetArray.push(data)
          savePlanets(data);
        }
      })
      .on("error", (error) => {
        console.log(error, "catch error");
        reject(error);
      })
      .on("end", async () => {
        // console.log(isHabitalPlanetArray)
        const planetsLength = (await getTotalPlanets());
        // console.log(planetsLength, planetsLength.length, "planets");
        // const planetName = getTotalPlanets.map((planet) => {
        //   return planet.kepler_name;
        // });
        resolve();
      });
  });
}

async function getTotalPlanets() {
  return await planets.find({}, "keplerName").exec();
  // remove duplicate values
  // const updatePlanets = await planets.aggregate([
  //   // Group documents by the field with potential duplicates
  //   { $group: { _id: "$keplerName", count: { $sum: 1 }, ids: { $push: "$_id" } } },
  //   // Filter groups with count greater than 1 (indicating duplicates)
  //   { $match: { count: { $gt: 1 } } }
  // ])
  //  updatePlanets.forEach(doc => {
  //   // Step 2: Remove Duplicate Values
  //   const duplicateIds = doc.ids.slice(1); // Keep one and remove others
  //   console.log(duplicateIds, 'check duplicate name')
  //     planets.deleteMany({ _id: { $in: duplicateIds } });
  //    console.log(newDocuments, 'check updated value')
  // });
  // return await planets.find({}, "keplerName").exec();
}

async function savePlanets(planet) {
try {
    await planets.updateOne(
        {
          keplerName: planet.kepler_name,
        },
        {
          keplerName: planet.kepler_name,
        },
        { upsert: true }
      );
}
catch(err) {
    console.error('error in saving planets data', err); 
}
}

module.exports = {
  loadPlanetsData,
  planets: getTotalPlanets,
};
