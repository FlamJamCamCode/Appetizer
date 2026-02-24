


function add_shortcut_link_button() {
	var links = document.getElementsByTagName("a");
	if(!links) return;

	for(i = 0; i < links.length; i++) {
		if(links[i].href.indexOf("?") != -1) {
			continue;
		}
		const file_index = links[i].href.search(/\/([^\/]*\.md)/)+1
		const last_href_part = links[i].href.slice(file_index)

		let huh = manifest.map((a) => { 
			return [a, a.title.split(/\W/).reduce((acc, e) => {
				if(e && last_href_part.search(e) != -1) {
					return acc + e.length/a.title.length
				}
				return acc
			}, 0.0)];
		}).filter((a) => {
			return a[0] && a[1] > 0
		})
		let highscoring = huh.reduce(([target, highscore], [a,score]) => { 
			return score > highscore ? [a, score] : [target, highscore]
		}, [Object, 0.0])

		if(huh.length > 1) { 
			const r = (len) => { return Math.floor(Math.random()*len)};
			const random_next = () => {
				ra = r(huh.length)
				console.log(`Spinning Wheel of Fortune (#${ra}/${huh.length}): ${huh}`)
				return huh[ra][0] == highscoring[0] 
				? huh[(ra + 1 + r(huh.length - 1)) % huh.length] 
				: huh[ra];
			}
			if(true) {
				shortcuts = huh.reduce((acc, el) => {
					acc.push(el[0].shortcut)
					return acc;
				}, []);
				// console.log(shortcuts.join(","))

				links[i].outerHTML += `<button onclick="window.open('/?f='+['`
				+shortcuts.join("','")
				+"']"
				+"[Math.floor(Math.random()*"
				+shortcuts.length
				+`)], '_blank', 'width=${READER_X},height=${READER_Y},resizable=yes,scrollbars=yes')">⧝</button>`;
			} else {
				// Per page load
				random_chosen = random_next();

				links[i].outerHTML += `<button onclick="window.open('/?f=${random_chosen[0].shortcut}&hs=${random_chosen[1]}', '_blank', 'width=${READER_X},height=${READER_Y},resizable=yes,scrollbars=yes')">⧝</button>`;
			}
		}
		if(huh.length > 0) {
			links[i].outerHTML += `<button onclick="window.open('/?f=${highscoring[0].shortcut}&hs=${highscoring[1]}', '_blank', 'width=${READER_X},height=${READER_Y},resizable=yes,scrollbars=yes')">→</button>`;
		}
	}
}
