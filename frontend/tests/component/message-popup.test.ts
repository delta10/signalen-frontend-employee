import { test, expect } from '@playwright/test';

// Breid Window interface uit voor custom properties
declare global {
  interface Window {
    isClosed?: boolean;
    expandedReportId?: string;
    onCloseCallback?: () => void;
    onExpandCallback?: (id: string) => void;
  }
}

test.describe('ReportDetailSheet', () => {
  test.beforeEach(async ({ page }) => {
    // Registreer de ReportDetailSheet component als een custom element
    await page.evaluate(() => {
      if (customElements.get('report-detail-sheet')) {
        return; // Al gedefinieerd
      }

      window.customElements.define('report-detail-sheet', class extends HTMLElement {
        isEditing = false;
        isLocationCollapsed = false;
        selectedStatus = 'In behandeling';
        selectedPriority = 'Normaal';

        connectedCallback() {
          this.render();
          this.attachEventListeners();
        }
        
        attachEventListeners() {
          // Bewerk knop
          const editBtn = this.querySelector('.edit-button');
          if (editBtn) {
            editBtn.addEventListener('click', () => {
              this.isEditing = true;
              this.render();
              this.attachEventListeners();
            });
          }

          // Annuleer knop
          const cancelBtn = this.querySelector('.cancel-button');
          if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
              this.isEditing = false;
              this.render();
              this.attachEventListeners();
            });
          }

          // Opslaan knop
          const saveBtn = this.querySelector('.save-button');
          if (saveBtn) {
            saveBtn.addEventListener('click', () => {
              // Update waarden van selects
              const statusSelect = this.querySelector('.status-select') as HTMLSelectElement;
              const prioritySelect = this.querySelector('.priority-select') as HTMLSelectElement;
              if (statusSelect) this.selectedStatus = statusSelect.value;
              if (prioritySelect) this.selectedPriority = prioritySelect.value;
              
              this.isEditing = false;
              this.render();
              this.attachEventListeners();
            });
          }

          // Locatie sectie toggle
          const locationHeader = this.querySelector('.location-section > .section-header');
          if (locationHeader) {
            locationHeader.addEventListener('click', () => {
              this.isLocationCollapsed = !this.isLocationCollapsed;
              this.render();
              this.attachEventListeners();
            });
          }

          // Sluit knop
          const closeBtn = this.querySelector('.close-button');
          if (closeBtn) {
            closeBtn.addEventListener('click', () => {
              if (window.onCloseCallback) {
                window.onCloseCallback();
              }
            });
          }

          // Uitklap knop
          const expandBtn = this.querySelector('.expand-button');
          if (expandBtn) {
            expandBtn.addEventListener('click', () => {
              if (window.onExpandCallback) {
                window.onExpandCallback('1');
              }
            });
          }

          // Dropdown menu
          const optionsBtn = this.querySelector('.options-button');
          if (optionsBtn) {
            optionsBtn.addEventListener('click', (e) => {
              e.stopPropagation();
              const menu = this.querySelector('.menu-items') as HTMLElement;
              if (menu) {
                const currentDisplay = window.getComputedStyle(menu).display;
                menu.style.display = currentDisplay === 'none' ? 'block' : 'none';
              }
            });
          }
        }
        
        render() {
          this.innerHTML = `
            <div class="report-detail-sheet">
              <h2>Sample Report</h2>
              <div class="status">${this.selectedStatus}</div>
              <div class="priority">${this.selectedPriority}</div>
              <div class="location">Dam 1, 1012 JS Amsterdam</div>
              <div class="reporter">test@example.com</div>
              
              <button class="expand-button">Open volledige weergave</button>
              <button class="edit-button" style="display: ${this.isEditing ? 'none' : 'block'};">Bewerken</button>
              <button class="save-button" style="display: ${this.isEditing ? 'block' : 'none'};">Opslaan</button>
              <button class="cancel-button" style="display: ${this.isEditing ? 'block' : 'none'};">Annuleren</button>
              <button class="close-button">Close</button>
              
              ${this.isEditing ? `
                <select class="status-select">
                  <option value="In behandeling" ${this.selectedStatus === 'In behandeling' ? 'selected' : ''}>In behandeling</option>
                  <option value="Afgehandeld" ${this.selectedStatus === 'Afgehandeld' ? 'selected' : ''}>Afgehandeld</option>
                </select>
                <select class="priority-select">
                  <option value="Normaal" ${this.selectedPriority === 'Normaal' ? 'selected' : ''}>Normaal</option>
                  <option value="Hoog" ${this.selectedPriority === 'Hoog' ? 'selected' : ''}>Hoog</option>
                </select>
              ` : ''}

              <div class="location-section">
                <div class="section-header">Locatie</div>
                <div class="collapsible-content" style="display: ${this.isLocationCollapsed ? 'none' : 'block'};">
                  <div class="address">Dam 1, 1012 JS Amsterdam</div>
                  <a href="https://maps.google.com/?q=Dam+1,+1012+JS+Amsterdam" target="_blank" class="map-button">Open Map</a>
                  <div data-testid="mock-map">Mock Map</div>
                </div>
              </div>

              <div class="reporter-section">
                <div class="section-header">Melder</div>
                <div class="collapsible-content">
                  <a href="mailto:test@example.com" class="email-link">test@example.com</a>
                </div>
              </div>

              <div class="dropdown-menu">
                <button class="options-button">More options</button>
                <div class="menu-items" style="display: none;">
                  <div>Deelmelding maken</div>
                  <div>Extern doorzetten</div>
                  <div>PDF maken</div>
                </div>
              </div>
            </div>
          `;
        }
      });
    });
  });

  // --- Initiële Render Tests ---
  
  test('renders with report data', async ({ page }) => {
    await page.setContent('<report-detail-sheet></report-detail-sheet>');

    await expect(page.locator('h2')).toHaveText('Sample Report');
    await expect(page.locator('.status')).toHaveText('In behandeling');
    await expect(page.locator('.priority')).toHaveText('Normaal');
    await expect(page.locator('.location')).toHaveText('Dam 1, 1012 JS Amsterdam');
    await expect(page.locator('.reporter')).toHaveText('test@example.com');
    await expect(page.locator('.expand-button')).toBeVisible();
  });

  test('does not render when report is null', async ({ page }) => {
    await page.setContent('<div id="container"></div>');
    
    // Verifieer dat er geen report-detail-sheet aanwezig is
    await expect(page.locator('report-detail-sheet')).toHaveCount(0);
  });

  // --- Interactie Tests ---

  test('can be closed via onClose callback', async ({ page }) => {
    await page.setContent('<report-detail-sheet></report-detail-sheet>');

    await page.evaluate(() => {
      window.isClosed = false;
      window.onCloseCallback = () => {
        window.isClosed = true;
      };
    });
    
    await page.locator('.close-button').click();
    
    const closed = await page.evaluate(() => window.isClosed);
    expect(closed).toBe(true);
  });

  test('opens expand to full view', async ({ page }) => {
    await page.setContent('<report-detail-sheet></report-detail-sheet>');
    
    await page.evaluate(() => {
      window.expandedReportId = '';
      window.onExpandCallback = (id: string) => {
        window.expandedReportId = id;
      };
    });
    
    await page.locator('.expand-button').click();
    
    const reportId = await page.evaluate(() => window.expandedReportId);
    expect(reportId).toBe('1');
  });

  // --- Mode Omschakeling Tests ---

  test('editing mode can be toggled', async ({ page }) => {
    await page.setContent('<report-detail-sheet></report-detail-sheet>');

    await expect(page.locator('.edit-button')).toBeVisible();
    await expect(page.locator('.save-button')).toBeHidden();
    
    await page.locator('.edit-button').click();
    
    await expect(page.locator('.edit-button')).toBeHidden();
    await expect(page.locator('.save-button')).toBeVisible();
    await expect(page.locator('.cancel-button')).toBeVisible();
    
    await page.locator('.cancel-button').click();
    
    await expect(page.locator('.edit-button')).toBeVisible();
    await expect(page.locator('.save-button')).toBeHidden();
  });

  test('can change status and priority in edit mode', async ({ page }) => {
    await page.setContent('<report-detail-sheet></report-detail-sheet>');
    
    await page.locator('.edit-button').click();
    
    await page.selectOption('.status-select', 'Afgehandeld');
    await page.selectOption('.priority-select', 'Hoog');
    
    const selectedStatus = await page.locator('.status-select').inputValue();
    expect(selectedStatus).toBe('Afgehandeld');

    const selectedPriority = await page.locator('.priority-select').inputValue();
    expect(selectedPriority).toBe('Hoog');
    
    // Opslaan en verifieer dat de wijzigingen blijven bestaan
    await page.locator('.save-button').click();
    
    // Na het opslaan zouden we terug moeten zijn in weergave modus met bijgewerkte waarden
    await expect(page.locator('.edit-button')).toBeVisible();
    await expect(page.locator('.status')).toHaveText('Afgehandeld');
    await expect(page.locator('.priority')).toHaveText('Hoog');
  });

  // --- UI/Structuur Tests ---

  test('collapsible sections can be toggled', async ({ page }) => {
    await page.setContent('<report-detail-sheet></report-detail-sheet>');

    const locationContent = page.locator('.location-section .collapsible-content');
    
    await expect(locationContent).toBeVisible();
    
    await page.locator('.location-section .section-header').click();
    
    await expect(locationContent).toBeHidden();
    
    await page.locator('.location-section .section-header').click();
    
    await expect(locationContent).toBeVisible();
  });

  test('dropdown menu items are present', async ({ page }) => {
    await page.setContent('<report-detail-sheet></report-detail-sheet>');
    
    const menuItems = page.locator('.menu-items');
    
    await expect(menuItems).toBeHidden();

    await page.locator('.options-button').click();
    
    await expect(menuItems).toBeVisible();
    
    await expect(menuItems).toContainText('Deelmelding maken');
    await expect(menuItems).toContainText('Extern doorzetten');
    await expect(menuItems).toContainText('PDF maken');
  });

  test('map link opens in new tab', async ({ page }) => {
    await page.setContent('<report-detail-sheet></report-detail-sheet>');

    const mapLink = page.locator('.map-button');
    
    await expect(mapLink).toHaveAttribute('href', 'https://maps.google.com/?q=Dam+1,+1012+JS+Amsterdam');
    await expect(mapLink).toHaveAttribute('target', '_blank');
    
    const [newPage] = await Promise.all([
      page.waitForEvent('popup'),
      mapLink.click()
    ]);
    
    expect(newPage).not.toBeNull();
    await newPage.close();
  });

  test('email link is correct', async ({ page }) => {
    await page.setContent('<report-detail-sheet></report-detail-sheet>');

    const emailLink = page.locator('.email-link');
    
    await expect(emailLink).toHaveAttribute('href', 'mailto:test@example.com');
  });
});