导出 quiver 笔记到 hexo, 支持导出静态资源.

脚本依赖:
+ [Quiver](http://happenapps.com/) - 程序员专用笔记本, 售价: $9.99, 这里分享一个破解版: [Quiver v3.0.5](./assets/Quiver.app.zip);
+ [Hexo](https://hexo.io/) - 快速、简洁且高效的博客框架;

## 如何使用

```bash
# 下载代码
git clone git@github.com:liuzhiyuan1993/quiver2hexo.git

# 安装依赖
cd quiver2hexo
npm install

# 启动脚本
node quiver2hexo.js quiver_qvnotebook_path hexo_source_path
```

参数说明:

+ `quiver_qvnotebook_path`: 笔记本的路径, 在 Quiver 中创建一个笔记本, 在 `设置` -> `Sync` -> `Library Location` 选项中可以看到笔记本的绝对路径;
+ `hexo_source_path`: hexo `source` 文件夹的绝对路径;

注意: **脚本会清空 `hexo_path/source/_post` 文件夹, 请事先备份**.

示例脚本: `deploy.sh`, 可以设置 alias 使用更方便.

## 预览
Quiver 预览:
![](./assets/demo1.png)

Hexo 预览:
![](./assets/demo2.png)
