.PHONY: build
build:
	bundle exec middleman build

.PHONY: deploy
deploy:	build
	bundle exec middleman deploy

.PHONY: run
run:	build
	bundle exec middleman server
