import { Gradle } from "./classes/Gradle.class";
import { Yarn } from "./classes/Yarn.class";

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
export {    
    isGameVersionTarget,
    filterYarnData,
    getFabricVersionByTarget,
    getLatestBuild,
    updateGradleProperties
}