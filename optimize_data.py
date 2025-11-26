import json
import os
import shutil

# Configuration
DATA_DIR = 'data'
OUTPUT_DIR = 'data/optimized'
NOVELS = [
    'genius_grandson.json',
    'lazy_sovereign.json',
    'nano_machine.json'
]

def optimize_novel(filename):
    filepath = os.path.join(DATA_DIR, filename)
    if not os.path.exists(filepath):
        print(f"File not found: {filepath}")
        return

    print(f"Processing {filename}...")
    
    with open(filepath, 'r', encoding='utf-8') as f:
        data = json.load(f)

    # Create output directory for this novel
    novel_id = filename.replace('.json', '')
    novel_dir = os.path.join(OUTPUT_DIR, novel_id)
    chapters_dir = os.path.join(novel_dir, 'chapters')
    
    if os.path.exists(novel_dir):
        shutil.rmtree(novel_dir)
    os.makedirs(chapters_dir)

    # Create Index (Metadata + Chapter List without content)
    chapter_list = []
    for i, chapter in enumerate(data):
        chapter_list.append({
            'index': i,
            'title': chapter.get('title') or chapter.get('original_title') or f"Chapter {i+1}",
            'id': chapter.get('id')
        })
        
        # Save individual chapter content
        chapter_content = {
            'index': i,
            'title': chapter.get('title') or chapter.get('original_title'),
            'content': chapter.get('content', '')
        }
        
        with open(os.path.join(chapters_dir, f"{i}.json"), 'w', encoding='utf-8') as f:
            json.dump(chapter_content, f, ensure_ascii=False)

    # Save Index
    index_data = {
        'id': novel_id,
        'total_chapters': len(data),
        'chapters': chapter_list
    }
    
    with open(os.path.join(novel_dir, 'index.json'), 'w', encoding='utf-8') as f:
        json.dump(index_data, f, ensure_ascii=False)
    
    print(f"Finished {filename}: {len(data)} chapters processed.")

def main():
    if not os.path.exists(OUTPUT_DIR):
        os.makedirs(OUTPUT_DIR)
        
    for novel in NOVELS:
        optimize_novel(novel)

if __name__ == "__main__":
    main()
