const core = require('@actions/core');
const { default: axios } = require('axios');
const https = require('https');
const parseString = require('xml2js').parseString;

function isGameVersionTarget({gameVersion}, targetGameVersion){
    return gameVersion == targetGameVersion;
}

function filterYarnData(versionsData, targetGameVersion) {
    return versionsData.filter(
        version => {
            return isGameVersionTarget(version, targetGameVersion)
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

        core.info(`minecraft_version: ${gradleConfigModel.minecraft_version}`)
        core.info(`yarn_mappings: ${gradleConfigModel.yarn_mappings}`)
        core.info(`loader_version: ${gradleConfigModel.loader_version}`)
        core.info(`fabric_version: ${gradleConfigModel.fabric_version}`)

        const propertyPath = 'gradle.properties';

        var fs = require('fs'), ini = require('ini')
        var config = ini.parse(fs.readFileSync(propertyPath, 'utf-8'))

        config.minecraft_version = gradleConfigModel.minecraft_version;
        config.yarn_mappings = gradleConfigModel.yarn_mappings;
        config.loader_version = gradleConfigModel.loader_version;
        config.fabric_version = gradleConfigModel.fabric_version;
        fs.writeFileSync('gradle.properties', ini.stringify(config))
      });



  } catch (error) {
    core.setFailed(error.message);
  }
}

// Call the main function to run the action
main();