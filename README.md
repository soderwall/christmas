# 🎅 Secret Santa Web Application 🎄

En dynamisk Secret Santa-applikation för två familjer med automatisk århantering och säker, privat uppslagsfunktion.

## ✨ Funktioner

- **🗓️ Automatisk århantering** - Systemet detekterar automatiskt aktuellt år
- **🏠 Tvåfamiljs-support** - Hanterar Familjen Magnusson & Familjen Söderwall
- **💰 Olika budgetar** - 600 kr (Magnusson) / 700 kr (Söderwall) 
- **🔒 Säker uppslag** - Privat tvåstegs-process, ingen snooping möjlig
- **📱 Mobilanpassad** - Fungerar perfekt på alla enheter
- **🛠️ Bash-skript** - Automatiserad dragning med en kommando

## 🚀 Snabbstart

### För Deltagare
1. **Starta webbservern:**
   ```bash
   ./start-server.sh
   ```

2. **Slå upp din tilldelning:**
   - Ange ditt namn på webbsidan som öppnas
   - Se vem du ska ge present till
   - Få budgetinformation automatiskt

### För Administratörer (Philip)
1. **Uppdatera deltagarlistor:**
   ```bash
   # Redigera deltagarfiler efter behov
   nano participants/magnusson_participants.txt
   nano participants/soderwall_participants.txt
   ```

2. **Gör ny dragning:**
   ```bash
   ./generate-draw.sh
   ```

3. **Meddela familjen** att dragningen är klar!

## 📁 Projektstruktur

```
/
├── 📄 index.html                  # Startsida
├── 🔍 lookup.html                # Uppslagssida
├── 📜 lookup-script.js            # Applikationslogik
├── 🎨 styles.css                  # Styling
├── 🔧 generate-draw.sh            # Dragningsskript
├── 🌐 start-server.sh             # Webbserver-starter
├── 📋 participants/               # Deltagarlistor
│   ├── magnusson_participants.txt
│   └── soderwall_participants.txt
└── 🗂️ families/                   # Dragningar per år
    ├── 2024/
    │   ├── magnusson.csv
    │   └── soderwall.csv
    └── 2025/
        ├── magnusson.csv
        └── soderwall.csv
```

## 💡 Så Här Fungerar Det

### Automatisk Århantering
- **2025**: Systemet letar automatiskt efter `families/2025/*.csv`
- **2026**: Nästa år letar systemet efter `families/2026/*.csv` 
- **Ingen data**: Visar "Kontakta Philip" meddelande

### Säker Uppslag
- **Steg 1**: Ange namn (ingen autokomplettering synlig för andra)
- **Steg 2**: Privat resultatskärm med tilldelningar
- **Säkerhet**: Ingen "slå upp annan person" knapp, bakåt-knapp blockerad

### Smart Budgethantering
- **En familj**: Visar relevant budget (600kr eller 700kr)
- **Båda familjer**: Visar båda budgetar + totalsumma (1300kr)

## 🔧 Skript & Kommandon

### Dragningsskript
```bash
./generate-draw.sh
```
- Läser från `participants/*.txt`
- Skapar slumpmässiga cirkulära tilldelningar
- Genererar `families/[ÅR]/*.csv` med budgetinfo
- Garanterar att ingen får sig själv

### Webbserver
```bash
./start-server.sh
```
- Startar HTTP-server (löser CORS-problem)
- Öppnar webbsida automatiskt
- Stoppa med Ctrl+C

### Test av "Ingen Dragning"
```bash
./test-no-draw.sh
```
- Tar bort aktuellt års data tillfälligt
- Testa "Kontakta Philip" meddelandet

## 📋 Årlig Checklista

1. **📝 Uppdatera deltagare**
   - [ ] Redigera `participants/magnusson_participants.txt`
   - [ ] Redigera `participants/soderwall_participants.txt`

2. **🎲 Gör dragning**
   - [ ] Kör `./generate-draw.sh`
   - [ ] Verifiera att CSV-filer skapades

3. **🧪 Testa systemet**
   - [ ] Kör `./start-server.sh`
   - [ ] Prova att slå upp några namn
   - [ ] Kontrollera budgetinformation

4. **📢 Meddela familjen**
   - [ ] Skicka länk eller instruktioner
   - [ ] Påminn om att köra via webbserver (inte öppna HTML direkt)

## 🌐 Hosting & Deployment

### Lokalt (Utveckling/Test)
```bash
./start-server.sh
# Öppnar: http://localhost:8081
```

### GitHub Pages
1. Pusha till GitHub repository
2. Aktivera GitHub Pages i inställningar
3. Webbsida blir tillgänglig på: `https://[username].github.io/[repo-name]`

### Annan Webbhost
- Ladda upp alla filer till webbserver
- Ingen speciell konfiguration krävs
- Fungerar på alla statiska webbhotell

## 🛠️ Teknisk Information

- **Språk**: HTML, CSS, JavaScript (vanilla, inga ramverk)
- **Backend**: Ingen - helt statisk
- **Säkerhet**: Client-side endast, inga externa anrop
- **Kompatibilitet**: Alla moderna webbläsare
- **Mobile-first**: Responsiv design

## 🔒 Säkerhet & Integritet

- ✅ **Lokala data**: Allt stannar i webbläsaren
- ✅ **Inga externa anrop**: Ingen data skickas någonstans
- ✅ **Privat uppslag**: Varje person ser bara sin egen tilldelning
- ✅ **Årsseparation**: Gamla år påverkas inte av nya dragningar
- ✅ **Offline-kapabel**: Fungerar utan internet efter första laddning

## 🐛 Felsökning

**Problem: "Philip hittades inte i familjelistan"**
```bash
# Lösning: Använd webbserver istället för att öppna HTML-filen direkt
./start-server.sh
```

**Problem: "Ingen dragning gjord än"**
```bash
# Lösning: Skapa årets dragning
./generate-draw.sh
```

**Problem: Skript kan inte köras**
```bash
# Lösning: Gör skript körbara
chmod +x *.sh
```

## 📊 Exempel på Användning

```bash
# Sätt upp för 2025
nano participants/magnusson_participants.txt  # Lägg till/ta bort namn
./generate-draw.sh                            # Gör dragning
./start-server.sh                             # Starta webbsida

# År 2026 - systemet är redan redo!
./generate-draw.sh                            # Skapar automatiskt families/2026/
```

---

🎄 **God Jul och trevlig Secret Santa!** 🎅

*Utvecklad med kärlek för familjen Magnusson & Söderwall* ❤️