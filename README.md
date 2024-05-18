# KNKPAnime-js-adapters

通过运行一个JavaScript解释器，KNKPAnime可以支持通过JS脚本来自定义视频播放源。你甚至可以用node的包来编写JS的适配器，只要做到以下几点：

## 必须的接口

**注意，程序代码与JS代码间通过JSON沟通，此处使用TypeScript的Class语法仅为说明作用**

``` javascript
// 给定关键词，搜索匹配的视频。返回值定义参见Series。
async function search(keyword): Series[];

// 给定在Series中返回的seriesId，获取视频源。返回值定义参见Source、Episode。
async function getSources(seriesId): Source[];

// 对于不启用Webview的适配器：给定在Episode中返回的episodeId，获取视频资源URL。
// 对于启用Webview的适配器：给定在Episode中返回的episodeId，返回该视频播放页面的网址。
async function getVideoResource(episodeId): string;

// 获取该适配器的信息，即名字、描述以及是否使用WebView。
function getConfig(): Config;
```

## 返回值

**注意，程序代码与JS代码间通过JSON沟通，此处使用TypeScript的Class定义仅为说明作用**

``` typescript
// 一个视频系列（一季番剧、一季电视剧、一部电影，etc.）
class Series {
    seriesId: string;       // Adapter定义的seriesId，如何定义这个id取决于你，只要下一步能通过这个id搜到视频源就可以。
    name: string;           // 这个视频的名字。E.g., 轻音少女
    description?: string;   // 视频简介，可选。
    image?: string;         // 视频封面，可选。
}

// 部分网站支持多个视频播放源（例如xx云、xx网盘等）。为了最大的拓展性，我们也支持加载多个视频源。如果仅有一个，那就返回一个 
class Source {
    episodes: Episode[];    // 该视频源提供的所有集。
    sourceName?: string;    // 视频源名字，可选。
}

class Episode {
    episodeId: string;      // 类似seriesId，由adapter自定义的id，用于获取视频资源链接。
    episode: int;           // 该集在系列中的index。E.g., 第一集的episode为0
    episodeName?: string;   // 该集名字，可选。
}

class Config {
    name: string;           // 该适配器名字。**不允许重名**。
    description?: string;   // 对该适配器的描述，将展示在搜索界面。
    useWebview: bool = false;//是否使用Webview。
}
```

## 注意事项

在写完一个适配器的js源代码后，还需要做一些工作让主程序的dart代码能够正确调用你的js适配器：

- 将写好的js代码打包，使它们可以在不import任何其他库的情况下仅使用一个js解释器运行。有不少bundler可以选择，我在这个库里使用了webpack，同时也有rollup.js等其他工具可以达到同样的功能。
- 将上面提到的四个函数export，并确保打包后生成的库名为adapter。在主程序中，将会使用`adapter.search(keyword)`的方式调用js函数。

## Finally

把你的适配器代码的url加到主程序里，看看能不能跑吧。