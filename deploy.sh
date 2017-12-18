node /Users/go_songs/Documents/liuzhiyuan/quiver2hexo/quiver2hexo.js /Users/go_songs/Documents/liuzhiyuan/QuiverData/github.qvnotebook /Users/go_songs/Documents/liuzhiyuan/blog/yuan-blog/source

cd /Users/go_songs/Documents/liuzhiyuan/blog/yuan-blog
git add .
git commit -m '自动同步'
git push 
hexo clean
hexo deploy