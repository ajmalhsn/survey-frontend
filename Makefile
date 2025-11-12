.PHONY: help install dev build preview lint clean docker-build docker-run docker-compose deploy

help:
	@echo "Survey Frontend - Deployment Makefile"
	@echo "===================================="
	@echo ""
	@echo "Development Commands:"
	@echo "  make dev              - Start development server"
	@echo "  make install          - Install dependencies"
	@echo "  make lint             - Run ESLint"
	@echo "  make clean            - Clean build artifacts"
	@echo ""
	@echo "Build Commands:"
	@echo "  make build            - Build for production"
	@echo "  make preview          - Preview production build locally"
	@echo ""
	@echo "Docker Commands:"
	@echo "  make docker-build     - Build Docker image"
	@echo "  make docker-run       - Run Docker container"
	@echo "  make docker-compose   - Run with docker-compose"
	@echo ""
	@echo "Deployment Commands:"
	@echo "  make deploy           - Interactive deployment menu"
	@echo "  make vercel           - Deploy to Vercel"
	@echo "  make netlify          - Deploy to Netlify"
	@echo "  make heroku           - Deploy to Heroku"
	@echo ""

install:
	npm ci

dev:
	npm run dev

build:
	npm run build

preview: build
	npm run preview

lint:
	npm run lint

clean:
	rm -rf dist node_modules package-lock.json

docker-build:
	docker build -t survey-frontend:latest .

docker-run: docker-build
	docker run -p 3000:3000 survey-frontend:latest

docker-compose:
	docker-compose up

deploy:
	npm run deploy

vercel: build
	@command -v vercel >/dev/null 2>&1 || npm install -g vercel
	vercel --prod

netlify: build
	@command -v netlify >/dev/null 2>&1 || npm install -g netlify-cli
	netlify deploy --prod --dir=dist

heroku: build
	@command -v heroku >/dev/null 2>&1 || (echo "Heroku CLI not found. Install from https://devcenter.heroku.com/articles/heroku-cli" && exit 1)
	git push heroku main

.DEFAULT_GOAL := help
