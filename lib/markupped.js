(function() {
	function parseMarkdown() {
		elements = document.querySelector(".markdown");
		if (!elements) console.warn("MarkUpped included but no markdown classed elements");
		
		// Convert markdown to HTML
		for(el in elements){
			el.innerHTML = el.innerHTML
			// Bullet lists
			// .replace(/\n/g, '||')
			.replace(/\n(\s?)[•-]([^\n]+)/g, '||-||$1$2|-|')
			.replace(/\|-\|\|\|-\|\|/g, '</li><li>')
			.replace(/\|\|-\|\|/g, '<ul><li>')
			.replace(/\|-\|/g, '</li></ul>')
			// Bold **text** or __text__
			.replace(/######(.+?)/g, '<h6>$1</h6>')
			.replace(/#####(.+?)/g, '<h5>$1</h5>')
			.replace(/####(.+?)/g, '<h4>$1</h4>')
			.replace(/###(.+?)/g, '<h3>$1</h3>')
			.replace(/##(.+?)/g, '<h2>$1</h2>')
			.replace(/#(.+?)/g, '<h1>$1</h1>')
			.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
			.replace(/__(.+?)__/g, '<em>$1</em>')
			// Italic *text* or _text_
			.replace(/\*(.+?)\*/g, '<italic>$1</italic>')
			.replace(/_(.+?)_/g, '<em>$1</em>')
			// Emoji/icon shortcuts
			.replace(/💬/g, '<span style="font-size:1.3em; margin-right:8px;">💬</span>')
			.replace(/📊/g, '<span style="font-size:1.3em; margin-right:8px;">📊</span>')
			.replace(/📈/g, '<span style="font-size:1.3em; margin-right:8px;">📈</span>')
			.replace(/🔬/g, '<span style="font-size:1.3em; margin-right:8px;">🔬</span>')
			.replace(/⚠️/g, '<span style="font-size:1.3em; margin-right:8px;">⚠️</span>')
			.replace(/→/g, '<span style="color:var(--accent); font-weight:bold; margin:0 8px;">→</span>')
			// Links [text](url) or [text → file]
			.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" style="color:var(--secondary);text-decoration:underline;">$1</a>')
			// Line breaks
			.replace(/\n\n/g, '</p><p>') // Markdown is always embedded in a paragraph in this setup
			.replace(/\n/g, '<br>');
		}	
	}
        document.addEventListener('popstate', () => {console.log("CHAAAANGE")} );
    let scrollTimeout;
    window.addEventListener('scroll', () => {
	clearTimeout(scrollTimeout);
	scrollTimeout = setTimeout(() => {
	    console.log("Update Markdown")
	}, 10);
    }, { passive: true });
})();
