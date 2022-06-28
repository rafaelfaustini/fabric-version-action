const core = require('@actions/core');
const { default: axios } = require('axios');
const https = require('https');
const parseString = require('xml2js').parseString;

function isVersionStable({stable}){
    return stable
}

function isGameVersionTarget({gameVersion}, targetGameVersion){
    return gameVersion == targetGameVersion;
}

function filterYarnData(versionsData, targetGameVersion) {
    core.info(version.data)
    core.info(targetGameVersion)
    return versionsData.filter(
        version => {
            return isVersionStable(version) && isGameVersionTarget(version, targetGameVersion)
        }
    )
}

function getFabricVersionByTarget(targetVersion, fabricVersionData){
    let targetFabricBuilds = fabricVersionData.filter(build => build.includes(targetVersion));
    return targetFabricBuilds[targetFabricBuilds.length - 1];
}

function getLatestBuild(data){
    return data.reduce((prev, current) => (+prev.build > +current.build) ? prev : current)
}

const main = async () => {
  try {
    let yarnData = (await axios.get("https://meta.fabricmc.net/v2/versions/yarn")).data;
    const loaderData = (await axios.get("https://meta.fabricmc.net/v2/versions/loader")).data;
    let fabricVersionData = await axios.get("https://maven.fabricmc.net/net/fabricmc/fabric-api/fabric-api/maven-metadata.xml");
    parseString(fabricVersionData.data , async function (err, fabricVersionsData) {
        const fabricVersions = fabricVersionsData.metadata.versioning[0].versions[0].version;
        const targetMinecraftVersion = core.getInput('minecraft_version', { required: true });
        const fabricVersion = getFabricVersionByTarget(targetMinecraftVersion, fabricVersions)
        yarnData = getLatestBuild(filterYarnData(yarnData, targetMinecraftVersion));
        const latestLoader = getLatestBuild(loaderData);
    
        gradleConfigModel = {
            minecraft_version: yarnData.gameVersion,
            yarn_mappings: yarnData.version,
            loader_version: latestLoader.version,
            fabric_version: fabricVersion
        }
    
        const propertyPath = 'gradle.properties';
    
        let properties = propertiesReader(propertyPath);
        
        
        for (var [key, value] of Object.entries(properties)) {
            properties.set(key, value);
        }
    
        const props = propertiesReader(propertyPath, {writer: { saveSections: true }});
        await props.save(filePath);
      });



  } catch (error) {
    core.setFailed(error.message);
  }
}

// Call the main function to run the action
main();