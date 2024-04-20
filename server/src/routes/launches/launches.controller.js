const {getAllLaunches, addNewLaunch, launchExists, abortLaunchById} = require("../../models/launches.models");
const { getPagination } = require("../../services/query");


async function httpGetAllLaunches(req, res) {
    const {skip, limit} = getPagination(req.query);
    const launches = await getAllLaunches(skip, limit)
    return res.status(200).json(launches);
 }

async function httpAddNewLaunch(req, res) {
    const launch = req.body;
    if(!launch.mission || !launch.rocket || !launch.launchDate || !launch.target) {
        return res.status(400).json({
            error: "Missing required launch property",
        })
    }
    launch.launchDate = new Date(launch.launchDate);
    if(isNaN(launch.launchDate)) {
        return res.status(400).json({
            error: "Missing required launch date"
        })
    }
   await addNewLaunch(launch);
    res.status(201).json(launch);
}

async function httpAbortLaunch(req, res) {
    const id = Number(req.params.id);
    const checkLaunchExists = await launchExists(id);
    if(!checkLaunchExists) {
        return res.status(404).json({ error: "Launch not found"})
    }
    const aborted = await abortLaunchById(id);
    if(!aborted) {
        return res.status(404).json({ error: "Launch not aborted"});
    }
    console.log(aborted, 'checkLaunch')
    return res.status(200).json({ok: true});
}
 module.exports = {
    httpAddNewLaunch,
    httpAbortLaunch,
    httpGetAllLaunches
};