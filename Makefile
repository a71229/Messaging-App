install:
	npm install -g npm@latest &&\
	cd Project/server/ &&\
	npm install &&\
	cd ../client/ &&\
	npm install &&\
	npm install react-bootstrap bootstrap
build: 
	cd Project/client/ &&\
	npm run dev
run:
	cd Project/server/ &&\
	npm run dev
	
