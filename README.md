# fabric-version-action
Not official action that changes the fabric version in gradle property for the desired minecraft version.

![image](https://user-images.githubusercontent.com/26970976/176773830-d97aa45b-2791-4ee2-a439-eecb37437adc.png)
By wanting to creating multi versions build pipeline for fabric mods I had a problem, the gradle property was manually added with data from the website. Therefore I created this action that gets these versions directly from fabric website and changes this config for you.

## Example
```yml 
jobs:
  build:
    strategy:
      matrix:
        # Use these Java versions
        java: [
          17,    # Current Java LTS & minimum supported by Minecraft
        ]
        minecraft_version: [
          1.19,
          1.18.2
        ]
        
        os: [ubuntu-20.04]
    runs-on: ${{ matrix.os }}
    steps:
      - name: checkout repository
        uses: actions/checkout@v2
      - name: validate gradle wrapper
        uses: gradle/wrapper-validation-action@v1
      - name: setup jdk ${{ matrix.java }}
        uses: actions/setup-java@v1
        with:
          java-version: ${{ matrix.java }}
      - name: change build version for minecraft version
        uses: rafaelfaustini/fabric-version-action@main
        with:
          minecraft_version: ${{ matrix.minecraft_version }}
      - name: make gradle wrapper executable
        if: ${{ runner.os != 'Windows' }}
        run: chmod +x ./gradlew
      - name: build
        run: ./gradlew build
      - name: capture build artifacts
        if: ${{ runner.os == 'Linux' && matrix.java == '17' }} # Only upload artifacts built from latest java on one OS
        uses: actions/upload-artifact@v2
        with:
          name: ${{ matrix.minecraft_version }}-build
          path: build/libs/
```
This example job will:
- Execute 2 times, one to build for minecraft 1.19 and the other for 1.18.2
- Validate gradle
- setup jdk for build
- Change the build version of the gradle.properties using our action
- Build the mod
- Upload the mod artifacts in build

## Usage
```yml
      - name: Change build version for minecraft version
        uses: rafaelfaustini/fabric-version-action@main
        with:
          minecraft_version: 1.18.2
```
This step will automatically change your gradle.property file with the info from Fabric development website, in this case it will update the minecraft_version, yarn_mappings, loader_version and fabric_version to one that fits for the desired version 1.18.2
