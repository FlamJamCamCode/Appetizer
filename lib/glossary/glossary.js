/**
 * Glossary System - Reusable automatic term highlighting and definition display
 * 
 * Usage:
 * 1. Include glossary.css and glossary.js in your HTML
 * 2. Add the modal HTML structure (see end of file)
 * 3. Initialize with: Glossary.init({ glossaryPath: 'path/to/glossary.json' })
 * 4. Call Glossary.process(element) on any element to highlight terms
 * 
 * Config options:
 * - glossaryPath: Path to glossary.json (default: 'glossary.json')
 * - foundationReaderUrl: Base URL for foundation reader (default: '/?f&doc=')
 * - windowSize: { width: 750, height: 450 } for foundation reader windows
 * - enabled: Start enabled (default: true)
 */

(function() {
  'use strict';

  const Glossary = {
    data: null,
    enabled: true,
    config: {
      glossaryPath: '/lib/glossary/glossary.json',
      readerUrl: '/?',
      windowSize: { width: 500, height: 800 },
      enabled: true
    },

    // Initialize glossary system
    async init(options = {}) {
      Object.assign(this.config, options);
      this.enabled = this.config.enabled;
      
      // Ensure modal HTML exists
      this.ensureModalHTML();
      
      // Load glossary data
      await this.loadGlossary();
      
      // Set up modal handlers
      this.setupModalHandlers();
      
      return this;
    },

    // Load glossary JSON
    async loadGlossary() {
      try {
        const response = await fetch(this.config.glossaryPath);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        this.data = await response.json();
        return this.data;
      } catch (error) {
        console.warn('Failed to load glossary.json:', error);
        this.data = { terms: {} };
        return this.data;
      }
    },

    // Create term variations for matching (handles word order variations ONLY)
    // CRITICAL: Position 0 and Position O are COMPLETELY DISTINCT concepts - NEVER conflate them:
    // - Position 0 = total domination of EVERYONE (including bunkers/towers) - uses NUMBER 0
    // - Position O = domination only of normal persons (bunkers are SAFE) - uses LETTER O
    // These must be matched SEPARATELY with NO cross-contamination
    getTermVariations(term) {
      const variations = [term];
      const lowerTerm = term.toLowerCase();
      
      // ONLY handle Position 0 if it contains the NUMBER 0 (not letter O)
      // Match "Position 0" or "0 Position" with NUMBER 0
      if (term.match(/\bPosition\s+0\b/) || term.match(/\b0\s+Position\b/)) {
        // This is Position 0 (NUMBER) - only create variations with NUMBER 0
        variations.push('Position 0');
        variations.push('0 Position');
        variations.push('position 0');
        variations.push('0 position');
        // DO NOT include any variations with letter O - this is Position 0, NOT Position O
        return [...new Set(variations)]; // Return early to prevent any mixing
      }
      
      // ONLY handle Position O if it contains the LETTER O (not number 0)
      // Match "Position O" or "O Position" with LETTER O (case-insensitive but NOT number 0)
      if (term.match(/\bPosition\s+O\b/i) && !term.match(/\bPosition\s+0\b/)) {
        // This is Position O (LETTER) - only create variations with LETTER O
        variations.push('Position O');
        variations.push('O Position');
        variations.push('position O');
        variations.push('O position');
        variations.push('o position');
        // DO NOT include any variations with number 0 - this is Position O, NOT Position 0
        return [...new Set(variations)]; // Return early to prevent any mixing
      }
      if (term.match(/\bO\s+Position\b/i) && !term.match(/\b0\s+Position\b/)) {
        // This is Position O (LETTER) - only create variations with LETTER O
        variations.push('Position O');
        variations.push('O Position');
        variations.push('position O');
        variations.push('O position');
        variations.push('o position');
        // DO NOT include any variations with number 0 - this is Position O, NOT Position 0
        return [...new Set(variations)]; // Return early to prevent any mixing
      }
      
      // Handle Zero Cost Effort variations (ZCE)
      if (term.match(/Zero Cost Effort|ZCE/i)) {
        variations.push('zce');
        variations.push('no cost effort');

      }
      // Handle Pwnership variations (pwnership, pwn, pwned)
      if (term.match(/Pwnership|pwnership/i)) {
        variations.push('Pwnership');
        variations.push('pwnership');
        variations.push('PWNERSHIP');
        variations.push('pwn');
        variations.push('Pwn');
        variations.push('PWN');
        variations.push('pwned');
        variations.push('Pwned');
        variations.push('PWNED');
        return [...new Set(variations)];
      }
      
      // Handle TOP (Tower of Power) variations
      if (term.match(/Tower of Power|TOP|top/i)) {
        variations.push('Tower of Power');
        variations.push('tower of power');
        variations.push('TOWER OF POWER');
        variations.push('TOP');
        variations.push('top');
        variations.push('Top');
        return [...new Set(variations)];
      }
      
      // Handle CTOP (Castle + Tower of Power) variations
      if (term.match(/CTOP|ctop/i)) {
        variations.push('CTOP');
        variations.push('ctop');
        variations.push('Ctop');
        variations.push('Castle + Tower of Power');
        variations.push('Castle Tower of Power');
        return [...new Set(variations)];
      }
      
      // Handle Caesarian Laurels variations (including "caesarianly laureled")
      if (term.match(/Caesarian Laurels|Caesarianly|caesarian/i)) {
        variations.push('Caesarian Laurels');
        variations.push('caesarian laurels');
        variations.push('CAESARIAN LAURELS');
        variations.push('Caesarianly Laureled');
        variations.push('caesarianly laureled');
        variations.push('Caesarianly laureled');
        variations.push('caesarianly laureled command');
        variations.push('Caesarianly Laureled Command');
        // Also match just "caesarianly laureled" (without command) - this will be handled by partial matching
        variations.push('caesarianly laureled');
        return [...new Set(variations)];
      }
      
      // Handle PoP → Proof of Person variations
      if (term.match(/\bPoP\b/i) || term.match(/\bProof of Person\b/i)) {
        variations.push('PoP');
        variations.push('POP');
        variations.push('pop');
        variations.push('Proof of Person');
        variations.push('proof of person');
        variations.push('PROOF OF PERSON');
        return [...new Set(variations)];
      }
      
      // Handle PoU → Proof of Utility variations
      if (term.match(/\bPoU\b/i) || term.match(/\bProof of Utility\b/i)) {
        variations.push('PoU');
        variations.push('POU');
        variations.push('pou');
        variations.push('Proof of Utility');
        variations.push('proof of utility');
        variations.push('PROOF OF UTILITY');
        return [...new Set(variations)];
      }
      
      // Handle Discovery OS variations
      if (term.match(/Discovery OS|DiscoveryOS|discovery-os/i)) {
        variations.push('Discovery OS');
        variations.push('DiscoveryOS');
        variations.push('discovery-os');
        variations.push('discovery OS');
        variations.push('DISCOVERY OS');
        return [...new Set(variations)];
      }
      
      // Handle Trust Network variations
      if (term.match(/Trust Network|Trust Networks|trust network/i)) {
        variations.push('Trust Network');
        variations.push('Trust Networks');
        variations.push('trust network');
        variations.push('trust networks');
        variations.push('TRUST NETWORK');
        variations.push('TRUST NETWORKS');
        return [...new Set(variations)];
      }
      
      // Handle Constant-Time / O(1) variations
      if (term.match(/Constant-Time|Constant Time|O\(1\)|O\( 1 \)|constant-time|constant time/i)) {
        variations.push('Constant-Time');
        variations.push('Constant Time');
        variations.push('constant-time');
        variations.push('constant time');
        variations.push('O(1)');
        variations.push('O( 1 )');
        variations.push('o(1)');
        return [...new Set(variations)];
      }
      
      // Handle P-Time variations
      if (term.match(/P-Time|P Time|p-time|p time/i)) {
        variations.push('P-Time');
        variations.push('P Time');
        variations.push('p-time');
        variations.push('p time');
        variations.push('P-time');
        return [...new Set(variations)];
      }
      
      // Handle NP-Time variations
      if (term.match(/NP-Time|NP Time|np-time|np time/i)) {
        variations.push('NP-Time');
        variations.push('NP Time');
        variations.push('np-time');
        variations.push('np time');
        variations.push('NP-time');
        return [...new Set(variations)];
      }
      
      // Handle Exponential / Super-Genius variations
      if (term.match(/Exponential|Super-Genius|Super Genius|exponential|super-genius|super genius/i)) {
        variations.push('Exponential');
        variations.push('exponential');
        variations.push('Super-Genius');
        variations.push('Super Genius');
        variations.push('super-genius');
        variations.push('super genius');
        return [...new Set(variations)];
      }
      
      // Handle Crimson variations
      if (term.match(/Crimson|crimson/i)) {
        variations.push('Crimson');
        variations.push('crimson');
        variations.push('CRIMSON');
        return [...new Set(variations)];
      }
      
      // Handle Azure variations
      if (term.match(/Azure|azure/i)) {
        variations.push('Azure');
        variations.push('azure');
        variations.push('AZURE');
        return [...new Set(variations)];
      }
      
      // Handle Gray variations
      if (term.match(/Gray|gray/i)) {
        variations.push('Gray');
        variations.push('gray');
        variations.push('Grey');
        variations.push('grey');
        variations.push('GRAY');
        return [...new Set(variations)];
      }
      
      // Handle Feminine Becoming variations
      if (term.match(/Feminine Becoming|feminine becoming/i)) {
        variations.push('Feminine Becoming');
        variations.push('feminine becoming');
        variations.push('FEMININE BECOMING');
        variations.push('Feminine-Becoming');
        variations.push('feminine-becoming');
        return [...new Set(variations)];
      }
      
      // Handle Favor Economy / Favor Debt variations
      if (term.match(/Favor Economy|Favor Debt|favor economy|favor debt/i)) {
        variations.push('Favor Economy');
        variations.push('Favor Debt');
        variations.push('favor economy');
        variations.push('favor debt');
        variations.push('Favor Economy / Favor Debt');
        variations.push('favor economy / favor debt');
        return [...new Set(variations)];
      }

      // Handle evolution variations
      if (term.match(/Evolution/i)) {
        variations.push('evolved');
        variations.push('evo');
        variations.push('natural becoming');
        variations.push('sexual becoming');
        variations.push('divine foundation');
        return [...new Set(variations)];
      }
      
      // Handle Hearth variations
      if (term.match(/hearth/i)) {
        variations.push('Hearth');
        variations.push('hearth');
        variations.push('HEARTH');
        return [...new Set(variations)];
      }

      // Handle Nesting Forking Sharding variations
      if (term.match(/nesting/i)) {
        variations.push('Nesting');
        variations.push('Forking');
        variations.push('Sharding');
        variations.push('Nest');
        variations.push('Fork');
        variations.push('Shard');
        return [...new Set(variations)];
      }
      
      // Handle Hilltop Merit variations
      if (term.match(/Hilltop Merit|Hilltop of Merit/i)) {
        variations.push('Hilltop Merit');
        variations.push('Hilltop of Merit');
        variations.push('hilltop merit');
        variations.push('hilltop of merit');
        variations.push('Hilltop-Merit');
        variations.push('hilltop-merit');
        return [...new Set(variations)];
      }
      
      // For all other terms, return just the original term
      return [term];
    },

    // Find glossary terms in text
    findGlossaryTerms(text) {
      if (!this.data || !this.data.terms || !this.enabled) return text;
      
      const terms = Object.keys(this.data.terms);
      const sortedTerms = terms.sort((a, b) => {
        const lenA = this.data.terms[a].term.length;
        const lenB = this.data.terms[b].term.length;
        return lenB - lenA; // Sort by length to match longer terms first
      });
      
      let result = text;
      const replacements = [];
      
      sortedTerms.forEach(termKey => {
        const termData = this.data.terms[termKey];
        const termVariations = this.getTermVariations(termData.term);
        
        termVariations.forEach(termText => {
          // Escape regex special characters
          const escaped = termText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          // For multi-word terms, use word boundaries with spaces, case-insensitive
          // Replace spaces in regex to ensure word boundaries work correctly
          const regexPattern = escaped.includes(' ') 
            ? `\\b${escaped.replace(/\s+/g, '\\s+')}\\b`
            : `\\b${escaped}\\b`;
          const regex = new RegExp(regexPattern, 'gi');
          const matches = [...result.matchAll(regex)];
          
          matches.forEach(match => {
            const start = match.index;
            const end = start + match[0].length;
            
            // Check if already inside a glossary-term span or code/pre tag
            const beforeText = result.substring(0, start);
            const lastOpen = Math.max(
              beforeText.lastIndexOf('<span class="glossary-term"'),
              beforeText.lastIndexOf('<code'),
              beforeText.lastIndexOf('<pre')
            );
            const lastClose = beforeText.lastIndexOf('</span>');
            
            if (lastOpen > lastClose) {
              return; // Already inside a glossary term or code/pre tag
            }
            
            // Check if this would overlap with existing replacement
            const overlaps = replacements.some(r => 
              (start >= r.start && start < r.end) || 
              (end > r.start && end <= r.end) ||
              (start <= r.start && end >= r.end)
            );
            
            if (!overlaps) {
              replacements.push({ 
                start, 
                end, 
                termKey, 
                originalText: match[0] 
              });
            }
          });
        });
      });
      
      // Sort replacements by position (reverse order for safe replacement)
      replacements.sort((a, b) => b.start - a.start);
      
      // Replace from end to start to preserve indices
      replacements.forEach(({ start, end, termKey, originalText }) => {
        const before = result.substring(0, start);
        const after = result.substring(end);
        const span = `<span class="glossary-term" data-term="${termKey}">${originalText}</span>`;
        result = before + span + after;
      });
      
      return result;
    },

    // Process element for glossary terms
    process(element) {
      if (!element || !this.enabled || !this.data) return;
      
      // Skip if element contains code/pre tags (don't process inside them)
      if (element.closest('code, pre, script, style')) return;
      
      // Process text nodes
      const walker = document.createTreeWalker(
        element,
        NodeFilter.SHOW_TEXT,
        {
          acceptNode: (node) => {
            // Skip if inside code/pre/script/style tags
            if (node.parentElement.closest('code, pre, script, style')) {
              return NodeFilter.FILTER_REJECT;
            }
            // Skip if inside a glossary-term span
            if (node.parentElement.closest('.glossary-term')) {
              return NodeFilter.FILTER_REJECT;
            }
            return NodeFilter.FILTER_ACCEPT;
          }
        }
      );
      
      const textNodes = [];
      let node;
      while (node = walker.nextNode()) {
        if (node.textContent.trim()) {
          textNodes.push(node);
        }
      }
      
      textNodes.forEach(textNode => {
        const originalText = textNode.textContent;
        const processed = this.findGlossaryTerms(originalText);
        
        if (processed !== originalText) {
          const parent = textNode.parentNode;
          const tempDiv = document.createElement('div');
          tempDiv.innerHTML = processed;
          
          while (tempDiv.firstChild) {
            parent.insertBefore(tempDiv.firstChild, textNode);
          }
          parent.removeChild(textNode);
        }
      });
      
      // Add tooltips and click handlers to newly created glossary terms
      element.querySelectorAll('.glossary-term:not([data-initialized])').forEach(termSpan => {
        const termKey = termSpan.getAttribute('data-term');
        if (!termKey || !this.data.terms[termKey]) return;
        
        const termData = this.data.terms[termKey];
        
        // Create tooltip
        const tooltip = document.createElement('div');
        tooltip.className = 'glossary-tooltip';
        tooltip.textContent = termData.shortDescription;
        termSpan.appendChild(tooltip);
        
        // Add click handler
        termSpan.style.cursor = 'pointer';
        termSpan.setAttribute('data-initialized', 'true');
        termSpan.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          this.showDefinition(termKey);
        });
      });
    },

    // Show definition modal
    showDefinition(termKey) {
      if (!this.data || !this.data.terms[termKey]) return;
      
      const termData = this.data.terms[termKey];
      const modal = document.getElementById('glossary-modal');
      const title = document.getElementById('glossary-modal-title');
      const body = document.getElementById('glossary-modal-body');
      
      if (!modal || !title || !body) {
        console.warn('Glossary modal elements not found. Make sure modal HTML is included.');
        return;
      }
      
      title.textContent = termData.term;
      
      let bodyHTML = `
        <div class="glossary-modal-description">${termData.shortDescription}</div>
        <div class="glossary-modal-definition">
          <h3>Full Definition</h3>
          <div class="glossary-modal-definition-content">${termData.fullDescription}</div>
        </div>
      `;
      
      if (termData.definitionFile) {
        // Extract filename from path for foundation reader
        let filename = termData.definitionFile;
        // URL encode the filename
        const encodedFilename = encodeURIComponent(filename);
        // Append anchor if it exists
        const anchor = termData.anchor ? `#${termData.anchor}` : '';
        const readerUrl = `${termData.definitionFile}${anchor}`;
        
        bodyHTML += `<button class="glossary-modal-link" onclick="window.open('${readerUrl}', '_blank', 'width=${this.config.windowSize.width},height=${this.config.windowSize.height},resizable=yes,scrollbars=yes')">View Full Definition →</button>`;
      }
      
      body.innerHTML = bodyHTML;
      modal.classList.add('active');
    },

    // Setup modal handlers
    setupModalHandlers() {
      const modal = document.getElementById('glossary-modal');
      if (!modal) return;
      
      const closeBtn = document.getElementById('glossary-modal-close');
      if (closeBtn) {
        closeBtn.onclick = () => this.closeModal();
      }
      
      modal.onclick = (e) => {
        if (e.target === modal) this.closeModal();
      };
      
      // Close on Escape
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
          this.closeModal();
        }
      });
    },

    // Close modal
    closeModal() {
      const modal = document.getElementById('glossary-modal');
      if (modal) {
        modal.classList.remove('active');
      }
    },

    // Toggle glossary highlighting
    toggle() {
      this.enabled = !this.enabled;
      return this.enabled;
    },

    // Ensure modal HTML exists in document
    ensureModalHTML() {
      if (document.getElementById('glossary-modal')) return;
      
      const modalHTML = `
        <div id="glossary-modal" class="glossary-modal">
          <div class="glossary-modal-content">
            <div class="glossary-modal-header">
              <h2 class="glossary-modal-title" id="glossary-modal-title"></h2>
              <button class="glossary-modal-close" id="glossary-modal-close">&times;</button>
            </div>
            <div class="glossary-modal-body" id="glossary-modal-body"></div>
          </div>
        </div>
      `;
      
      document.body.insertAdjacentHTML('beforeend', modalHTML);
    }
  };

  // Export globally
  window.Glossary = Glossary;
})();

