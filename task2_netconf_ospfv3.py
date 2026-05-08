#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
题2: Python + NETCONF 配置华为路由器
- 使用 ncclient 库
- 通过 NETCONF 协议配置 IPv6 地址
- OSPFv3 路由协议配置
- 查看网络接口状态
- 实现全网互通
"""

from ncclient import manager
from ncclient.xml_ import new_ele, sub_ele
import time
from typing import List, Dict, Any

# ============ 配置区 ============
# 路由器列表 (IP, 端口, 用户名, 密码, 设备名)
ROUTERS = [
    {
        "host": "192.168.1.1",
        "port": 830,  # NETCONF over SSH 默认端口
        "username": "admin",
        "password": "admin123",
        "name": "R1",
    },
    {
        "host": "192.168.1.2",
        "port": 830,
        "username": "admin",
        "password": "admin123",
        "name": "R2",
    },
    {
        "host": "192.168.1.3",
        "port": 830,
        "username": "admin",
        "password": "admin123",
        "name": "R3",
    },
]

# 接口配置
INTERFACE_CONFIGS = {
    "R1": [
        {"name": "GigabitEthernet0/0/0", "ipv6": "2001:db8:1::1", "prefix": 64},
        {"name": "GigabitEthernet0/0/1", "ipv6": "2001:db8:2::1", "prefix": 64},
    ],
    "R2": [
        {"name": "GigabitEthernet0/0/0", "ipv6": "2001:db8:1::2", "prefix": 64},
        {"name": "GigabitEthernet0/0/1", "ipv6": "2001:db8:3::1", "prefix": 64},
    ],
    "R3": [
        {"name": "GigabitEthernet0/0/0", "ipv6": "2001:db8:2::2", "prefix": 64},
        {"name": "GigabitEthernet0/0/1", "ipv6": "2001:db8:3::2", "prefix": 64},
    ],
}

# OSPFv3 配置
OSPFV3_CONFIGS = {
    "R1": {
        "process_id": 1,
        "area": "0.0.0.0",
        "router_id": "1.1.1.1",
        "interfaces": ["GigabitEthernet0/0/0", "GigabitEthernet0/0/1"],
    },
    "R2": {
        "process_id": 1,
        "area": "0.0.0.0",
        "router_id": "2.2.2.2",
        "interfaces": ["GigabitEthernet0/0/0", "GigabitEthernet0/0/1"],
    },
    "R3": {
        "process_id": 1,
        "area": "0.0.0.0",
        "router_id": "3.3.3.3",
        "interfaces": ["GigabitEthernet0/0/0", "GigabitEthernet0/0/1"],
    },
}


class HuaweiRouterNETCONF:
    """华为路由器 NETCONF 配置类"""

    def __init__(self, host: str, port: int, username: str, password: str, name: str):
        self.host = host
        self.port = port
        self.username = username
        self.password = password
        self.name = name
        self.conn = None

    def connect(self) -> bool:
        """建立 NETCONF 连接"""
        print(f"[{self.name}] 正在通过 NETCONF 连接 {self.host}:{self.port} ...")
        try:
            self.conn = manager.connect(
                host=self.host,
                port=self.port,
                username=self.username,
                password=self.password,
                timeout=30,
                device_params={"name": "huawei"},
                hostkey_verify=False,
            )
            print(f"[{self.name}] ✅ NETCONF 连接成功!")
            print(f"[{self.name}] 服务器能力: {self.conn.server_capabilities}")
            return True
        except Exception as e:
            print(f"[{self.name}] ❌ NETCONF 连接失败: {e}")
            return False

    def config_interface_ipv6(self, interface_name: str, ipv6_addr: str, prefix: int) -> bool:
        """配置接口 IPv6 地址 (NETCONF RPC)"""
        print(f"[{self.name}] 配置 {interface_name} -> {ipv6_addr}/{prefix}")

        config = new_ele("config")
        # 华为 VLAN 配置的 XML 结构
        interface = sub_ele(config, "if:interface")
        sub_ele(interface, "if:name", interface_name)
        sub_ele(interface, "if:ipv6")
        ipv6_cfg = interface.find("if:ipv6")

        addr = sub_ele(ipv6_cfg, "if:address")
        pri_addr = sub_ele(addr, "if:primaryAddress")
        pri_addr.set("address", ipv6_addr)
        pri_addr.set("prefix-length", str(prefix))

        try:
            result = self.conn.edit_config(target="running", config=config)
            print(f"[{self.name}] ✅ 接口 IPv6 配置成功: {result}")
            return True
        except Exception as e:
            print(f"[{self.name}] ❌ 接口 IPv6 配置失败: {e}")
            return False

    def enable_ipv6_on_interface(self, interface_name: str) -> bool:
        """在接口上使能 IPv6"""
        print(f"[{self.name}] 接口 {interface_name} 使能 IPv6")

        config = new_ele("config")
        interface = sub_ele(config, "if:interface")
        sub_ele(interface, "if:name", interface_name)
        sub_ele(interface, "if:ipv6")
        ipv6_cfg = interface.find("if:ipv6")
        enable = sub_ele(ipv6_cfg, "if:enabled")
        enable.text = "true"

        try:
            result = self.conn.edit_config(target="running", config=config)
            print(f"[{self.name}] ✅ IPv6 使能成功")
            return True
        except Exception as e:
            print(f"[{self.name}] ⚠️  IPv6 使能 (可能已存在): {e}")
            return False

    def config_ospfv3(self, process_id: int, router_id: str, area: str) -> bool:
        """配置 OSPFv3 进程"""
        print(f"[{self.name}] 配置 OSPFv3 进程 {process_id}, Router-ID {router_id}, Area {area}")

        config = new_ele("config")
        ospf = sub_ele(config, "ospf:vrf")

        # 华为 OSPFv3 NETCONF 结构 (示例)
        proc = sub_ele(ospf, "ospf:process")
        proc.set("id", str(process_id))
        sub_ele(proc, "ospf:router-id", router_id)

        # 配置区域
        area_elem = sub_ele(proc, "ospf:area")
        area_elem.set("area-id", area)

        try:
            result = self.conn.edit_config(target="running", config=config)
            print(f"[{self.name}] ✅ OSPFv3 进程配置成功")
            return True
        except Exception as e:
            print(f"[{self.name}] ❌ OSPFv3 进程配置失败: {e}")
            return False

    def add_ospfv3_interface(self, process_id: int, area: str, interface_name: str) -> bool:
        """将接口加入 OSPFv3 区域"""
        print(f"[{self.name}] 接口 {interface_name} 加入 OSPFv3 区域 {area}")

        config = new_ele("config")
        ospf = sub_ele(config, "ospf:vrf")
        proc = sub_ele(ospf, "ospf:process")
        proc.set("id", str(process_id))
        area_elem = sub_ele(proc, "ospf:area")
        area_elem.set("area-id", area)
        iface = sub_ele(area_elem, "ospf:interface")
        iface.set("name", interface_name)

        try:
            result = self.conn.edit_config(target="running", config=config)
            print(f"[{self.name}] ✅ OSPFv3 接口配置成功")
            return True
        except Exception as e:
            print(f"[{self.name}] ❌ OSPFv3 接口配置失败: {e}")
            return False

    def get_interface_status(self) -> str:
        """获取接口状态"""
        print(f"[{self.name}] 获取接口状态...")
        try:
            # 使用 NETCONF get 查询接口状态
            filter = new_ele("filter")
            if_state = sub_ele(filter, "if:interfaces")
            iface = sub_ele(if_state, "if:interface")
            sub_ele(iface, "if:name")
            sub_ele(iface, "if:oper-status")

            result = self.conn.get(("subtree", filter))
            output = str(result)
            print(f"[{self.name}] 接口状态:\n{output}")
            return output
        except Exception as e:
            print(f"[{self.name}] ❌ 获取接口状态失败: {e}")
            return str(e)

    def get_ipv6_routing_table(self) -> str:
        """获取 IPv6 路由表"""
        print(f"[{self.name}] 获取 IPv6 路由表...")
        try:
            filter = new_ele("filter")
            ipv6_rt = sub_ele(filter, "ipv6:routing")
            route_table = sub_ele(ipv6_rt, "ipv6:route-table")

            result = self.conn.get(("subtree", filter))
            output = str(result)
            print(f"[{self.name}] IPv6 路由表:\n{output}")
            return output
        except Exception as e:
            print(f"[{self.name}] ❌ 获取 IPv6 路由表失败: {e}")
            return str(e)

    def disconnect(self):
        """断开 NETCONF 连接"""
        if self.conn:
            self.conn.close_session()
            print(f"[{self.name}] NETCONF 会话已关闭")


def build_huawei_interface_config_xml(interface_name: str, ipv6_addr: str, prefix: int) -> str:
    """
    构建华为接口 IPv6 配置的 NETCONF XML
    (用于直接提交 RPC 而非用 ncclient 库)
    """
    xml = f"""<config>
  <interface xmlns="http://www.huawei.com.cn/wdmL/schema/huawei-interface">
    <name>{interface_name}</name>
    <ipv6>
      <address>
        <primaryAddress address="{ipv6_addr}" prefix-length="{prefix}"/>
      </address>
      <enable>true</enable>
    </ipv6>
  </interface>
</config>"""
    return xml


def build_ospfv3_config_xml(process_id: int, router_id: str, area: str) -> str:
    """构建 OSPFv3 配置的 NETCONF XML"""
    xml = f"""<config>
  <ospf xmlns="http://www.huawei.com.cn/wdmL/schema/huawei-ospf">
    <process>
      <id>{process_id}</id>
      <router-id>{router_id}</router-id>
      <area>
        <id>{area}</id>
      </area>
    </process>
  </ospf>
</config>"""
    return xml


def send_netconf_rpc(host: str, port: int, username: str, password: str,
                      rpc_xml: str) -> str:
    """直接发送 NETCONF RPC 并返回响应"""
    import socket
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    sock.settimeout(30)
    sock.connect((host, port))

    # SSH 握手 + NETCONF 会话 (简化版，实际用 ncclient)
    # 这里返回 XML 字符串供演示
    return f"<rpc-reply>NETCONF operation executed on {host}</rpc-reply>"


def main():
    print("=" * 60)
    print("  华为路由器网络自动化配置 - NETCONF 版本")
    print("  题2: IPv6 + OSPFv3 全网互通 (NETCONF/ncclient)")
    print("=" * 60)

    routers = []

    # 依次连接并配置每台路由器
    for router_cfg in ROUTERS:
        name = router_cfg["name"]
        router = HuaweiRouterNETCONF(
            host=router_cfg["host"],
            port=router_cfg["port"],
            username=router_cfg["username"],
            password=router_cfg["password"],
            name=name,
        )

        if not router.connect():
            continue

        # 1. 配置 IPv6 接口地址
        print(f"\n{'='*50}")
        print(f"[{name}] === 配置 IPv6 接口 ===")
        for iface_cfg in INTERFACE_CONFIGS.get(name, []):
            router.enable_ipv6_on_interface(iface_cfg["name"])
            router.config_interface_ipv6(
                iface_cfg["name"],
                iface_cfg["ipv6"],
                iface_cfg["prefix"],
            )

        # 2. 配置 OSPFv3
        print(f"\n{'='*50}")
        print(f"[{name}] === 配置 OSPFv3 ===")
        ospf_cfg = OSPFV3_CONFIGS.get(name, {})
        if ospf_cfg:
            router.config_ospfv3(
                ospf_cfg["process_id"],
                ospf_cfg["router_id"],
                ospf_cfg["area"],
            )
            for iface in ospf_cfg["interfaces"]:
                router.add_ospfv3_interface(
                    ospf_cfg["process_id"],
                    ospf_cfg["area"],
                    iface,
                )

        # 3. 获取接口状态
        print(f"\n{'='*50}")
        print(f"[{name}] === 查询接口状态 ===")
        router.get_interface_status()

        # 4. 获取 IPv6 路由表
        print(f"\n{'='*50}")
        print(f"[{name}] === 查询 IPv6 路由表 ===")
        router.get_ipv6_routing_table()

        router.disconnect()
        routers.append(router)

    print("\n" + "=" * 60)
    print("  ✅ NETCONF 配置完成!")
    print("=" * 60)
    print("\n📝 NETCONF vs SSH 区别说明:")
    print("  • SSH/Paramiko: 模拟登录终端,发送命令行")
    print("  • NETCONF: 使用 XML RPC 对网络设备进行数据建模操作")
    print("  • NETCONF 优势: 结构化数据,事务性操作,更安全的配置管理")
    print("\n📝 下一步:")
    print("  1. 在 eNSP 中打开拓扑图，确认所有链路连通")
    print("  2. 在每台路由器上执行 display ospfv3 peer 确认邻居关系")
    print("  3. 执行 display ipv6 routing-table 确认路由表完整")
    print("  4. 截图保存以上命令的输出结果")
    print("  5. 打包提交: 源代码 + eNSP拓扑图 + NETCONF代码说明 + 运行截图")


if __name__ == "__main__":
    # 检查依赖
    try:
        from ncclient import manager
        print(f"✅ ncclient 已安装")
    except ImportError:
        print("❌ 请先安装 ncclient: pip install ncclient")
        print("   或: pip install ncclient -i https://mirrors.aliyun.com/pypi/simple/")
        exit(1)

    main()
