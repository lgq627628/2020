## 从 0 到 1 实现一套 CI/CD 流程

## 什么是 CI
CI 的意思是 持续构建 。负责拉取代码库中的代码后，执行用户预置定义好的操作脚本，通过一系列编译操作构建出一个 制品 ，并将制品推送至到制品库里面。常用工具有 Gitlab CI，Github CI，Jenkins 等。这个环节不参与部署，只负责构建代码，然后保存构建物。构建物被称为 制品，保存制品的地方被称为 “制品库”

## 什么是 CD
持续部署（Continuous Deployment） 和 持续交付（Continuous Delivery） 。 持续交付 的概念是：将制品库的制品拿出后，部署在测试环境 / 交付给客户提前测试。 持续部署 则是将制品部署在生产环境。可以进行持续部署的工具也有很多： Ansible 批量部署， Docker 直接推拉镜像等等。当然也包括我们后面要写到的 Kubernetes 集群部署。

## 什么是 Docker
Docker 是一个开源的应用容器引擎。开发者可以将自己的应用打包在自己的镜像里面，然后迁移到其他平台的 Docker 中。镜像中可以存放你自己自定义的运行环境，文件，代码，设置等等内容，再也不用担心环境造成的运行问题。镜像共享运行机器的系统内核。
同样， Docker 也支持跨平台。你的镜像也可以加载在 Windows 和 Linux，实现快速运行和部署。
Docker 的优势在于 快速，轻量，灵活。开发者可以制作一个自己自定义的镜像，也可以使用官方或者其他开发者的镜像来启动一个服务。通过将镜像创建为容器，容器之间相互隔离资源和进程不冲突。但硬件资源又是共享的。 创建的镜像也可以通过文件快速分享，也可以上传到镜像库进行存取和管理。同时 Docker 的镜像有 分层策略 ，每次对镜像的更新操作，都会堆叠一个新层。当你拉取 / 推送新版本镜像时，只推送 / 拉取修改的部分。大大加快了镜像的传输效率。

## Docker 在 CI/CD 中的作用
我们可以使用 Docker 将应用打包成一个镜像，交给 Kubernetes 去部署在目标服务集群。并且可以将镜像上传到自己的镜像仓库，做好版本分类处理。

## 什么是 Jenkins
Jenkins 是一个基于 Java 语言开发的持续构建工具平台，主要用于持续、自动的构建/测试你的软件和项目。它可以执行你预先设定好的设置和构建脚本，也可以和 Git 代码库做集成，实现自动触发和定时触发构建。

## 什么是 Kubernetes？
Kubernetes 是 Google 开源的一个容器编排引擎，它支持自动化部署、大规模可伸缩、应用容器化管理。在生产环境中部署一个应用程序时，通常要部署该应用的多个实例以便对应用请求进行负载均衡。
通俗些讲，可以将 Kubernetes 看作是用来是一个部署镜像的平台。可以用来操作多台机器调度部署镜像，大大地降低了运维成本。
一个形象的比喻：如果你将 docker 看作是飞机，那么 kubernetes 就是飞机场。在飞机场的加持下，飞机可以根据机场调度选择在合适的时间降落或起飞。
在 Kubernetes 中，可以使用集群来组织服务器的。集群中会存在一个 Master 节点，该节点是 Kubernetes 集群的控制节点，负责调度集群中其他服务器的资源。其他节点被称为 Node ， Node 可以是物理机也可以是虚拟机。



关闭 Swap 分区。 Swap 是 Linux 的交换分区，在系统资源不足时，Swap 分区会启用。这操作会拖慢我们的应用性能。
应该让新创建的服务自动调度到集群的其他 Node 节点中去，而不是使用 Swap 分区。这里我们将它关闭掉：



接着使用 ntpdate 来统一我们的系统时间和时区，服务器时间与阿里云服务器对齐。


前面我们在配置文件中，有提到过配置Pod子网络，Flannel 主要的作用就是如此。它的主要作用是通过创建一个虚拟网络，让不同节点下的服务有着全局唯一的IP地址，且服务之前可以互相访问和连接。

## 部署 Kubernetes 集群
Kubernetes 集群 = Master（1个） + Node（多个）
其实 Master 和 Node 差不多，只是用途不同，都需要初始化、安装 Flannel、运行

流量会首先进入 VM（主机），随后进入 Service 中，接着 Service 再去将流量调度给匹配的 Pod 。




，我们部署了 deployment 和 Service，实现了对服务的访问。但是在实际使用中，我们还会根据请求路径前缀的匹配，权重，甚至根据 cookie/header 的值去访问不同的服务。为了达到这种负载均衡的效果，我们可以使用 k8s 的另一个组件 —— ingress

在日常开发中，我们经常会遇到路径分流问题。例如当我们访问 /a 时，需要返回A服务的页面。访问 /b，需要返回服务B的页面。这时候，我们就可以使用 k8s 中的 ingress 去实现。

在这里，我们选择 ingress-nginx。 ingress-nginx 是基于 nginx 的一个 ingress 实现。当然也可以实现正则匹配路径，流量转发，基于 cookie header 切分流量（灰度发布）。

```yaml
./gray.yaml

apiVersion: extensions/v1beta1
kind: Ingress
metadata:
  name: nginx-demo-canary
  annotations:
    kubernetes.io/ingress.class: nginx
    nginx.ingress.kubernetes.io/rewrite-target: /
    nginx.ingress.kubernetes.io/canary: "true"
    nginx.ingress.kubernetes.io/canary-by-cookie: "users_from_Beijing"
spec:
  rules:
  - http:
      paths: 
       - backend:
          serviceName: front-service-v2
          servicePort: 80
  backend:
     serviceName: front-service-v2
     servicePort: 80
```
我们可以看到，在 annotations 这里，有两个关于灰度的配置项。分别是：

通过 cookie 灰度
nginx.ingress.kubernetes.io/canary：可选值为 true / false 。代表是否开启灰度功能
nginx.ingress.kubernetes.io/canary-by-cookie：灰度发布 cookie 的 key。当 key 值等于 always 时，灰度触发生效。等于其他值时，则不会走灰度环境。

通过 header 灰度
nginx.ingress.kubernetes.io/canary-by-header：要灰度 header 的 key 值
nginx.ingress.kubernetes.io/canary-by-header-value: 要灰度 header 的 value 值

基于权重切分流量
nginx.ingress.kubernetes.io/canary-weight：值是字符串，为 0-100 的数字，代表灰度环境命中概率。如果值为 0，则表示不会走灰度。值越大命中概率越大。当值 = 100 时，代表全走灰度。

如果同时配置三种方案，k8s 会优先去匹配 header ，如果未匹配则去匹配 cookie ，最后是 weight


## 滚动发布
滚动发布，则是我们一般所说的无宕机发布。其发布方式如同名称一样，一次取出一台/多台服务器（看策略配置）进行新版本更新。当取出的服务器新版确保无问题后，接着采用同等方式更新后面的服务器。

优点
不需要停机更新，无感知平滑更新。
版本更新成本小。不需要新旧版本共存
缺点
更新时间长：每次只更新一个/多个镜像，需要频繁连续等待服务启动缓冲（详见下方平滑期介绍）
旧版本环境无法得到备份：始终只有一个环境存在
回滚版本异常痛苦：如果滚动发布到一半出了问题，回滚时需要使用同样的滚动策略回滚旧版本。



在 Kubernetes 中，有一种发布方式为 Recreate 。这种发布方式比较暴力，它会直接把所有旧的 Pod 全部杀死。杀死后再批量创建新的 Pod 。
这种发布方式相对滚动发布偏暴力。且在发布空窗期（杀死旧Pod，新Pod还没创建成功的情况下）服务会不可用。


## 什么是健康度检查？
Kubernetes 里面内置了三种健康度探针，可以分别在启动时和运行时为我们的 Pod 做检测。下面是一个对比表格：

探针名称	在哪个环节触发	      作用	                            检测失败对Pod的反应
存活探针	Pod 运行时	        检测服务是否崩溃，是否需要重启服务  	杀死 Pod 并重启
可用探针	Pod 运行时	        检测服务是不是允许被访问到。	       停止Pod的访问调度，不会被杀死重启
启动探针	Pod 运行时	        检测服务是否启动成功	              杀死 Pod 并重启


## Kubernetes Secret：储存你的机密信息
可是，我们在部署时，难免会遇到一些要存放机密内容的需求。例如我们的数据库密码，用户名密码，公钥私钥，token 等等机密内容，甚至还有我们 docker  私有库的密码。而这些内容，显然是不能写死在代码里面，更不可能明文挂载进去的。

那么我们有没有什么好的解决方案能够使用呢？这一章我们就来学习 Kubernetes 中的一个概念 —— Secret 

什么是 Secret
Secret 是 Kubernetes 内的一种资源类型，可以用它来存放一些机密信息（密码，token，密钥等）。信息被存入后，我们可以使用挂载卷的方式挂载进我们的 Pod 内。当然也可以存放docker私有镜像库的登录名和密码，用于拉取私有镜像。

## Kubernetes DNS 策略：将你的服务连接起来
前几章，我们已经实现了对一个单体应用的部署。可是，我们的项目中还经常遇到以下几种情况：

我要用Nginx做负载均衡，如何才能转发到别的服务上面？ 我的后端需要MySQL数据库，我怎样才能连接到同级服务的数据库呢？ ......

这些场景都有个共性问题： A服务 依赖另一个 B服务 ，而我们常常不知道 B服务 的端口和IP，且端口和IP也相对不固定有可能经常更改。

这时候，我们就需要一个神器 —— 服务发现（和 DNS 一个意思）

其实我们日常上网，DNS服务器 将域名映射为真实IP的过程，就是一个服务发现的过程。而我们再也不需要记住每个网站的IP，只需要记住永远不会更改的域名即可。

那么在 Kubernetes 中，如何做服务发现呢？我们前面写到过， Pod 的 IP 常常是漂移且不固定的，所以我们要使用 Service 这个神器来将它的访问入口固定住。

但是，我们在部署 Service 时，也不知道部署后的ip和端口如何。那么在 Kubernetes 中，我们可以利用 DNS 的机制给每个 Service 加一个内部的域名，指向其真实的IP。

## Kubernetes ConfigMap：统一管理服务环境变量
在第10章中，我们学习了如何上手 Kubernetes Secret。我们都知道，Kubernetes Secret 的主要作用是来存放密码，密钥等机密信息。

但是在日常开发部署时，我们还会遇到一些环境变量的配置：例如你的数据库地址，负载均衡要转发的服务地址等等信息。这部分内容使用 Secret 显然不合适，打包在镜像内耦合又太严重。这里，我们可以借助 Kubernetes ConfigMap 来配置这项事情

什么是 ConfigMap
ConfigMap 是 Kubernetes 的一种资源类型，我们可以使用它存放一些环境变量和配置文件。信息存入后，我们可以使用挂载卷的方式挂载进我们的 Pod 内，也可以通过环境变量注入。和 Secret 类型最大的不同是，存在 ConfigMap 内的内容不会加密。

## Kubernetes 污点与容忍：更好地分配集群资源
自动调度集群节点部署很不错。但我其中几台服务器计划只给后端服务准备使用，这要怎么调度呢? > 后端服务依赖的服务器配置都很高，让前端服务也能调度过去显然不合适。如何干预 Pod 部署到指定的其中几个服务器上去呢？.......

这种问题在实际情况中还比较常见的。因为架构设计，前端服务器所需资源低一些是常事。而资源强占总是不合理的。

这时候我们就需要借助 Kubernetes 中的污点与容忍度去实现了。
什么是污点？容忍度又是什么？
我们一般说污点，一般指生活中的脏东西。但是在 Kubernetes 中，污点的意义却有所不同。

在 Kubernetes 中， Pod 被部署到 Node 上面去的规则和逻辑是由 Kubernetes 的调度组件根据 Node 的剩余资源，地位，以及其他规则自动选择调度的。但是有时候在设计架构时，前端和后端往往服务器资源的分配都是不均衡的，甚至有的服务只能让特定的服务器来跑。

在这种情况下，我们选择自动调度是不均衡的，就需要人工去干预匹配选择规则了。这时候，就需要在给 Node 添加一个叫做污点的东西，以确保 Node 不被 Pod 调度到。

当你给 Node 设置一个污点后，除非给 Pod 设置一个相对应的**容忍度，**否则 Pod 才能被调度上去。这也就是污点和容忍的来源。

污点的格式是 key=value，可以自定义自己的内容，就像是一组 Tag 一样。**




## 使用 docker 部署前端
https://q.shanyue.tech/engineering/749.html
```dockerfile
# 指定 node 版本号，满足宿主环境
FROM node:16-alpine

# 指定工作目录，将代码添加至此
WORKDIR /code
ADD . /code

# 如何将项目跑起来
RUN npm install
RUN npm run build
CMD npm start

# 暴露出运行的端口号，可对外接入服务发现
EXPOSE 8080
```
运行 docker
```zsh
# 构建镜像
$ docker build -t fe-app .

# 运行容器
$ docker run -it --rm fe-app
```
问题：
- 使用 node:16 作为基础镜像过于奢侈，占用体积太大，而最终产物 (js/css/html) 无需依赖该镜像。可使用更小的 nginx 镜像做多阶段构建。
- 多个 RUN 命令，不利于 Docker 的镜像分层存储。可合并为一个 RUN 命令
- 每次都需要 npm i，可合理利用 Docker 缓存，ADD 命令中内容发生改变将会破坏缓存。可将 package.json 提前移至目标目录，只要 package.json/lockfile 不发生变动，将不会重新 npm i
  
```dockerfile
FROM node:16-alpine as builder

WORKDIR /code

ADD package.json package-lock.json /code/
RUN npm install

ADD . /code

RUN npm run build

# 选择更小体积的基础镜像
FROM nginx:alpine

# 将构建产物移至 nginx 中
COPY --from=builder code/build/ /usr/share/nginx/html/
```


## 灰度实际配置

具体的反向代理和负载均衡的实现方式可以根据具体的应用场景和技术栈来选择和调整，下面给出一个简单的示例，以 Nginx 为例：

1. 配置反向代理

在 Nginx 的配置文件中，可以使用 location 指令配置反向代理规则，例如：

```
http {
  upstream backend {
    server backend1.example.com;
    server backend2.example.com;
  }

  server {
    listen 80;
    server_name frontend.example.com;

    location / {
      proxy_pass http://backend;
    }
  }
}
```

在上面的例子中，我们配置了一个名为 backend 的 upstream，其中包含两个后端服务器 backend1.example.com 和 backend2.example.com。然后在 server 指令中，配置了一个名为 frontend.example.com 的虚拟主机，并使用 location 指令将所有请求转发到 backend 反向代理服务器上。在转发请求时，Nginx 会根据反向代理规则将请求转发到对应的后端服务器上。

2. 配置负载均衡

在 Nginx 的配置文件中，可以使用 upstream 指令配置负载均衡规则，例如：

```
http {
  upstream backend {
    least_conn;
    server backend1.example.com weight=5;
    server backend2.example.com;
    server backend3.example.com;
  }

  server {
    listen 80;
    server_name frontend.example.com;

    location / {
      proxy_pass http://backend;
    }
  }
}
```

在上面的例子中，我们配置了一个名为 backend 的 upstream，使用 least_conn 策略对请求进行负载均衡，即优先将请求转发到当前连接数最少的后端服务器上。同时，我们还可以配置每个后端服务器的权重，例如将 backend1.example.com 的权重设置为 5，表示优先将请求转发到该服务器上。在配置负载均衡时，还可以使用其他的负载均衡策略，例如 round-robin 等。

3. 对用户进行分组

在进行反向代理和负载均衡时，需要对用户进行合理的分组和控制，避免出现过多的异常情况和性能问题。具体的分组方式可以根据实际情况来选择和调整，例如可以根据用户的 IP 地址、设备类型、登录状态等信息来进行分组。在分组时，可以使用 Nginx 的变量和条件指令来进行控制，例如：

```
http {
  upstream backend {
    server backend1.example.com;
    server backend2.example.com;
  }

  server {
    listen 80;
    server_name frontend.example.com;

    location / {
      if ($remote_addr ~* "^192\.168\.") {
        proxy_pass http://backend1;
      }
      if ($http_user_agent ~* "mobile") {
        proxy_pass http://backend2;
      }
      proxy_pass http://backend;
    }
  }
}
```

在上面的例子中，我们使用 $remote_addr 变量和正则表达式来判断用户的 IP 地址，如果 IP 地址以 192.168. 开头，就将请求转发到 backend1 反向代理服务器上；使用 $http_user_agent 变量和正则表达式来判断用户的设备类型，如果设备类型为 mobile，就将请求转发到 backend2 反向代理服务器上；否则将请求转发到默认的 backend 反向代理服务器上。在进行分组时，还可以使用其他的变量和条件指令进行控制，例如 $cookie、$http_referer 等。

需要注意的是，在进行反向代理和负载均衡时，需要考虑到安全性和性能问题，避免出现潜在的漏洞和性能问题。同时也需要进行充分的测试和评估，确保新功能的可靠性和效果。