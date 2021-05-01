const path = require('path')
const fs = require('fs')
const Papa = require('papaparse');

const tracts = require('../tracts.json');

async function parseCsv() {
    let newTracts = {}

    function handleParseCompletion(tractStrokeDistData) {
        const tractFeatures = tractStrokeDistData.reduce((acc, row) => {
            const { TotalPopulation: tractPopulation, STROKE_DIST: weightedDistance, STROKE_HOSP: closestHospital } = row;
            const tract = tracts.features.find((tract) => tract.properties.GEOID === row.GEOID)
    
            const newTract = {
                ...tract,
                properties: {
                    ...tract.properties,
                    tractPopulation,
                    weightedDistance,
                    closestHospital
                }
            }
    
            return [...acc, newTract]
        }, []);    
        newTracts = {
            ...tracts,
            features: tractFeatures
        }
    }

    const csvPath = path.resolve(__dirname, 'census_tracts_dataset.csv');

    return await new Promise((resolve, reject) => {
        Papa.parse(fs.createReadStream(csvPath), {
            delimiter: ',',
            header: true,
            complete: (results) => {
                try {
                    handleParseCompletion(results.data)
                    resolve(newTracts)
                } catch (error) {
                    reject(error)
                }
            }
        });    
    })
}

function writeNewTracts(newTracts) {
    fs.writeFileSync('./test-tracts.json', JSON.stringify(newTracts, undefined, 2))
}

async function init() {
    try {
        const newTracts = await parseCsv();
        writeNewTracts(newTracts);

    } catch(error) {
        console.log(error)
    }
}

init();