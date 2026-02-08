# How to View the Blog Locally

## The Problem
Browsers block loading `.md` files when opening HTML files directly (`file://` protocol) due to CORS security restrictions.

## Solution: Run a Local Server

### Option 1: Python (Easiest)
```bash
# Navigate to your project directory
cd "/Users/jamieseoh/Desktop/04. IRHS/dwseoh.com/main"

# Run Python server
python3 -m http.server 8000
```

Then open: `http://localhost:8000/blog/sustainable-momentum.html`

### Option 2: Node.js (if you have it)
```bash
# Install http-server globally (one time)
npm install -g http-server

# Navigate to project directory
cd "/Users/jamieseoh/Desktop/04. IRHS/dwseoh.com/main"

# Run server
http-server -p 8000
```

Then open: `http://localhost:8000/blog/sustainable-momentum.html`

### Option 3: VS Code Live Server
1. Install "Live Server" extension in VS Code
2. Right-click `index.html`
3. Select "Open with Live Server"

## Quick Test
After starting the server, navigate to:
- Home: `http://localhost:8000/index.html`
- Blog: `http://localhost:8000/blog.html`
- Post: `http://localhost:8000/blog/sustainable-momentum.html`

The markdown content should now load properly!
