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



