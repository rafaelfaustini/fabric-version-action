const { default: axios } = require('axios');

export class FabricService {
    public static getYarnData(){
        return axios.get("https://meta.fabricmc.net/v2/versions/yarn");
    }
    public static getLoaderData() {
        return axios.get("https://meta.fabricmc.net/v2/versions/loader");
    }
    public static async getFabricData(){
        const parseString = require('xml2js').parseString;
        const xml = (await axios.get("https://maven.fabricmc.net/net/fabricmc/fabric-api/fabric-api/maven-metadata.xml")).data;
        return new Promise((resolve, reject) => {
            parseString(xml, (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });
    }
}