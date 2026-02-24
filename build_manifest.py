import os
import json
import re
EXCLUDE_FILENAMES = ["index.html", "index.js", "index.css", "script.js", "style.css", "manifest.json"]
EXCLUDE_FILENAMES.sort()
for subfolder in ['foundations', 'immersion']:
    ROOT = os.path.join('system share', subfolder)
    MANIFEST_PATH = os.path.join(ROOT, 'manifest.json')
    SUPPORTED_MEDIA = {
        'markdown': {'.md', '.markdown'},
        'video': {'.mp4', '.webm', '.mov', '.m4v'},
        'image': {'.png', '.jpg', '.jpeg', '.gif', '.webp'},
        'audio': {'.mp3', '.wav', '.ogg', '.flac'},
        'html': {'.html', '.htm'},
        'text': {'.txt'},
        'code': {'.js', '.ts', '.css', '.json'}
    }

    def classify_media(extension):
        ext = extension.lower()
        for media_type, extensions in SUPPORTED_MEDIA.items():
            if ext in extensions:
                return media_type
        return 'other'

    def first_number(astr):
        i,j = (0,-1)
        for c in astr:
            if c.isdigit():
                if j == -1:
                    j = i
            elif j != -1:
                if not c.isalnum():
                    return astr[j:i]
            i += 1
        return astr if j != -1 else ''

    def starting_alnum(astr):
        if not astr or not astr[0].isdigit():
            return ''
        i = 1
        for c in astr[1::]:
            if not c.isalnum():
                return astr[0:i]
            i += 1
        return astr 

    def acronymize(astr, width=2):
        if len(astr) < 5:
            return astr

        w = width 
        s = ''.join([
                        ''.join([
                            i[0:w] 
                            for i in re.split('[-_ ]', j)
                        ])+"_" 
                        for j in re.split('/', astr)
                    ])[0:-1]
        if len(s) == width:
            return astr[0:5]

        return s

    def get_ing(astr):
        if not astr:
            return ''

        c = astr.find('.')
        if c >= 0:
            astr = astr[0:c]

        return astr[-3:]

    def shortcutize(filename, rel_dir = ''):
        # rel_dir_snum || snum ||  
        filename = filename.replace(rel_dir, '').strip()
        snum = starting_alnum(filename)
        if snum and rel_dir: # if r'[0-9]+[a-zA-Z]*' start then {relative_folder_acronym}_{alphanumeric}
            return f"{acronymize(rel_dir)}_{snum}"
        elif snum: # 'a browser' folder lateral location allow simply alphanumeric shortcut if enumerated list starting number
            return f"{snum}"
        elif rel_dir: # else if relative dir fun acronyming
            return f"{acronymize(rel_dir)}_{acronymize(filename, width=1)}{get_ing(filename)}"
        else: # crazy name
            return f"{acronymize(filename, width=2)}{get_ing(filename)}"



    entries = []

    for dirpath, _, filenames in os.walk(ROOT):
        rel_dir = os.path.relpath(dirpath, ROOT)
        if rel_dir == '.':
            rel_dir = ''

        for filename in filenames:
            if filename in EXCLUDE_FILENAMES:
                continue
            rel_path = os.path.join(rel_dir, filename) if rel_dir else filename
            name_no_ext, ext = os.path.splitext(filename)
            fname_no_ext = name_no_ext.replace('_', ' ').replace('-', ' ')

            media_type = classify_media(ext)

            entries.append({
                'title': fname_no_ext,
                'fileName': filename,
                'shortcut': shortcutize(fname_no_ext, rel_dir),
                'legacy_shortcut': f"{rel_dir}_{first_number(filename)}" if first_number(filename) and rel_dir else (first_number(filename) if first_number(filename) else f"{filename[:4]}{filename[max(4,filename.rindex('.')-5):filename.rindex('.')]}"),
                'path': rel_path.replace('\\', '/'),
                'category': rel_dir.split(os.sep)[0] if rel_dir else subfolder.title(),
                'mediaType': media_type
            })

    entries.sort(key=lambda item: (
        item['category'].lower(),
        item['path'].lower()
    ))

    with open(MANIFEST_PATH, 'w', encoding='utf-8') as manifest_file:
        json.dump(entries, manifest_file, ensure_ascii=False, indent=2)

    print(f"Wrote {len(entries)} entries to {MANIFEST_PATH}")
