install:
	npm install -g npm@latest
	cd Project/server/ 
	npm install 
	cd ../client/ 
	npm install 
	npm install react-bootstrap bootstrap
azure1:
	curl https://raw.githubusercontent.com/creationix/nvm/master/install.sh | bash
azure2:
	export NVM_DIR="$HOME/.nvm"
	[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
	[ -s "$NVM_DIR/bash_completion" ] && . "$NVM_DIR/bash_completion"
	nvm install node
build: 
	cd Project/client/
	npm run dev
run:
	cd Project/server/ 
	npm run dev
	
