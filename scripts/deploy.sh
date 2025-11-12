#!/bin/bash

# Survey Frontend Deployment Helper Script
# This script helps with common deployment tasks

set -e

echo "🚀 Survey Frontend Deployment Helper"
echo "===================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

show_menu() {
    echo "Select deployment target:"
    echo "1) Build for production"
    echo "2) Run locally with Docker"
    echo "3) Deploy to Vercel"
    echo "4) Deploy to Netlify"
    echo "5) Deploy to Heroku"
    echo "6) Build Docker image"
    echo "7) Setup environment"
    echo "0) Exit"
    echo ""
    read -p "Enter choice [0-7]: " choice
}

build_production() {
    echo -e "${YELLOW}Building for production...${NC}"
    npm run build
    echo -e "${GREEN}✓ Build complete! Output in ./dist${NC}"
    echo "You can now deploy the ./dist folder to any static hosting"
}

run_docker_locally() {
    echo -e "${YELLOW}Starting Docker container...${NC}"
    docker-compose up
}

deploy_vercel() {
    if ! command -v vercel &> /dev/null; then
        echo -e "${YELLOW}Installing Vercel CLI...${NC}"
        npm install -g vercel
    fi
    echo -e "${YELLOW}Deploying to Vercel...${NC}"
    vercel
}

deploy_netlify() {
    if ! command -v netlify &> /dev/null; then
        echo -e "${YELLOW}Installing Netlify CLI...${NC}"
        npm install -g netlify-cli
    fi
    echo -e "${YELLOW}Building and deploying to Netlify...${NC}"
    npm run build
    netlify deploy --prod --dir=dist
}

deploy_heroku() {
    if ! command -v heroku &> /dev/null; then
        echo -e "${RED}Heroku CLI not found. Install from: https://devcenter.heroku.com/articles/heroku-cli${NC}"
        return 1
    fi
    echo -e "${YELLOW}Deploying to Heroku...${NC}"
    git push heroku main
}

build_docker_image() {
    read -p "Enter Docker image name [survey-frontend]: " image_name
    image_name=${image_name:-survey-frontend}
    read -p "Enter tag [latest]: " tag
    tag=${tag:-latest}
    
    echo -e "${YELLOW}Building Docker image: $image_name:$tag${NC}"
    docker build -t "$image_name:$tag" .
    echo -e "${GREEN}✓ Docker image built successfully!${NC}"
    echo "Run: docker run -p 3000:3000 $image_name:$tag"
}

setup_environment() {
    echo -e "${YELLOW}Setting up environment...${NC}"
    
    if [ ! -f .env.production ]; then
        echo -e "${RED}.env.production not found${NC}"
        echo "Please create .env.production based on .env.example"
        echo "Example: cp .env.example .env.production"
        return 1
    fi
    
    echo -e "${YELLOW}Enter production API URL:${NC}"
    read -p "API URL [https://api.example.com]: " api_url
    api_url=${api_url:-https://api.example.com}
    
    # Update .env.production
    sed -i '' "s|VITE_API_URL=.*|VITE_API_URL=$api_url|" .env.production
    
    echo -e "${YELLOW}Enter log level [warn]:${NC}"
    read -p "Log level (debug/info/warn/error): " log_level
    log_level=${log_level:-warn}
    
    sed -i '' "s|VITE_LOG_LEVEL=.*|VITE_LOG_LEVEL=$log_level|" .env.production
    
    echo -e "${GREEN}✓ Environment configured!${NC}"
    echo "Updated .env.production:"
    cat .env.production | grep VITE_
}

verify_dependencies() {
    echo -e "${YELLOW}Checking dependencies...${NC}"
    
    local missing=0
    
    if ! command -v node &> /dev/null; then
        echo -e "${RED}✗ Node.js not found${NC}"
        missing=1
    else
        echo -e "${GREEN}✓ Node.js $(node --version)${NC}"
    fi
    
    if ! command -v npm &> /dev/null; then
        echo -e "${RED}✗ npm not found${NC}"
        missing=1
    else
        echo -e "${GREEN}✓ npm $(npm --version)${NC}"
    fi
    
    if ! command -v docker &> /dev/null; then
        echo -e "${YELLOW}⚠ Docker not found (optional for local deployment)${NC}"
    else
        echo -e "${GREEN}✓ Docker $(docker --version | awk '{print $3}')${NC}"
    fi
    
    if [ $missing -eq 1 ]; then
        echo -e "${RED}Please install missing dependencies${NC}"
        return 1
    fi
    
    return 0
}

# Main loop
while true; do
    show_menu
    
    case $choice in
        1)
            build_production
            ;;
        2)
            run_docker_locally
            ;;
        3)
            deploy_vercel
            ;;
        4)
            deploy_netlify
            ;;
        5)
            deploy_heroku
            ;;
        6)
            build_docker_image
            ;;
        7)
            setup_environment
            ;;
        0)
            echo -e "${GREEN}Goodbye!${NC}"
            exit 0
            ;;
        *)
            echo -e "${RED}Invalid option${NC}"
            ;;
    esac
    
    echo ""
    read -p "Press Enter to continue..."
    clear
done
