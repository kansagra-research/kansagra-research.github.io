const path = require('path')
const fs = require('fs')
const Papa = require('papaparse');

const states = require('../states.json');

async function parseCsv() {
    let newStates = {}

    function handleParseCompletion(stateStrokeDistData) {
        const stateFeatures = stateStrokeDistData.reduce((acc, row) => {
            const { state_pop: statePopulation, state_weighted_dist: weightedDistance } = row;
            const state = states.features.find((state) => state.id === row.state_id)
    
            const newState = {
                ...state,
                properties: {
                    ...state.properties,
                    statePopulation,
                    weightedDistance
                }
            }
    
            return [...acc, newState]
        }, []);    
        newStates = {
            ...states,
            features: stateFeatures
        }
    }

    const csvPath = path.resolve(__dirname, 'state_stroke_dist.csv');

    return await new Promise((resolve, reject) => {
        Papa.parse(fs.createReadStream(csvPath), {
            delimiter: ',',
            header: true,
            complete: (results) => {
                try {
                    handleParseCompletion(results.data)
                    resolve(newStates)
                } catch (error) {
                    reject(error)
                }
            }
        });    
    })
}

function writeNewStates(newStates) {
    fs.writeFileSync('./test.json', JSON.stringify(newStates, undefined, 2))
}

async function init() {
    try {
        const newStates = await parseCsv();
        writeNewStates(newStates);

    } catch(error) {
        console.log(error)
    }
}

init();