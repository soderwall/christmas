#!/bin/bash

# Start Secret Santa web server
# This script starts a local web server to avoid CORS issues

PORT=8081
DIR="/Users/psodervall/private/christmas"

echo "🎅 Starting Secret Santa web server..."
echo "Directory: $DIR"
echo "Port: $PORT"

# Kill any existing servers on this port
lsof -ti:$PORT | xargs kill -9 2>/dev/null || true

# Start server in background
cd "$DIR"
python3 -m http.server $PORT &
SERVER_PID=$!

echo "✅ Server started with PID: $SERVER_PID"
echo "🌐 Opening: http://localhost:$PORT/lookup.html"

# Open in browser
sleep 1
open "http://localhost:$PORT/lookup.html"

echo ""
echo "📋 Instructions:"
echo "  • Use the web browser that just opened"
echo "  • Enter any name (e.g., Philip, Ida, Sofie)"
echo "  • Press Ctrl+C to stop the server when done"

# Keep script running until user stops it
trap "echo '🛑 Stopping server...'; kill $SERVER_PID 2>/dev/null; exit 0" INT
echo "⏳ Server running... Press Ctrl+C to stop"
wait $SERVER_PID