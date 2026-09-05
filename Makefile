PROJECT="neovimcraft-$(shell date +%s)"

dev:
	node src/dev.ts
.PHONY: dev

resource:
	node src/scripts/resource.ts
.PHONY: resource

resource-config:
	node src/scripts/resource.ts config
.PHONY: resource-config

download-config:
	node src/scripts/scrape-config.ts
.PHONY: download-config

download: download-config
	node src/scripts/scrape.ts
.PHONY: download

patch:
	node src/scripts/patch.ts
.PHONY: patch

process:
	node src/scripts/process.ts
.PHONY: process

missing:
	node src/scripts/process.ts missing
.PHONY: missing

html:
	node src/scripts/html.ts
.PHONY: html

scrape: download patch process html
.PHONY: scrape

clean:
	rm -rf ./public
	mkdir ./public
.PHONY: clean

build: clean
	node src/scripts/static.ts
	cp ./data/db.json ./public/db.json
	cp -r ./static/* ./public
.PHONY: build

upload:
	rsync ./public/_pgs_ignore pgs.sh:/$(PROJECT)/_pgs_ignore
	rsync -rv ./public/ pgs.sh:/$(PROJECT)
	ssh pgs.sh link neovimcraft --to $(PROJECT) --write
	ssh pgs.sh retain neovimcraft- -n 1 --write
.PHONY: upload

deploy: scrape build upload
.PHONY: deploy

fmt:
	npx biome format --write
.PHONY: format

test:
	npx biome lint
.PHONY: test

config: download-config process html
.PHONY: configs
