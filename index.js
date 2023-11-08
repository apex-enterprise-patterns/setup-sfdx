const core = require('@actions/core')
const exec = require('child_process').exec
const fs = require('fs')

try {
  installSF()
} catch (error) {
  core.setFailed(error.message)
}

function installSF(){
  var download = 'wget https://developer.salesforce.com/media/salesforce-cli/sf/channels/stable/sf-linux-x64.tar.xz -q -P /tmp'
  var createDir = 'mkdir -p ~/cli/sf'
  var unzip = 'tar xJf /tmp/sf-linux-x64.tar.xz -C ~/cli/sf --strip-components 1'
  var install = 'echo "`pwd`~/cli/sf/bin" >> $GITHUB_PATH'
  var version = '~/cli/sf/bin/sf --version && ~/cli/sf/bin/sf plugins --core'
  exec(download+' && '+createDir+' && '+unzip+' && '+install+' && '+version, function(error, stdout, stderr){
    if(error) throw(stderr)
    core.info(stdout)
    if(core.getInput('sfdx-auth-url')) createAuthFile()
  })
}

function createAuthFile(){
  fs.writeFileSync('/tmp/sf_auth.txt', core.getInput('sf-auth-url'))
  authSFDX()
}

function authSFDX(){
  var params = '--set-default-dev-hub --set-default --alias SFDX-ENV'
  exec('~/cli/sf/bin/sf org login sfdx-url --s /tmp/sf_auth.txt '+params, function(error, stdout, stderr){
    if(error) throw(stderr)
	core.info(stdout)
  })
}

