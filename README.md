Gazzetta
======================

Installation(exp. Amazon Linux AMI 2014.03.2 (HVM) - ami-29dc9228)
------
### nodejs install
```
$ sudo yum -y install git openssl-devel gcc-c++ make
$ git clone git://github.com/creationix/nvm.git ~/.nvm
$ source ~/.nvm/nvm.sh
$ nvm install v0.11.11
$ echo "source ~/.nvm/nvm.sh" >> ~/.bash_profile
$ echo "nvm use v0.11.11" >> ~/.bash_profile
```
### storage install
```
# redis
$ sudo yum --enablerepo=epel -y install redis
$ sudo chkconfig redis on
$ sudo service redis start

# mongodb
$ sudo vim /etc/yum.repos.d/MongoDB.repo
[10gen]
name=10gen Repository
baseurl=http://downloads-distro.mongodb.org/repo/redhat/os/x86_64
gpgcheck=0
enabled=1
$ sudo yum -y install mongo-10gen mongo-10gen-server
$ sudo chkconfig mongod on
$ sudo service mongod start
```
### gazzetta install
```
$ export NODE_ENV=production
$ echo "export NODE_ENV=production" >> ~/.bash_profile
$ git clone https://github.com/mu-hirotaka/gazzetta.git
$ cd gazzetta
$ npm install
```

### pm2 install
```
$ npm install pm2@latest -g
$ pm2 start bin/www
```

### nginx(reverse proxy) install
```
# 80番ポートあいてなければあける
$ sudo rpm -ivh http://nginx.org/packages/centos/6/noarch/RPMS/nginx-release-centos-6-0.el6.ngx.noarch.rpm
$ sudo yum -y install nginx
$ sudo chkconfig nginx on
$ sudo service nginx start

$ sudo vim /etc/nginx/conf.d/gazzetta.conf
upstream gazzetta {
    server localhost:3000;
}

server {
    listen 80 default;
    server_name xxx.xxx.xxx; # TODO: 書き換える

    root /home/ec2-user/gazzetta/public;
    access_log /var/log/nginx/gazzetta_access.log;
    error_log /var/log/nginx/gazzetta_error.log;

    location / {
        try_files $uri @app;
    }

    location /socket.io/ {
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_pass http://localhost:3000;
    }

    location @app {
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header Host $http_host;
        proxy_pass http://gazzetta;
    }
}

$ sudo service nginx restart
# http://xxx.xxx.xxx/ で接続確認
```

