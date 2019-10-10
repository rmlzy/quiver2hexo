import re
import os
import time
import shutil
import json
import html2text
from progress.bar import Bar

# Please specify your quiver notebook path
book_path = './sample.qvnotebook'
# Please specify your Hexo source path
output_path = './source'


post_path = f'{output_path}/_posts'
resource_path = f'{output_path}/images'
h = html2text.HTML2Text()


def reset_output_dir():
    # create output dir if not exist
    if os.path.isdir(output_path):
        shutil.rmtree(output_path)

    os.mkdir(output_path)
    os.mkdir(post_path)
    os.mkdir(resource_path)


def parse_json_file(path):
    if not os.path.isfile(path):
        print(f"ERROR: {path} not exist!")
        exit(0)

    data = {}
    with open(path, 'r') as f:
        data = json.load(f)
        f.close()
    return data


def migrate_book():
    book = parse_json_file(f"{book_path}/meta.json")
    print(f"Migration start {book['name']}...\n")

    note_paths = os.listdir(book_path)
    if len(note_paths) == 0:
        print("WARNING: book is empty!")
        exit(0)

    bar = Bar('Processing: ', max=len(note_paths))

    for note_path in note_paths:
        if os.path.isdir(f"{book_path}/{note_path}"):
            meta = parse_json_file(f"{book_path}/{note_path}/meta.json")
            meta_title = meta['title'] or '无标题笔记'
            meta_tags = meta['tags'] or ''
            meta_date = time.strftime(
                '%Y-%m-%d %H:%M:%S',
                time.localtime(meta['created_at'])
            )
            content = parse_json_file(f"{book_path}/{note_path}/content.json")

            # copy resources
            res_path = f"{book_path}/{note_path}/resources"
            if os.path.isdir(res_path):
                for res_file in os.listdir(res_path):
                    shutil.copy(
                        f"{res_path}/{res_file}",
                        f"{resource_path}/{res_file}"
                    )

            # handle multiple content
            md = ''
            for cell in content['cells']:
                c_type = cell['type']
                c_data = cell['data']
                if c_type == 'markdown':
                    md += c_data
                if c_type == 'text':
                    # replace quiver url to hexo style
                    filter_data = re.sub(
                        r'quiver-image-url/|quiver-file-url/',
                        '/images/',
                        c_data
                    )
                    md += h.handle(filter_data)
                if c_type == 'code':
                    md += f"\n```{cell['language']}\n{c_data}\n```"
                if c_type == 'diagram':
                    md += f"\n```{cell['diagramType']}\n{c_data}\n```"
                md += '\n'

            note_name = note_path.replace('.qvnote', '')
            post_name = f"{post_path}/{note_name}.md"
            with open(post_name, 'w') as f:
                f.truncate()
                f.write(
                    f"""---\ntitle: {meta_title}\ndate: {meta_date}\ntags: {meta_tags}\n---\n\n""")
                f.write(md)
                f.close()

            bar.next()
            time.sleep(0.3)
    bar.finish()
    print("\nMigration success! 👌")


if __name__ == '__main__':
    reset_output_dir()
    migrate_book()
