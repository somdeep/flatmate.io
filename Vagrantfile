# -*- mode: ruby -*-
# vi: set ft=ruby :

# Vagrantfile API/syntax version. Don't touch unless you know what you're doing!
VAGRANTFILE_API_VERSION = "2"

#installs docker cf and cf container plugin
$bootstrap = <<SCRIPT
apt-get update

apt-get install -y git vim curl wget

curl -sL https://deb.nodesource.com/setup | sudo bash -
apt-get install -y nodejs build-essential

npm install -g nodemon

SCRIPT
Vagrant.configure(VAGRANTFILE_API_VERSION) do |config|

  config.vm.hostname = 'dionysus'
  config.vm.box='ubuntu/trusty64'
  # config.vm.box='hashicorp/precise64'
  config.vm.network :private_network, ip: '192.168.50.10'
  config.vm.network 'forwarded_port', guest: 9000, host: 9000
  config.vm.provision 'shell', inline: $bootstrap

end
