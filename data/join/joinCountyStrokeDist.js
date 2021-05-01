const path = require('path')
const fs = require('fs')
const Papa = require('papaparse');

const counties = require('../counties.json');

async function parseCsv() {
    let newCounties = {}

    function handleParseCompletion(countyStrokeDistData) {
        const countyFeatures = countyStrokeDistData.reduce((acc, row) => {
            const { county_pop: countyPopulation, county_weighted_dist: weightedDistance } = row;
            const county = counties.features.find((county) => county.id === row.county_id)
    
            const newCounty = {
                ...county,
                properties: {
                    ...county.properties,
                    countyPopulation,
                    weightedDistance
                }
            }
    
            return [...acc, newCounty]
        }, []);    
        newCounties = {
            ...counties,
            features: countyFeatures
        }
    }

    const csvPath = path.resolve(__dirname, 'county_stroke_dist.csv');

    return await new Promise((resolve, reject) => {
        Papa.parse(fs.createReadStream(csvPath), {
            delimiter: ',',
            header: true,
            complete: (results) => {
                try {
                    handleParseCompletion(results.data)
                    resolve(newCounties)
                } catch (error) {
                    reject(error)
                }
            }
        });    
    })
}

function writeNewCounties(newCounties) {
    fs.writeFileSync('./test-2-counties.json', JSON.stringify(newCounties, undefined, 2))
}

async function init() {
    try {
        const newCounties = await parseCsv();
        writeNewCounties(newCounties);

    } catch(error) {
        console.log(error)
    }
}

init();