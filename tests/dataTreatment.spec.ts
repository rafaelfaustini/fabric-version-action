import { Yarn } from '../src/classes/Yarn.class';
import {isGameVersionTarget, filterYarnData} from '../src/dataTreatment'

var chance = require('chance').Chance();

describe('isGameVersionTarget', () => {
    it('should gameVersion be target', async () => {
        let version = chance.word();
        let gameVersionModel = {
            gameVersion: version
        };
        let result = isGameVersionTarget(gameVersionModel, version);
        expect(result).toBe(true)
    });
    it('should gameVersion not be target', async () => {
        let mockedVersions = chance.unique(chance.string, 2);
        let version = mockedVersions[0];
        let gameVersionModel = {
            gameVersion: mockedVersions[1]
        };
        let result = isGameVersionTarget(gameVersionModel, version);
        expect(result).toBe(false)
    });
});

describe('filterYarnData', () => {
    it('should yarn configs have the same version as target version', async () => {
        let yarns : Array<Yarn> = [
            {
                gameVersion: 'v1',
                separator: 'sep1',
                build: 4,
                maven: 'maven1',
                version: 'version3',
                stable: false
            },
            {
                gameVersion: 'v5',
                separator: 'sep2',
                build: 1,
                maven: 'maven2',
                version: 'version7',
                stable: false
            },
            {
                gameVersion: 'v1',
                separator: 'sep3',
                build: 2,
                maven: 'maven3',
                version: 'version9',
                stable: false
            },
            {
                gameVersion: 'v7',
                separator: 'sep4',
                build: 9,
                maven: 'maven5',
                version: 'version4',
                stable: false
            },
            {
                gameVersion: 'v8',
                separator: 'sep5',
                build: 4,
                maven: 'maven7',
                version: 'version2',
                stable: false
            },
            {
                gameVersion: 'v1',
                separator: 'sep1',
                build: 7,
                maven: 'maven0',
                version: 'version',
                stable: false
            },
        ]
        let filteredYarns = filterYarnData(yarns, 'v1');
        expect(filteredYarns).toEqual(
            expect.not.arrayContaining([
              expect.objectContaining({maven: "maven7"}),
              expect.objectContaining({maven: "maven5"}),
              expect.objectContaining({maven: "maven2"})

        ]));
    });
    it('should return empty if yarn configs doesnt have the target version', async () => {
        let yarns : Array<Yarn> = [
            {
                gameVersion: 'v8',
                separator: 'a',
                build: 4,
                maven: 'maven1',
                version: 'version3',
                stable: false
            },
            {
                gameVersion: 'v5',
                separator: chance.word(),
                build: chance.integer(),
                maven: chance.word(),
                version: chance.word(),
                stable: chance.bool()
            },
            {
                gameVersion: 'v9',
                separator: 'sep4',
                build: 9,
                maven: 'maven5',
                version: 'version4',
                stable: false
            },
            {
                gameVersion: 'v8',
                separator: 'sep5',
                build: 4,
                maven: 'maven7',
                version: 'version2',
                stable: false
            },
            {
                gameVersion: 'v1',
                separator: 'sep1',
                build: 7,
                maven: 'maven0',
                version: 'version',
                stable: false
            },
        ]
        let filteredYarns = filterYarnData(yarns, 'v10');
        expect(filteredYarns).toEqual([]);
    });
    it('should return identical array if all versions are target', async () => {
        let yarns : Array<Yarn> = [
            {
                gameVersion: 'v5',
                separator: chance.word(),
                build: chance.integer(),
                maven: chance.word(),
                version: chance.word(),
                stable: chance.bool()
            },
            {
                gameVersion: 'v5',
                separator: chance.word(),
                build: chance.integer(),
                maven: chance.word(),
                version: chance.word(),
                stable: chance.bool()
            },
            {
                gameVersion: 'v5',
                separator: chance.word(),
                build: chance.integer(),
                maven: chance.word(),
                version: chance.word(),
                stable: chance.bool()
            },
        ]
        let filteredYarns = filterYarnData(yarns, 'v5');
        expect(filteredYarns).toMatchObject(yarns);;
    });
})