[Quiver](https://github.com/HappenApps/Quiver) is a notebook app for programmers,

[Hexo](https://github.com/hexojs/hexo) is a blog framework,

The purpose of this repository is to migrate Quiver files to Hexo,

So I can write at Quiver and auto deploy to Github pages.

## How to use

```bash
pip3 install html2text progress

# Step 1: specify your quiver notebook path at quiver2hexo.py#10
# Step 2: specify your Hexo source path at quiver2hexo.py#12
# Step 3: run quiver2hexo.py
python3 quiver2hexo.py
```

Output:

```
➜  quiver2hexo (master) ✗ python3 quiver2hexo.py
Migration start Quiver2Hexo...

Processing:  |################                | 1/2

Migration success! 👌
```
