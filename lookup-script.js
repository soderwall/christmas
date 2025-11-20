// Secret Santa Lookup Application
class SecretSantaLookup {
    constructor() {
        this.assignments = {
            magnusson: new Map(),
            soderwall: new Map()
        };
        this.participants = {
            magnusson: new Set(),
            soderwall: new Set()
        };
        this.allParticipants = new Set();
        this.currentUser = null;
        this.currentYear = new Date().getFullYear();
        this.showNoDrawMessage = false;
        this.init();
    }

    async init() {
        this.bindEvents();
        this.updateYearDisplay();
        await this.loadAssignments();
    }

    updateYearDisplay() {
        const yearElement = document.getElementById('current-year');
        if (yearElement) {
            yearElement.textContent = this.currentYear;
        }
    }

    bindEvents() {
        const form = document.getElementById('lookup-form');
        const nameInput = document.getElementById('participant-name');

        form.addEventListener('submit', (e) => this.handleLookup(e));
        nameInput.addEventListener('input', (e) => this.showNameSuggestions(e));

        // Hide suggestions when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.form-group')) {
                this.hideNameSuggestions();
            }
        });

        // Prevent going back once results are shown
        window.addEventListener('popstate', (e) => {
            if (this.currentUser) {
                history.pushState(null, null, location.href);
            }
        });
    }

    async loadAssignments() {
        try {
            // Load both CSV files
            await Promise.all([
                this.loadFamilyAssignments('magnusson'),
                this.loadFamilyAssignments('soderwall')
            ]);

            // Build complete participants list
            this.allParticipants = new Set([
                ...this.participants.magnusson,
                ...this.participants.soderwall
            ]);

        } catch (error) {
            console.error('Error loading assignments:', error);
            if (this.showNoDrawMessage) {
                this.displayNoDrawMessage();
            } else {
                this.showError('Kunde inte ladda Secret Santa-tilldelningarna. Kontrollera CSV-filerna.');
            }
        }
        
        // Debug logging after loading
        console.log('Final participants count:', {
            magnusson: this.participants.magnusson.size,
            soderwall: this.participants.soderwall.size,
            total: this.allParticipants.size
        });
        console.log('All participants:', Array.from(this.allParticipants));
    }

    async loadFamilyAssignments(family) {
        try {
            const response = await fetch(`families/${this.currentYear}/${family}.csv`);
            if (!response.ok) {
                throw new Error(`Failed to load ${family}.csv for year ${this.currentYear}`);
            }
            
            const csvText = await response.text();
            this.parseFamilyCSV(family, csvText);
            
        } catch (error) {
            console.error(`Error loading ${family} assignments for ${this.currentYear}:`, error);
            
            // No fallback - just indicate no draw has been made yet
            this.showNoDrawMessage = true;
        }
    }

    parseFamilyCSV(family, csvText) {
        const lines = csvText.trim().split('\n');
        
        lines.forEach(line => {
            // Skip comment lines and empty lines
            if (line.startsWith('#') || !line.trim()) {
                return;
            }
            
            // Parse CSV format: Giver,Receiver
            const parts = line.split(',').map(part => part.trim().replace(/"/g, ''));
            
            if (parts.length === 2) {
                const [giver, receiver] = parts;
                this.assignments[family].set(giver, receiver);
                this.participants[family].add(giver);
                this.participants[family].add(receiver);
            }
        });

        console.log(`Loaded ${family} family:`, Array.from(this.participants[family]));
        console.log(`${family} assignments:`, this.assignments[family]);
        console.log(`Total participants in ${family}:`, this.participants[family].size);
        console.log(`Total assignments in ${family}:`, this.assignments[family].size);
    }

    createSampleData(family) {
        // Fallback sample data if CSV loading fails
        const sampleData = {
            magnusson: [
                ['Ida', 'Philip'],
                ['Philip', 'Carina'],
                ['Carina', 'Tibbe'],
                ['Tibbe', 'Elin'],
                ['Elin', 'Jocke'],
                ['Jocke', 'Sofie'],
                ['Sofie', 'Ida']
            ],
            soderwall: [
                ['Ida', 'Philip'],
                ['Philip', 'Catarina'],
                ['Catarina', 'Tobbe'],
                ['Tobbe', 'Eva'],
                ['Eva', 'Rune'],
                ['Rune', 'Julia'],
                ['Julia', 'Sefa'],
                ['Sefa', 'Ida']
            ]
        };

        if (sampleData[family]) {
            sampleData[family].forEach(([giver, receiver]) => {
                this.assignments[family].set(giver, receiver);
                this.participants[family].add(giver);
                this.participants[family].add(receiver);
            });
        }
    }

    handleLookup(e) {
        e.preventDefault();
        
        const nameInput = document.getElementById('participant-name');
        const name = nameInput.value.trim();
        
        if (!name) {
            this.showError('Vänligen ange ditt namn');
            return;
        }

        const results = this.findAssignments(name);
        
        if (results.found) {
            this.currentUser = name;
            this.showResultsScreen(name, results);
            // Prevent browser back button
            history.pushState(null, null, location.href);
        } else {
            // More informative error message
            const totalParticipants = this.allParticipants.size;
            if (totalParticipants === 0) {
                this.showError(`Kunde inte ladda deltagarlistor. Kontrollera att CSV-filerna finns och att sidan körs via en webbserver (inte lokala filer).`);
            } else {
                this.showError(`Tyvärr, "${name}" hittades inte i någon familjelista. Kontrollera stavningen eller prova ett annat namn. (${totalParticipants} deltagare laddade)`);
            }
        }
    }

    findAssignments(name) {
        const results = {
            found: false,
            assignments: {}
        };

        // Check both families
        ['magnusson', 'soderwall'].forEach(family => {
            // Check for exact match or case-insensitive match
            let foundName = null;
            
            // First try exact match
            if (this.assignments[family].has(name)) {
                foundName = name;
            } else {
                // Try case-insensitive match
                for (const participantName of this.participants[family]) {
                    if (participantName.toLowerCase() === name.toLowerCase()) {
                        foundName = participantName;
                        break;
                    }
                }
            }
            
            if (foundName && this.assignments[family].has(foundName)) {
                results.found = true;
                results.assignments[family] = {
                    giver: foundName,
                    receiver: this.assignments[family].get(foundName)
                };
            }
        });

        return results;
    }

    showResultsScreen(searchName, results) {
        const nameEntryScreen = document.getElementById('name-entry-screen');
        const christmasLoadingScreen = document.getElementById('christmas-loading-screen');
        const resultsScreen = document.getElementById('results-screen');
        const resultsGreeting = document.getElementById('results-greeting');
        const assignmentResults = document.getElementById('assignment-results');
        
        // Show Christmas loading animation first
        nameEntryScreen.style.display = 'none';
        christmasLoadingScreen.style.display = 'block';
        this.startChristmasAnimation();
        
        // After animation completes, show results
        setTimeout(() => {
            christmasLoadingScreen.style.display = 'none';
            resultsScreen.style.display = 'block';
        
        // Set greeting
        resultsGreeting.textContent = `Hej ${searchName}! Här är din Secret Santa-tilldelning:`;
        
        let html = '';
        const assignmentCount = Object.keys(results.assignments).length;
        
        if (assignmentCount > 1) {
            html += `<div class="multiple-families-note">Du deltar i båda familjerna och ska köpa <strong>${assignmentCount} presenter</strong>:</div>`;
        }
        
        Object.entries(results.assignments).forEach(([family, assignment]) => {
            const familyDisplayName = family === 'magnusson' ? 'Familjen Magnusson' : 'Familjen Söderwall';
            html += `
                <div class="assignment-card">
                    <h3 class="family-name">${familyDisplayName}</h3>
                    <div class="assignment-details">
                        <div class="assignment-text">Du ska ge present till:</div>
                        <div class="receiver">${this.escapeHtml(assignment.receiver)}</div>
                    </div>
                </div>
            `;
        });

            assignmentResults.innerHTML = html;
            this.updateBudgetInfo(results);
            this.hideNameSuggestions();
            
            // Scroll to top of results screen
            resultsScreen.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 3000); // Show animation for 3 seconds
    }

    startChristmasAnimation() {
        // Create snowflakes
        this.createSnowflakes();
        
        // Start present bounce animation
        const presents = document.querySelectorAll('.present');
        presents.forEach((present, index) => {
            setTimeout(() => {
                present.style.animation = 'bounce 1s ease-in-out infinite';
            }, index * 300);
        });
    }

    createSnowflakes() {
        const snowContainer = document.querySelector('.snow-container');
        if (!snowContainer) return;
        
        // Clear existing snowflakes
        snowContainer.innerHTML = '';
        
        // Create 50 snowflakes
        for (let i = 0; i < 50; i++) {
            const snowflake = document.createElement('div');
            snowflake.className = 'snowflake';
            snowflake.innerHTML = ['❄️', '❅', '❆'][Math.floor(Math.random() * 3)];
            snowflake.style.left = Math.random() * 100 + '%';
            snowflake.style.animationDuration = (Math.random() * 3 + 2) + 's';
            snowflake.style.animationDelay = Math.random() * 2 + 's';
            snowflake.style.fontSize = (Math.random() * 0.8 + 0.8) + 'rem';
            snowContainer.appendChild(snowflake);
        }
    }

    updateBudgetInfo(results) {
        const budgetInfo = document.getElementById('budget-info');
        if (!budgetInfo) return;

        const families = Object.keys(results.assignments);
        let budgetHtml = '<div class="budget-details">';

        if (families.length === 1) {
            // Person participates in only one family
            const family = families[0];
            const budget = family === 'magnusson' ? '600 kr' : '700 kr';
            const familyName = family === 'magnusson' ? 'Familjen Magnusson' : 'Familjen Söderwall';
            
            budgetHtml += `
                <div class="budget-item">
                    <strong>Budget för ${familyName}:</strong> ${budget}
                </div>
            `;
        } else {
            // Person participates in both families
            budgetHtml += `
                <div class="budget-item">
                    <strong>Budget för Familjen Magnusson:</strong> 600 kr
                </div>
                <div class="budget-item">
                    <strong>Budget för Familjen Söderwall:</strong> 700 kr
                </div>
                <div class="total-budget">
                    <strong>Total budget:</strong> 1300 kr (två presenter)
                </div>
            `;
        }

        budgetHtml += '</div>';
        budgetInfo.innerHTML = budgetHtml;
    }

    resetLookup() {
        const nameInput = document.getElementById('participant-name');
        const resultsSection = document.querySelector('.results-section');
        
        nameInput.value = '';
        resultsSection.style.display = 'none';
        nameInput.focus();
    }

    showNameSuggestions(e) {
        const input = e.target.value.toLowerCase().trim();
        const suggestionsDiv = document.getElementById('name-suggestions');
        
        if (input.length < 2) {
            this.hideNameSuggestions();
            return;
        }

        const matches = Array.from(this.allParticipants)
            .filter(name => name.toLowerCase().includes(input))
            .sort()
            .slice(0, 8); // Limit to 8 suggestions

        if (matches.length === 0) {
            this.hideNameSuggestions();
            return;
        }

        const html = matches.map(name => 
            `<div class="suggestion-item" data-name="${this.escapeHtml(name)}">${this.escapeHtml(name)}</div>`
        ).join('');

        suggestionsDiv.innerHTML = html;
        suggestionsDiv.style.display = 'block';

        // Add click handlers to suggestions
        suggestionsDiv.querySelectorAll('.suggestion-item').forEach(item => {
            item.addEventListener('click', () => {
                e.target.value = item.dataset.name;
                this.hideNameSuggestions();
                e.target.focus();
            });
        });
    }

    hideNameSuggestions() {
        const suggestionsDiv = document.getElementById('name-suggestions');
        suggestionsDiv.style.display = 'none';
    }

    updateFamilyStatus() {
        ['magnusson', 'soderwall'].forEach(family => {
            const statusDiv = document.getElementById(`${family}-status`);
            const participantCount = this.participants[family].size;
            const assignmentCount = this.assignments[family].size;
            
            let html = '';
            if (assignmentCount > 0) {
                html = `
                    <p class="status-good">✅ ${assignmentCount} tilldelningar laddade</p>
                    <p class="participant-count">${participantCount} deltagare</p>
                `;
            } else {
                html = `<p class="status-error">❌ Inga tilldelningar hittades</p>`;
            }
            
            statusDiv.innerHTML = html;
        });
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    showWarning(message) {
        this.showNotification(message, 'warning');
    }

    displayNoDrawMessage() {
        // Hide the form and show a message that no draw has been made yet
        const lookupSection = document.querySelector('.lookup-section');
        lookupSection.innerHTML = `
            <div class="card no-draw-card">
                <h2>🎄 Ingen dragning gjord än 🎄</h2>
                <div class="no-draw-message">
                    <p><strong>Det har inte gjorts någon Secret Santa-dragning för ${this.currentYear} än.</strong></p>
                    <p>Kontakta <strong>Philip</strong> för att ordna dragningen.</p>
                    <div class="year-info">
                        <small>Söker efter: families/${this.currentYear}/</small>
                    </div>
                </div>
            </div>
        `;
    }

    showNotification(message, type) {
        // Remove existing notifications
        const existing = document.querySelector('.notification');
        if (existing) {
            existing.remove();
        }

        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Style the notification
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '15px 20px',
            borderRadius: '8px',
            color: 'white',
            fontWeight: 'bold',
            zIndex: '1000',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
            transform: 'translateX(100%)',
            transition: 'transform 0.3s ease',
            maxWidth: '300px'
        });

        if (type === 'error') {
            notification.style.background = 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)';
        } else if (type === 'warning') {
            notification.style.background = 'linear-gradient(135deg, #ffc107 0%, #e0a800 100%)';
            notification.style.color = '#212529';
        } else {
            notification.style.background = 'linear-gradient(135deg, #28a745 0%, #20c997 100%)';
        }

        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 10);

        // Remove after 4 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.transform = 'translateX(100%)';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.remove();
                    }
                }, 300);
            }
        }, 4000);
    }
}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.lookupApp = new SecretSantaLookup();
});

// Add some festive touches
document.addEventListener('DOMContentLoaded', () => {
    // Add hover effects to cards
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
});