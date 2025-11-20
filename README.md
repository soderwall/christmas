# 🎅 Secret Santa Web Application 🎄

A dynamic Secret Santa application for two families with automatic year handling and secure, private lookup functionality. **Note: The web interface is in Swedish.**

## ✨ Features

- **🗓️ Automatic year handling** - System automatically detects current year
- **🏠 Two-family support** - Handles Magnusson Family & Söderwall Family  
- **💰 Different budgets** - 600 SEK (Magnusson) / 700 SEK (Söderwall)
- **🔒 Secure lookup** - Private lookup process, no snooping possible
- **📱 Mobile-responsive** - Works perfectly on all devices
- **🛠️ Bash scripts** - Automated drawing with one command

## 🚀 Quick Start

### For Participants
1. **Start the web server:**
   ```bash
   ./start-server.sh
   ```

2. **Look up your assignment:**
   - Enter your name on the webpage that opens
   - See who you should give a gift to
   - Get budget information automatically

### For Administrators (Philip)
1. **Update participant lists:**
   ```bash
   # Edit participant files as needed
   nano participants/magnusson_participants.txt
   nano participants/soderwall_participants.txt
   ```

2. **Generate new draw:**
   ```bash
   ./generate-draw.sh
   ```

3. **Notify the family** that the draw is ready!

## 📁 Project Structure

```
/
├── 📄 index.html                  # Main page with lookup functionality
├── 📜 lookup-script.js            # Application logic
├── 🎨 styles.css                  # Styling
├── 🔧 generate-draw.sh            # Drawing script
├── 🌐 start-server.sh             # Web server starter
├── 📋 participants/               # Participant lists
│   ├── magnusson_participants.txt
│   └── soderwall_participants.txt
└── 🗂️ families/                   # Draws per year
    ├── 2024/
    │   ├── magnusson.csv
    │   └── soderwall.csv
    └── 2025/
        ├── magnusson.csv
        └── soderwall.csv
```

## 💡 How It Works

### Automatic Year Handling
- **2025**: System automatically looks for `families/2025/*.csv`
- **2026**: Next year system looks for `families/2026/*.csv` 
- **No data**: Shows "Contact Philip" message

### Secure Lookup
- **Direct entry**: Users land directly on the name entry screen
- **Private results**: Private result screen with assignments
- **Security**: No "look up another person" button, back button behavior controlled

### Smart Budget Handling
- **One family**: Shows relevant budget (600 SEK or 700 SEK)
- **Both families**: Shows both budgets + total sum (1300 SEK)

## 🔧 Scripts & Commands

### Drawing Script
```bash
./generate-draw.sh
```
- Reads from `participants/*.txt`
- Creates random circular assignments
- Generates `families/[YEAR]/*.csv` with budget info
- Guarantees no one gets themselves

### Web Server
```bash
./start-server.sh
```
- Starts HTTP server (solves CORS issues)
- Opens webpage automatically
- Stop with Ctrl+C

### Test "No Draw" Scenario
```bash
./test-no-draw.sh
```
- Temporarily removes current year's data
- Test "Contact Philip" message

## 📋 Annual Checklist

1. **📝 Update participants**
   - [ ] Edit `participants/magnusson_participants.txt`
   - [ ] Edit `participants/soderwall_participants.txt`

2. **🎲 Generate draw**
   - [ ] Run `./generate-draw.sh`
   - [ ] Verify CSV files were created

3. **🧪 Test system**
   - [ ] Run `./start-server.sh`
   - [ ] Try looking up some names
   - [ ] Check budget information

4. **📢 Notify family**
   - [ ] Send link or instructions
   - [ ] Remind to run via web server (not open HTML directly)

## 🌐 Hosting & Deployment

### Local (Development/Test)
```bash
./start-server.sh
# Opens: http://localhost:8081
```

### GitHub Pages
1. Push to GitHub repository
2. Enable GitHub Pages in settings
3. Website becomes available at: `https://[username].github.io/[repo-name]`

### Other Web Host
- Upload all files to web server
- No special configuration required
- Works on any static web host

## 🛠️ Technical Information

- **Languages**: HTML, CSS, JavaScript (vanilla, no frameworks)
- **Backend**: None - completely static
- **Security**: Client-side only, no external calls
- **Compatibility**: All modern browsers
- **Mobile-first**: Responsive design
- **Interface Language**: Swedish

## 🔒 Security & Privacy

- ✅ **Local data**: Everything stays in the browser
- ✅ **No external calls**: No data sent anywhere
- ✅ **Private lookup**: Each person only sees their own assignment
- ✅ **Year separation**: Old years not affected by new draws
- ✅ **Offline capable**: Works without internet after first load

## 🐛 Troubleshooting

**Problem: "Philip not found in family list" (or similar lookup errors)**
```bash
# Solution: Use web server instead of opening HTML file directly
./start-server.sh
```

**Problem: "No draw done yet"**
```bash
# Solution: Generate this year's draw
./generate-draw.sh
```

**Problem: Scripts cannot be executed**
```bash
# Solution: Make scripts executable
chmod +x *.sh
```

## 📊 Usage Example

```bash
# Set up for 2025
nano participants/magnusson_participants.txt  # Add/remove names
./generate-draw.sh                            # Generate draw
./start-server.sh                             # Start website

# Year 2026 - system is already ready!
./generate-draw.sh                            # Automatically creates families/2026/
```

---

🎄 **Merry Christmas and Happy Secret Santa!** 🎅

*Developed with love for the Magnusson & Söderwall families* ❤️