import { Gradle } from "./classes/Gradle.class";
import { Loader } from "./classes/Loader.class";
import { Yarn } from "./classes/Yarn.class";
import { FabricService } from "./services/fabric.service";

const core = require('@actions/core');
const parseString = require('xml2js').parseString;

function isGameVersionTarget({gameVersion} : { gameVersion: string}, targetGameVersion: string) : boolean {
    return gameVersion == targetGameVersion;
}

function filterYarnData(versionsData: Array<Yarn>, targetGameVersion: string) : Array<Yarn> {
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

function updateGradleProperties(path: string, gradleModel : Gradle){
    var fs = require('fs'), ini = require('ini')
    var config = ini.parse(fs.readFileSync(path, 'utf-8'))

    config.minecraft_version = gradleModel.minecraft_version;
    config.yarn_mappings = gradleModel.yarn_mappings;
    config.loader_version = gradleModel.loader_version;
    config.fabric_version = gradleModel.fabric_version;
    fs.writeFileSync(path, ini.stringify(config))
}

const main = async () => {
  try {
    let yarnData : Array<Yarn> = (await FabricService.getYarnData()).data;
    const loaderData : Array<Loader> = (await FabricService.getLoaderData()).data;
    let fabricVersionData : any = await FabricService.getFabricData();

    const targetMinecraftVersion : string = core.getInput('minecraft_version', { required: true });
    const fabricVersions : Array<string> = fabricVersionData.metadata.versioning[0].versions[0].version;

    const fabricVersion : string = getFabricVersionByTarget(targetMinecraftVersion, fabricVersions)
    const targetYarn : Yarn = getLatestBuild(filterYarnData(yarnData, targetMinecraftVersion));
    const latestLoader : Loader = getLatestBuild(loaderData);
    
    let gradleConfigModel : Gradle = {
        minecraft_version: targetYarn.gameVersion,
        yarn_mappings: targetYarn.version,
        loader_version: latestLoader.version,
        fabric_version: fabricVersion
    }

    core.info(`minecraft_version: ${gradleConfigModel.minecraft_version}`)
    core.info(`yarn_mappings: ${gradleConfigModel.yarn_mappings}`)
    core.info(`loader_version: ${gradleConfigModel.loader_version}`)
    core.info(`fabric_version: ${gradleConfigModel.fabric_version}`)

    const propertyPath : string = 'gradle.properties';
    updateGradleProperties(propertyPath, gradleConfigModel);

  } catch (error) {
    if (error instanceof Error) {
        core.setFailed(error.message);
    }
  }
}

main();