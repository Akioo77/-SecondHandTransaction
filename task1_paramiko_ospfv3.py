#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
题1: Python + Paramiko (SSH) 配置华为路由器
- IPv6 地址配置
- OSPFv6 路由协议配置
- 查看网络接口状态
- 实现全网互通
"""

import paramiko
import time
import socket
from typing import List, Tuple

# ============ 配置区 ============
# 路由器列表 (IP, 端口, 用户名, 密码, 设备名)
ROUTERS = [
    {
        "host": "192.168.1.1",
        "port": 22,
        "username": "admin",
        "password": "admin123",
        "name": "R1",
    },
    {
        "host": "192.168.1.2",
        "port": 22,
        "username": "admin",
        "password": "admin123",
        "name": "R2",
    },
    {
        "host": "192.168.1.3",
        "port": 22,
        "username": "admin",
        "password": "admin123",
        "name": "R3",
    },
]

# 接口配置 (每个路由器的接口 IPv6 地址)
# 格式: {路由器名: [(接口名, IPv6地址, 前缀长度), ...]}
INTERFACE_CONFIGS = {
    "R1": [
        ("GigabitEthernet0/0/0", "2001:db8:1::1", 64),
        ("GigabitEthernet0/0/1", "2001:db8:2::1", 64),
    ],
    "R2": [
        ("GigabitEthernet0/0/0", "2001:db8:1::2", 64),
        ("GigabitEthernet0/0/1", "2001:db8:3::1", 64),
    ],
    "R3": [
        ("GigabitEthernet0/0/0", "2001:db8:2::2", 64),
        ("GigabitEthernet0/0/1", "2001:db8:3::2", 64),
    ],
}

# OSPFv6 配置
# 进程ID, 区域ID, 需要加入的接口
OSPFV6_CONFIGS = {
    "R1": {
        "process_id": 1,
        "area": 0,
        "interfaces": ["GigabitEthernet0/0/0", "GigabitEthernet0/0/1"],
        "router_id": "1.1.1.1",
    },
    "R2": {
        "process_id": 1,
        "area": 0,
        "interfaces": ["GigabitEthernet0/0/0", "GigabitEthernet0/0/1"],
        "router_id": "2.2.2.2",
    },
    "R3": {
        "process_id": 1,
        "area": 0,
        "interfaces": ["GigabitEthernet0/0/0", "GigabitEthernet0/0/1"],
        "router_id": "3.3.3.3",
    },
}


class HuaweiRouterSSH:
    """华为路由器 SSH 配置类"""

    def __init__(self, host: str, port: int, username: str, password: str, name: str):
        self.host = host
        self.port = port
        self.username = username
        self.password = password
        self.name = name
        self.client = None
        self.shell = None

    def connect(self) -> bool:
        """建立 SSH 连接"""
        print(f"[{self.name}] 正在连接 {self.host}:{self.port} ...")
        try:
            self.client = paramiko.SSHClient()
            self.client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
            self.client.connect(
                hostname=self.host,
                port=self.port,
                username=self.username,
                password=self.password,
                timeout=10,
                look_for_keys=False,
                allow_agent=False,
            )
            self.shell = self.client.invoke_shell()
            time.sleep(1)
            # 清空欢迎信息
            self.shell.recv(65535)
            print(f"[{self.name}] ✅ 连接成功!")
            return True
        except Exception as e:
            print(f"[{self.name}] ❌ 连接失败: {e}")
            return False

    def send_command(self, command: str, wait: float = 1.0) -> str:
        """发送命令并返回输出"""
        if not self.shell:
            return ""
        self.shell.send(command + "\n")
        time.sleep(wait)
        try:
            output = self.shell.recv(65535).decode("utf-8", errors="ignore")
            return output
        except:
            return ""

    def enter_system_view(self):
        """进入系统视图"""
        self.send_command("system-view", 1)
        # 可能需要输入密码
        self.send_command("admin", 0.5)
        self.send_command("admin123", 0.5)

    def configure_ipv6(self, interface: str, ipv6_addr: str, prefix_len: int):
        """配置接口 IPv6 地址"""
        print(f"[{self.name}] 配置 {interface} IPv6 地址: {ipv6_addr}/{prefix_len}")
        self.enter_system_view()

        # 进入接口视图
        self.send_command(f"interface {interface}", 1)
        # 使能 IPv6
        self.send_command("ipv6 enable", 1)
        # 配置 IPv6 地址
        self.send_command(f"ipv6 address {ipv6_addr}/{prefix_len}", 1)
        # 启用接口
        self.send_command("undo shutdown", 0.5)
        # 返回
        self.send_command("return", 0.5)
        self.send_command("quit", 0.5)
        print(f"[{self.name}] ✅ {interface} IPv6 配置完成")

    def configure_ospfv3(self, process_id: int, area: int, router_id: str):
        """配置 OSPFv3 路由协议"""
        print(f"[{self.name}] 配置 OSPFv3 进程 {process_id}, 区域 {area}, Router-ID {router_id}")
        self.enter_system_view()

        # 创建 OSPFv3 进程
        self.send_command(f"ospfv3 {process_id}", 1)
        # 配置 Router-ID
        self.send_command(f"router-id {router_id}", 1)
        # 退出进程视图
        self.send_command("return", 0.5)
        print(f"[{self.name}] ✅ OSPFv3 进程创建完成")

    def add_ospfv3_area(self, process_id: int, area: int, interface: str):
        """将接口加入 OSPFv3 区域"""
        print(f"[{self.name}] 将 {interface} 加入 OSPFv3 区域 {area}")
        self.enter_system_view()

        self.send_command(f"interface {interface}", 1)
        self.send_command(f"ospfv3 {process_id} area {area}", 1)
        self.send_command("return", 0.5)
        self.send_command("quit", 0.5)
        print(f"[{self.name}] ✅ {interface} 已加入 OSPFv3 区域")

    def check_interface_status(self) -> str:
        """查看接口状态"""
        print(f"[{self.name}] 查看接口状态...")
        self.enter_system_view()
        output = self.send_command("display ip interface brief", 1.5)
        print(f"[{self.name}] 接口状态:\n{output}")
        return output

    def check_ospfv3_neighbor(self) -> str:
        """查看 OSPFv3 邻居关系"""
        print(f"[{self.name}] 查看 OSPFv3 邻居...")
        self.enter_system_view()
        output = self.send_command("display ospfv3 peer", 1.5)
        print(f"[{self.name}] OSPFv3 邻居:\n{output}")
        return output

    def check_ipv6_routing_table(self) -> str:
        """查看 IPv6 路由表"""
        print(f"[{self.name}] 查看 IPv6 路由表...")
        self.enter_system_view()
        output = self.send_command("display ipv6 routing-table", 1.5)
        print(f"[{self.name}] IPv6 路由表:\n{output}")
        return output

    def ping_ipv6(self, target: str) -> bool:
        """Ping 目标 IPv6 地址"""
        print(f"[{self.name}] Ping {target} ...")
        self.enter_system_view()
        output = self.send_command(f"ping ipv6 {target}", 3)
        return "Unreachable" not in output and "Request time out" not in output

    def disconnect(self):
        """断开连接"""
        if self.client:
            self.client.close()
            print(f"[{self.name}] 已断开连接")


def configure_router(router_config: dict, interface_config: List[Tuple], ospfv3_config: dict):
    """配置单台路由器"""
    router = HuaweiRouterSSH(
        host=router_config["host"],
        port=router_config["port"],
        username=router_config["username"],
        password=router_config["password"],
        name=router_config["name"],
    )

    if not router.connect():
        return None

    # 1. 配置 IPv6 地址
    print(f"\n{'='*50}")
    print(f"[{router.name}] 开始配置 IPv6 地址...")
    for iface, ipv6_addr, prefix_len in interface_config:
        router.configure_ipv6(iface, ipv6_addr, prefix_len)

    # 2. 配置 OSPFv3
    print(f"\n{'='*50}")
    print(f"[{router.name}] 开始配置 OSPFv3...")
    router.configure_ospfv3(
        ospfv3_config["process_id"],
        ospfv3_config["area"],
        ospfv3_config["router_id"],
    )
    for iface in ospfv3_config["interfaces"]:
        router.add_ospfv3_area(
            ospfv3_config["process_id"],
            ospfv3_config["area"],
            iface,
        )

    # 3. 查看接口状态
    print(f"\n{'='*50}")
    router.check_interface_status()

    # 4. 查看 OSPFv3 邻居
    print(f"\n{'='*50}")
    router.check_ospfv3_neighbor()

    # 5. 查看 IPv6 路由表
    print(f"\n{'='*50}")
    router.check_ipv6_routing_table()

    return router


def main():
    print("=" * 60)
    print("  华为路由器网络自动化配置 - Paramiko/SSH 版本")
    print("  题1: IPv6 + OSPFv3 全网互通")
    print("=" * 60)

    routers = []

    # 依次配置每台路由器
    for router_cfg in ROUTERS:
        name = router_cfg["name"]
        router = configure_router(
            router_cfg,
            INTERFACE_CONFIGS.get(name, []),
            OSPFV3_CONFIGS.get(name, {}),
        )
        if router:
            routers.append(router)

    if not routers:
        print("❌ 没有路由器连接成功，配置终止")
        return

    # 全网互通测试
    print("\n" + "=" * 60)
    print("  全网互通测试 (Ping)")
    print("=" * 60)

    # 测试 R1 -> R2, R3
    test_targets = ["2001:db8:1::2", "2001:db8:2::2", "2001:db8:3::2"]
    for target in test_targets:
        routers[0].ping_ipv6(target)

    # 断开所有连接
    for router in routers:
        router.disconnect()

    print("\n" + "=" * 60)
    print("  ✅ 配置完成!")
    print("=" * 60)
    print("\n📝 下一步:")
    print("  1. 在 eNSP 中打开拓扑图，确认所有链路连通")
    print("  2. 在每台路由器上执行 display ospfv3 peer 确认邻居关系")
    print("  3. 执行 display ipv6 routing-table 确认路由表完整")
    print("  4. 截图保存以上三个命令的输出结果")
    print("  5. 打包提交: 源代码 + eNSP拓扑图 + 代码说明 + 运行截图")


if __name__ == "__main__":
    # 检查依赖
    try:
        import paramiko
        print(f"✅ Paramiko 版本: {paramiko.__version__}")
    except ImportError:
        print("❌ 请先安装 Paramiko: pip install paramiko")
        exit(1)

    main()
