# 华为网络自动化作业 - 代码说明

> 本次作业包含 **题1 (SSH/Paramiko)** 和 **题2 (NETCONF)** 两部分完整代码

---

## 📁 文件说明

| 文件 | 对应题目 | 协议 |
|------|---------|------|
| `task1_paramiko_ospfv3.py` | 题1 | SSH + Paramiko |
| `task2_netconf_ospfv3.py` | 题2 | NETCONF + ncclient |
| `README.md` | 使用说明 | - |

---

## 🖥️ eNSP 拓扑图参考

```
        R1
   2001:db8:1::1/64     2001:db8:2::1/64
   Gi0/0/0              Gi0/0/1
        |                    |
        | 2001:db8:1::2/64   | 2001:db8:2::2/64
        |                    |
   Gi0/0/0              Gi0/0/0
        R2                  R3
   2001:db8:3::1/64
   Gi0/0/1
        |
        | 2001:db8:3::2/64
        |
   Gi0/0/1
```

**eNSP 拓扑建议:**
- 3台 AR1220 路由器
- 每台路由器之间用 GE 线缆直连
- 每台路由器的 Gi0/0/0 和 Gi0/0/1 分别连接其他两台

---

## 🐍 环境准备 (Windows)

### 1. 安装 Python
- 下载 Python 3.8+: https://www.python.org/downloads/
- 安装时勾选 **Add Python to PATH**

### 2. 安装依赖库

打开 **命令提示符 (cmd)** 或 **PowerShell**，运行:

```bash
# 题1 依赖
pip install paramiko

# 题2 依赖
pip install ncclient

# 验证安装
python -c "import paramiko; print('paramiko OK')"
python -c "import ncclient; print('ncclient OK')"
```

如果网络慢，用阿里云镜像:
```bash
pip install paramiko ncclient -i https://mirrors.aliyun.com/pypi/simple/
```

### 3. 配置 eNSP

1. 打开 eNSP，新建拓扑
2. 拖入 3 台 AR1220 路由器
3. 用 GE 线缆连接:
   - R1 Gi0/0/0 ↔ R2 Gi0/0/0
   - R1 Gi0/0/1 ↔ R3 Gi0/0/0
   - R2 Gi0/0/1 ↔ R3 Gi0/0/1
4. 配置每台路由器的接口 IP (在 eNSP 里手动配置 或用代码自动配置)
5. 启动所有设备

### 4. 获取路由器 IP

在 eNSP 里，每台路由器的 **"控制面板"** 可以查看/设置 IP。
默认管理接口通常是:
- R1: 192.168.1.1
- R2: 192.168.1.2
- R3: 192.168.1.3

> ⚠️ 如果路由器没有 IP，需要先在 eNSP 里用 `interface X` + `ip address X.X.X.X 24` 手动配置一个管理 IP

---

## 🚀 运行代码

### 题1: SSH/Paramiko

```bash
python task1_paramiko_ospfv3.py
```

### 题2: NETCONF/ncclient

```bash
python task2_netconf_ospfv3.py
```

---

## 🔧 代码中的配置修改

在文件顶部的 `配置区` 修改路由器参数:

```python
# 题1 - 修改路由器 IP/端口/账号
ROUTERS = [
    {
        "host": "192.168.1.1",   # ← 修改为你的路由器 IP
        "port": 22,
        "username": "admin",
        "password": "admin123",
        "name": "R1",
    },
    ...
]

# 题2 - NETCONF 端口是 830 (不是 22!)
ROUTERS = [
    {
        "host": "192.168.1.1",
        "port": 830,   # ← NETCONF over SSH 端口
        ...
    }
]
```

---

## 📸 截图要求

作业要求提交以下截图:

1. **eNSP 拓扑图** - 设备运行状态
2. **接口状态截图** - `display ip interface brief` 或 NETCONF 查询结果
3. **OSPFv3 邻居截图** - `display ospfv3 peer`
4. **IPv6 路由表截图** - `display ipv6 routing-table`
5. **Ping 测试截图** - 全网互通的连通性测试

---

## ⚠️ 常见问题

### Q: 连接失败 "Authentication failed"
**A:** 检查代码里的用户名密码是否和 eNSP 路由器配置一致

### Q: 连接失败 "Connection refused"
**A:** 检查: 1) 路由器是否启动 2) IP 是否正确 3) SSH 端口是否放通

### Q: NETCONF 连接不上
**A:** 华为路由器默认可能没开启 NETCONF，确认在路由器上运行:
```
netconf ssh server enable
```

### Q: Paramiko 安装失败
**A:** 用管理员权限打开 cmd:
```
pip install --user paramiko
```

---

## 📊 SSH vs NETCONF 对比

| 特性 | SSH/Paramiko | NETCONF/ncclient |
|------|-------------|-----------------|
| 协议端口 | 22 | 830 |
| 数据格式 | 文本命令 | XML 结构化数据 |
| 操作方式 | 模拟终端 | RPC 调用 |
| 配置方式 | 命令行逐条 | 事务性批量配置 |
| 可视化 | 不支持 | 结构化输出 |

---

> 💡 代码由 庄英琪 AI 助手 生成 💎
> 有问题随时问！
