#!/bin/bash

# Load environment variables from .env.example
if [ -f .env.local ]; then
  export $(cat .env.local | grep -v '^#' | xargs)
fi

# Start the development server
bun run dev
