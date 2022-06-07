# LSE-Backend

## 准备工作

- 将数据集解压
- 从网上下载一个中文词向量，命名为 sgns.wiki.bigram-char.txt，放到某一个目录下
- 下载插件 [ik-analyzer](https://github.com/medcl/elasticsearch-analysis-ik)，将解压后的目录命名为 `ik`，并放到某个父目录下

## 构建方法

本系统使用 docker-compose 构建。

构建之前，请先在项目根目录下放置一个 `.env` 文件，内容示例如下：

```bash
# Password for the 'elastic' user (at least 6 characters)
ELASTIC_PASSWORD=xxxxxxxx

# Version of Elastic products
STACK_VERSION=8.2.2

# Set the cluster name
CLUSTER_NAME=docker-cluster

# Port to expose LSE backend HTTP API to the host
BACKEND_PORT=9000

# Port to expose apidoc static website to the host
APIDOC_PORT=3000

# Path to elastic plugins
PLUGINS_PATH=/path-to-your-plugins

# Path to dataset
DATASET_PATH=/home/unidy/repos/lse-backend/dataset

# Path to word2vec
WORD2VEC_PATH=/home/unidy/repos/lse-backend/word2vec

# Increase or decrease based on the available host memory (in bytes)
MEM_LIMIT=1073741824

```

随后，执行以下命令即可启动系统。

```bash
docker-compose up
```

## 导入数据

在正式提供服务前，需要先导入数据。

```bash
docker exec -it lse-backend-backend yarn setup-demo-data [N]
```

其中，`N` 为可选参数，表示导入文本数的上限。
