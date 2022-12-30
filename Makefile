.PHONY: help

EXECUTABLES = node npm
K := $(foreach exec,$(EXECUTABLES), $(if $(shell which $(exec)),some string,$(error "No $(exec) in PATH. Please install.")))

.clean:
	rm -rf lib;\
	mkdir lib

help:
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

setup: ## Set up the environment
	npm ci;

build: ## Build the application as a binary
	npm run build

install: ## Install the systemd daemon
	mkdir -p ~/.config/systemd/user
	ln -sf $(shell pwd)/spotifyd-mqtt.service ~/.config/systemd/user/
	systemctl edit --user spotifyd-mqtt.service

start: ## Start the service for the first time
	systemctl --user enable spotifyd-mqtt.service

restart: ## Restart the service
	systemctl --user restart spotifyd-mqtt.service

dev: ## Run the service locally using a dotenv file
	npm run dev
