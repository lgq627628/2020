## nginx 的负载均衡

通过 proxy_pass 与 upstream 即可实现最为简单的负载均衡。如下配置会对流量均匀地导向 172.168.0.1，172.168.0.2 与 172.168.0.3 三个服务器

http {
  upstream backend {
      server 172.168.0.1;
      server 172.168.0.2;
      server 172.168.0.3;
  }

  server {
      listen 80;
      location / {
          proxy_pass http://backend;
      }
  }
}
关于负载均衡的策略大致有以下四种种

round_robin，轮询
weighted_round_robin，加权轮询
ip_hash
least_conn
## Round_Robin
轮询，nginx 默认的负载均衡策略就是轮询，假设负载三台服务器节点为 A、B、C，则每次流量的负载结果为 ABCABC

## Weighted_Round_Robin
加权轮询，根据关键字 weight 配置权重，如下则平均没来四次请求，会有八次打在 A，会有一次打在 B，一次打在 C

upstream backend {
  server 172.168.0.1 weight=8;
  server 172.168.0.2 weight=1;
  server 172.168.0.3 weight=1;
}
## IP_hash
对每次的 IP 地址进行 Hash，进而选择合适的节点，如此，每次用户的流量请求将会打在固定的服务器上，利于缓存，也更利于 AB 测试等。

upstream backend {
  server 172.168.0.1;
  server 172.168.0.2;
  server 172.168.0.3;
  ip_hash;
}
## Least Connection
选择连接数最少的服务器节点优先负载

upstream backend {
  server 172.168.0.1;
  server 172.168.0.2;
  server 172.168.0.3;
  least_conn;
}