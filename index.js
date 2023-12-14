const core = require('@actions/core')
const exec = require('child_process').exec
const fs = require('fs')

try {
  installSF()
} catch (error) {
  core.setFailed(error.message)
}

function installSF(){
  var tarballBase = 'https://developer.salesforce.com/media/salesforce-cli/sf/channels/stable'
  var tarballFile = 'sf-linux-x64.tar.xz'

  var tarballOverride = core.getInput('tarball-url')
  if(tarballOverride ){
    tarballBase = tarballOverride.substr(0,tarballOverride.lastIndexOf('/'))
    tarballFile = tarballOverride.substr(tarballOverride.lastIndexOf('/')+1)
  }

  var download = 'wget ' + tarballBase + '/' + tarballFile + ' -q -P /tmp'
  var createDir = 'mkdir sf'
  var unzip = 'tar xJf /tmp/' + tarballFile + ' -C sf --strip-components 1'
  var install = 'echo "`pwd`/sf/bin" >> $GITHUB_PATH'
  var version = 'sf/bin/sf --version && sf/bin/sf plugins --core'
  exec(download+' && '+createDir+' && '+unzip+' && '+install+' && '+version, function(error, stdout, stderr){
    if(error) throw(stderr)
    core.info(stdout)
    if(core.getInput('sf-auth-url')) createAuthFile()
  })
}

function createAuthFile(){
  fs.writeFileSync('/tmp/sf_auth.txt', core.getInput('sf-auth-url'))
  authSF()
}

function authSF(){
  var params = '--set-default-dev-hub --set-default --alias SF-ENV'
  exec('sf/bin/sf org login sfdx-url --sfdx-url-file /tmp/sf_auth.txt '+params, function(error, stdout, stderr){
    if(error) throw(stderr)
	core.info(stdout)
  })
}

