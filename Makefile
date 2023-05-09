install:
	npm install -g npm@latest &&\
	cd Project/server/ &&\
	npm install &&\
	cd ../client/ &&\
	npm install &&\
	npm install react-bootstrap bootstrap
	
run:
	cd Project/server/ &&\
	npm run dev
	